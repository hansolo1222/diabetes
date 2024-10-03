'use client';


import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Checkout from './Checkout';
import { updatePaymentStatus } from '@/lib/actions/updatePaymentStatus';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

const stripePromise = loadStripe(stripePublishableKey);

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

interface StripeWrapperProps {
  onSuccess: () => void;
}
function StripeWrapper({ onSuccess }: StripeWrapperProps) {
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const result = await updatePaymentStatus(paymentIntentId);
      
      if (result.success) {
        console.log('Payment status updated:', result);
        onSuccess();
      } else {
        console.error('Failed to update payment status:', result.error);
        alert('Payment successful, but failed to update status. Please contact support.');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('An error occurred while updating payment status. Please contact support.');
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="w-full max-w-md mx-auto bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Pay $10 to see if you can eat food without raising blood sugar</h2>
        <Checkout options={cardElementOptions} onSuccess={handlePaymentSuccess} />
      </div>
    </Elements>
  );
}
 

export default StripeWrapper;