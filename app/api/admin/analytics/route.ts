import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const metric = searchParams.get("metric");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Default to last 30 days if not provided
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(new Date().setDate(endDate.getDate() - 30));

    try {
        let data;

        switch (metric) {
            case "revenue":
                data = await getRevenue(startDate, endDate);
                break;
            case "orders":
                data = await getOrders(startDate, endDate);
                break;
            case "cart-status":
                data = await getCartStatusCounts(startDate, endDate);
                break;
            case "profit":
                data = await getProfit(startDate, endDate);
                break;
            case "visits":
                data = await getVisits(startDate, endDate);
                break;
            case "products":
                data = await getTopProducts(startDate, endDate);
                break;
            case "refunds":
                data = await getRefunds(startDate, endDate);
                break;
            case "kpi":
                data = await getKPIs(startDate, endDate);
                break;
            default:
                return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

async function getRevenue(from: Date, to: Date) {
    const payments = await prisma.payment.findMany({
        where: {
            createdAt: { gte: from, lte: to },
            cart: { status: "paid" },
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    // Basic aggregation by day could be done here or on client. 
    // Returning raw points for client flexibility as requested by "Raw + Derived" philosophy
    return payments.map(p => ({
        date: p.createdAt,
        revenue: p.amount,
    }));
}

async function getOrders(from: Date, to: Date) {
    const carts = await prisma.cart.findMany({
        where: {
            createdAt: { gte: from, lte: to },
        },
        select: { status: true, createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    return carts.map(c => ({
        date: c.createdAt,
        status: c.status,
    }));
}

async function getCartStatusCounts(from: Date, to: Date) {
    const counts = await prisma.cart.groupBy({
        by: ["status"],
        where: {
            createdAt: { gte: from, lte: to },
        },
        _count: true,
    });

    return counts.map(c => ({
        name: c.status,
        value: c._count,
    }));
}

async function getProfit(from: Date, to: Date) {
    // This is expensive, so limit range or cache in production
    const paidCarts = await prisma.cart.findMany({
        where: {
            status: "paid",
            createdAt: { gte: from, lte: to },
        },
        include: {
            payment: true,
            products: {
                include: {
                    product: {
                        include: { stock: true },
                    },
                },
            },
        },
    });

    return paidCarts.map((cart) => {
        const payment = cart.payment;
        const revenue = payment?.amount || 0;

        let totalCost = 0;

        if (cart.products && Array.isArray(cart.products)) {
            totalCost = cart.products.reduce((sum, item) => {
                const stock = item.product?.stock?.[0];
                const costPerItem = stock?.costPerProduct || 0;
                return sum + (item.quantity * costPerItem);
            }, 0);
        }

        return {
            date: cart.createdAt,
            revenue,
            cost: totalCost,
            profit: revenue - totalCost,
        };
    });
}

async function getVisits(from: Date, to: Date) {
    // Grouping by day for efficiency? 
    // Prisma doesn't do date truncation group by easily without raw query.
    // Let's fetch and map for now.
    const visits = await prisma.visit.findMany({
        where: { visitDate: { gte: from, lte: to } },
        select: { visitDate: true },
        orderBy: { visitDate: 'asc' }
    });

    // We can return raw timestamps or aggregate. Let's return timestamps.
    return visits.map(v => v.visitDate);
}

async function getTopProducts(from: Date, to: Date) {
    const items = await prisma.cartItem.groupBy({
        by: ['productId'],
        where: {
            cart: {
                status: 'paid',
                createdAt: { gte: from, lte: to }
            }
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10
    });

    // Hydrate names
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true }
    });

    return items.map(item => {
        const p = products.find(prod => prod.id === item.productId);
        return {
            name: p?.name || 'Unknown',
            sales: item._sum.quantity || 0
        };
    });
}

async function getRefunds(from: Date, to: Date) {
    const refunds = await prisma.refund.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: { amount: true, createdAt: true }
    });
    return refunds.map(r => ({ date: r.createdAt, amount: r.amount }));
}

async function getKPIs(from: Date, to: Date) {
    const revenueAgg = await prisma.payment.aggregate({
        where: { createdAt: { gte: from, lte: to }, cart: { status: 'paid' } },
        _sum: { amount: true }
    });

    const ordersCount = await prisma.cart.count({
        where: { createdAt: { gte: from, lte: to }, status: 'paid' }
    });

    const refundAgg = await prisma.refund.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { amount: true }
    });

    const userCount = await prisma.user.count({
        where: { createdAt: { gte: from, lte: to } }
    });

    // Total active users (all time) could be useful too, but let's stick to time range for "New Users"
    // Or just total users in general? The spec says "Active Users".
    const totalUsers = await prisma.user.count();

    return {
        totalRevenue: revenueAgg._sum.amount || 0,
        totalOrders: ordersCount,
        totalRefunds: refundAgg._sum.amount || 0,
        newUsers: userCount,
        totalUsers
    };
}
