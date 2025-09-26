import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { priceId, userId } = await req.json();

  if (!priceId || !userId) {
    return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 });
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userSnap.data();
    let stripeCustomerId = user?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create a new customer in Stripe if one doesn't exist
      const customer = await stripe.customers.create({
        email: user?.email, // Assuming user has an email field
        metadata: { firebaseUid: userId },
      });
      stripeCustomerId = customer.id;

      // Update user's profile with the new Stripe customer ID
      await updateDoc(userRef, { stripeCustomerId });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: { firebaseUid: userId, stripeCustomerId },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
