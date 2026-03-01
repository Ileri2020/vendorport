import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotification } from "@/lib/nodemailer";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderDetails } = body;

        if (!orderDetails) {
            return NextResponse.json(
                { error: "Order details are required" },
                { status: 400 }
            );
        }

        await sendOrderNotification(process.env.ORDER_RECEIVER_EMAIL, orderDetails);
        await sendOrderNotification('adepojuololade2020@gmail.com', orderDetails);

        return NextResponse.json({ success: true, message: "Notification sent" });
    } catch (error) {
        console.error("Failed to send notification:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
