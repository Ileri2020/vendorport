"use server";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "@/lib/nodemailer";

const prisma = new PrismaClient();

// Generate a 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists with this email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a password (if they have one, they don't need this flow)
    if (user.password) {
      return NextResponse.json(
        { error: "User already has a password. Please use regular login." },
        { status: 400 }
      );
    }

    // Check if user signed up via OAuth (Google/Facebook)
    // In the User model, providerid is used for OAuth ID. 
    // If it's present, it means they might have signed up with OAuth.
    // Logic: If they have no password AND have a providerid, they likely signed up via OAuth and want to add a password.
    // Or if they just have no password.
    
    // Original logic:
    // if (!user.providerid) {
    //   return NextResponse.json(
    //     { error: "This account was not created via Google or Facebook" },
    //     { status: 400 }
    //   );
    // }

    // Delete any existing unverified codes for this email
    await prisma.emailVerificationCode.deleteMany({
      where: {
        email,
        verified: false,
      },
    });

    // Generate new verification code
    const code = generateVerificationCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Save the code to database
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code,
        expires,
      },
    });

    // Send email using centralized function
    await sendVerificationEmail(email, code, user.name || "User");

    return NextResponse.json(
      {
        message: "Verification code sent to your email",
        requiresVerification: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}

