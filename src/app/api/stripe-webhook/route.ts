import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { manageSubscriptionStatusChange } from '@/services/subscriptions';

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not set.');
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription' && checkoutSession.customer && checkoutSession.subscription) {
            await manageSubscriptionStatusChange(
              checkoutSession.customer as string,
              checkoutSession.subscription as string,
              true
            );
          }
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.customer as string,
            subscription.id,
            event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated'
          );
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error: any) {
      console.error('Error handling event:', error);
      return new NextResponse('Webhook handler failed.', { status: 400 });
    }
  }

  return NextResponse.json({ received: true });
}

// This is important for Next.js to not parse the body automatically
export const config = {
  api: {
    bodyParser: false,
  },
};
