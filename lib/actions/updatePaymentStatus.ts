"use server"
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27',
});

export async function updatePaymentStatus(paymentIntentId: string) {
  console.log('Update payment status action called');

  try {
    await prisma.$connect()
    console.log('Database connected successfully in update-payment-status action')
  } catch (error) {
    console.error('Failed to connect to the database in update-payment-status action:', error)
    return { error: "Database connection failed" };
  }

  const session = await getServerSession(authOptions);
  console.log('User session:', session);

  if (!session || !session.user?.email) {
    console.log('Not authenticated');
    return { error: "Not authenticated" };
  }

  try {
    console.log('Received paymentIntentId:', paymentIntentId);

    // Verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('Sending payment status to stripe')
    if (paymentIntent.status !== 'succeeded') {
      return { error: "Payment not successful" };
    }

    // Update user's payment status
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { hasPaid: true },
    });

    console.log('Updated user:', updatedUser);

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Failed to update payment status:", error);
    return { error: "Failed to update payment status", details: error instanceof Error ? error.message : String(error) };
  }
}