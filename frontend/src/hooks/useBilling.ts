import { useState } from 'react';
import { toast } from 'sonner';

type RazorpayCheckoutSuccess = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type RazorpayPaymentFailed = {
  error: { description?: string };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', cb: (response: RazorpayPaymentFailed) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export function useBilling() {
  const [loading, setLoading] = useState(false);

  const checkout = async (planId: 'pro' | 'founder') => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: 'IdeaForge',
        description: `Upgrade to ${planId.toUpperCase()}`,
        prefill: {
          name: data.prefill?.name || '',
          email: data.prefill?.email || '',
          contact: data.prefill?.phone || '',
        },
        handler: async function (response: RazorpayCheckoutSuccess) {
          const verifyRes = await fetch('/api/billing/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            toast.success('Subscription active!');
            window.location.reload();
          } else {
            toast.error('Payment verification failed');
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout failed to load');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayPaymentFailed) {
        toast.error('Payment failed: ' + (response.error.description || 'Unknown error'));
      });
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading };
}
