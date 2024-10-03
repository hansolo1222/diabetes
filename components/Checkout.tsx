'use client';


import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CheckoutProps {
  onSuccess: (paymentIntentId: string) => void;

  options: {
    style: {
      base: {
        fontSize: string;
        color: string;
        '::placeholder': {
          color: string;
        };
      };
      invalid: {
        color: string;
      };
    };
  };
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, options }) => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);
    
    if (!cardElement) {
      console.error('Card element not found');
      setLoading(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        console.error(error);
        alert('Payment failed. Please try again.');
      } else {
        console.log('PaymentMethod:', paymentMethod);
        
        // Create a PaymentIntent on the server
        const response = await fetch('/api/recommend/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: 1000 }), // $10 in cents
        });

        const { clientSecret } = await response.json();

        // Confirm the payment on the client
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });

        if (confirmError) {
          console.error(confirmError);
          alert('Payment confirmation failed. Please try again.');
        } else {
          alert('Payment successful!');
          onSuccess(clientSecret.split('_secret_')[0]); // This extracts the paymentIntentId
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred while processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const elementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <CardNumberElement
          options={{
            showIcon: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1 bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <CardExpiryElement options={elementStyle} />
        </div>
        <div className="flex-1 bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <CardCvcElement options={elementStyle} />
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-500 text-white py-3 px-4 rounded-md text-lg font-semibold hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Pay $10'}
      </button>
    </form>
  );
};

export default Checkout;