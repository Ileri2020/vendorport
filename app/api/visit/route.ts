"use server";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fingerprint, userAgent } = body;

        if (!fingerprint) {
            return NextResponse.json(
                { error: "Fingerprint is required" },
                { status: 400 }
            );
        }

        // Get today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get IP address from request headers
        const ipAddress =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown";

        // Try to create a visit record
        // The unique constraint on [fingerprint, visitDate] will prevent duplicates
        try {
            const visit = await prisma.visit.create({
                data: {
                    fingerprint,
                    visitDate: today,
                    userAgent: userAgent || null,
                    ipAddress: ipAddress,
                },
            });

            return NextResponse.json({
                success: true,
                message: "Visit tracked",
                visitId: visit.id,
            });
        } catch (error: any) {
            // If error is due to unique constraint, it means visit already tracked today
            if (error.code === "P2002") {
                return NextResponse.json({
                    success: false,
                    message: "Visit already tracked for today",
                });
            }

            throw error;
        }
    } catch (error) {
        console.error("Visit tracking error:", error);
        return NextResponse.json(
            { error: "Failed to track visit" },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve visit statistics
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get("days") || "30");

        // Get date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Get visits in date range
        const visits = await prisma.visit.findMany({
            where: {
                visitDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                visitDate: "desc",
            },
        });

        // Group by date
        const visitsByDate: Record<string, number> = {};

        visits.forEach((visit) => {
            const dateKey = visit.visitDate.toISOString().split("T")[0];
            visitsByDate[dateKey] = (visitsByDate[dateKey] || 0) + 1;
        });

        // Get total unique visitors
        const uniqueVisitors = await prisma.visit.groupBy({
            by: ["fingerprint"],
            where: {
                visitDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        return NextResponse.json({
            totalVisits: visits.length,
            uniqueVisitors: uniqueVisitors.length,
            visitsByDate,
            days,
        });
    } catch (error) {
        console.error("Visit stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch visit statistics" },
            { status: 500 }
        );
    }
}
