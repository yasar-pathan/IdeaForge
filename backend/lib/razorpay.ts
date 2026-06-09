import Razorpay from 'razorpay';

const getRazorpayClient = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });
};

let _razorpay: ReturnType<typeof getRazorpayClient> | null = null;

export const razorpay = new Proxy({} as ReturnType<typeof getRazorpayClient>, {
  get(_target, prop, receiver) {
    if (!_razorpay) {
      _razorpay = getRazorpayClient();
    }
    return Reflect.get(_razorpay, prop, receiver);
  },
});

export const PLANS = {
  pro:     { id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_PRO!, price: 49900, name: 'Pro', limit: 15 },
  founder: { id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_FOUNDER!, price: 149900, name: 'Founder', limit: 999 },
} as const;
