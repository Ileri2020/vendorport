import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const ALLOWED_USER_FIELDS = ["name", "email", "password", "image", "contact"] as const;

function sanitizeUserPayload(body: Record<string, any>) {
  const payload: Record<string, any> = {};

  for (const field of ALLOWED_USER_FIELDS) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  if (payload.password) {
    payload.password = bcrypt.hashSync(payload.password, 10);
  }

  payload.role = "customer";

  if (payload.name === undefined || payload.name === null || payload.name === "") {
    payload.name = payload.email || "New User";
  }

  return payload;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const payload = sanitizeUserPayload({ ...body, email });
    const createdUser = await prisma.user.create({ data: payload });

    return NextResponse.json({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      image: createdUser.image,
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
