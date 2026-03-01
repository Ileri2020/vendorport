import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const model = searchParams.get("model");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!model) {
        return NextResponse.json({ error: "Missing model" }, { status: 400 });
    }

    try {
        if (model === "cart") {
            // Fetch list of carts for the user, optimized for list view
            const carts = await prisma.cart.findMany({
                where: { userId: userId },
                select: {
                    id: true,
                    total: true,
                    status: true,
                    createdAt: true,
                    _count: {
                        select: { products: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(carts);
        }

        // Future extension:
        // if (model === "orders") { ... }

        return NextResponse.json({ error: "Invalid model type" }, { status: 400 });

    } catch (error) {
        console.error("User Data API Error:", error);
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }
}
