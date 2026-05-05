import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  pro:     { id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_PRO!, price: 49900, name: 'Pro', limit: 15 },
  founder: { id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_FOUNDER!, price: 149900, name: 'Founder', limit: 999 },
} as const;
