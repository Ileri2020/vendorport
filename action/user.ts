//  @ts-nocheck
"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { compare, hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isRedirectError } from "next/dist/client/components/redirect";

const login = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return "Please provide both email and password";
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Login error:", error);
    return "Invalid credentials";
  }
};

const register = async (formData: FormData) => {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!username || !email || !password) {
    throw new Error("Please fill all fields");
  }

  // existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) throw new Error("User already exists");

  const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
  const hashedPassword = await hash(password, saltRounds);

  await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });
  console.log(`User created successfully 🥂`);
  redirect("/login");
};

export { register, login };

