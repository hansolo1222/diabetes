import Stripe from 'stripe';

const stripe = require('stripe')('sk_test_51PqSKjB9wdU2ATtotEJ1CoFX4flGUKGnTa5nxQnIQBbjQmYV5MgO1YEDQ847v2fndw5tMSaplmYTcBy7sWrcSGcc00GTlJZIJI', {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd', // Ensure you set the correct currency
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) { // 添加类型注解
    console.error('Error creating payment intent:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} // Make sure this closing brace is present
