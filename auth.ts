// @ts-nocheck
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from '@auth/prisma-adapter';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email/Contact", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.email; // This will hold either email or contact
        const password = credentials?.password;
        if (!identifier || !password) throw new Error("Please provide email/contact & password");

        // Try finding by email first, then by contact
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { contact: identifier }
            ]
          }
        });

        if (!user) throw new Error("Invalid email/contact or password");
        
        // Differentiate OAuth users who haven't set a password
        if (!user.password) {
          throw new Error("SocialLoginOnly");
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) throw new Error("Invalid email/contact or password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          contact: user.contact,
          role: user.role,
          image: user.image,
          providerid: user.providerid,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    }),
  ],

  callbacks: {
    // Persist all user info in the JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
        token.contact = user.contact ?? null;
        token.role = user.role ?? null;
        token.image = user.image ?? null;
        token.providerid = user.providerid ?? null;
      }
      return token;
    },

    // Make the token info available in the session object
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string ?? null;
        session.user.email = token.email as string ?? null;
        session.user.contact = token.contact as string ?? null;
        session.user.role = token.role as string ?? null;
        session.user.image = token.image as string ?? null;
        session.user.providerid = token.providerid as string ?? null;
        
        // Fetch addresses here instead of storing in JWT
        session.user.addresses = await prisma.shippingAddress.findMany({
          where: { userId: token.id as string },
        });
        session.user.shippingAddress = session.user.addresses[0] || null;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export const runtime = "nodejs";
