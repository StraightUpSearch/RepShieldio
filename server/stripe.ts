import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey);
  console.log('💳 Stripe configured for payment processing');
} else {
  console.log('💳 Stripe not configured - payments will use manual fallback');
}

export function isStripeConfigured(): boolean {
  return !!stripe;
}

export async function createTicketCheckoutSession(params: {
  ticketId: number;
  amount: number; // in cents
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  if (!stripe) throw new Error('Stripe not configured');

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `RepShield Removal - Ticket #${params.ticketId}`,
          description: params.description,
        },
        unit_amount: params.amount,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      ticketId: String(params.ticketId),
      type: 'ticket_payment',
    },
  });
}

export async function createCreditPurchaseSession(params: {
  userId: string;
  credits: number;
  amount: number; // in cents
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  if (!stripe) throw new Error('Stripe not configured');

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `RepShield Credits - ${params.credits} scan credits`,
        },
        unit_amount: params.amount,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      userId: params.userId,
      credits: String(params.credits),
      type: 'credit_purchase',
    },
  });
}

export async function createSubscriptionCheckoutSession(params: {
  userId: string;
  planId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  if (!stripe) throw new Error('Stripe not configured');

  const priceMap: Record<string, string | undefined> = {
    basic: process.env.STRIPE_PRICE_BASIC,
    pro: process.env.STRIPE_PRICE_PRO,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  };

  const priceId = priceMap[params.planId];
  if (!priceId) throw new Error(`No Stripe price configured for plan: ${params.planId}`);

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      userId: params.userId,
      planId: params.planId,
      type: 'subscription',
    },
  });
}

export async function cancelStripeSubscription(subscriptionId: string): Promise<void> {
  if (!stripe) throw new Error('Stripe not configured');
  await stripe.subscriptions.cancel(subscriptionId);
}

export async function constructWebhookEvent(payload: Buffer | string, signature: string): Promise<Stripe.Event> {
  if (!stripe) throw new Error('Stripe not configured');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('Stripe webhook secret not configured');
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export const CREDIT_PACKAGES = [
  { id: 'credits_10', credits: 10, price: 4900, label: '10 Scan Credits', description: 'Best for occasional monitoring' },
  { id: 'credits_25', credits: 25, price: 9900, label: '25 Scan Credits', description: 'Most popular — save 20%' },
  { id: 'credits_100', credits: 100, price: 29900, label: '100 Scan Credits', description: 'Best value — save 40%' },
];

export { stripe };
