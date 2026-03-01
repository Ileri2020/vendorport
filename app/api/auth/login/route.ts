"use server"
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();





export async function POST(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  // const formData = await req.formData
  // const file = formData.
  
  // Destructure and provide defaults
  const model = searchParams.get('model') || null;
  const id = searchParams.get('id') || null;
  // const body = searchParams.get('body') || null;

  // Parse JSON body
  let body = null;
  try {
    body = await req.json(); // This reads the JSON payload
  } catch (err) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // const email = body.email

  const { method } = req; 
  console.log("in db handler",model, id, method, body)

  
  try {
    const data = body;
    
    // Find user by email or contact
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { contact: body.email }
        ]
      },
    });

    // User not found
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid email/contact or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // User exists but has no password (OAuth user)
    if (!user.password) {
      return new Response(
        JSON.stringify({
          error: 'No password set',
          requiresEmailVerification: true,
          email: user.email,
          message: 'This account was created with Google or Facebook. Please verify your email to set a password.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // User has password, verify it
    const isValid = await bcrypt.compare(body.password, user.password);
    
    if (isValid) {
      const updatedUser = user;
      return new Response(JSON.stringify(updatedUser), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid email/contact or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to Login' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

}



