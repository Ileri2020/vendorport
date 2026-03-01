"use server"
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, password } = body;

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: 'Email, code, and password are required' },
        { status: 400 }
      );
    }

    // Find the verification code
    const verificationCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
        code,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (verificationCode.expires < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with new password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Mark verification code as used
    await prisma.emailVerificationCode.update({
      where: { id: verificationCode.id },
      data: { verified: true },
    });

    // Clean up old verification codes for this email
    await prisma.emailVerificationCode.deleteMany({
      where: {
        email,
        verified: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Password set successfully. You can now login with your email and password.',
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying code and setting password:', error);
    return NextResponse.json(
      { error: 'Failed to verify code and set password' },
      { status: 500 }
    );
  }
}
