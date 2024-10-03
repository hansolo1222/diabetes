import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',

});

export async function POST(req: Request) {
  console.log('Update payment status route called');

  // Add this database connection check
  try {
    await prisma.$connect()
    console.log('Database connected successfully in update-payment-status route')
  } catch (error) {
    console.error('Failed to connect to the database in update-payment-status route:', error)
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  console.log('User session:', session);

  if (!session || !session.user?.email) {
    console.log('Not authenticated');
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { paymentIntentId } = await req.json();
    console.log('Received paymentIntentId:', paymentIntentId);

    // Verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('sending payment status to stripe')
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    // Update user's payment status
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { hasPaid: true },

    });

    console.log('Updated user:', updatedUser);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Failed to update payment status:", error);
    return NextResponse.json({ error: "Failed to update payment status", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}