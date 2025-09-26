"use client";

import { useState } from 'react';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface StripeBillingButtonsProps {
  priceId: string; // The Stripe Price ID for the subscription plan
}

export function StripeBillingButtons({ priceId }: StripeBillingButtonsProps) {
  const { user } = useApp();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user || !user.uid) {
      toast({ title: "Error", description: "You must be logged in to subscribe.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.uid }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Stripe Checkout Error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user || !user.uid || !user.stripeCustomerId) {
      toast({ title: "Error", description: "No active subscription to manage.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create customer portal session');
      }
    } catch (error: any) {
      console.error('Stripe Customer Portal Error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex space-x-4">
      {!user?.stripeSubscriptionId ? (
        <Button onClick={handleSubscribe} disabled={isLoading}>
          {isLoading ? "Loading..." : "Subscribe"}
        </Button>
      ) : (
        <Button onClick={handleManageSubscription} disabled={isLoading}>
          {isLoading ? "Loading..." : "Manage Subscription"}
        </Button>
      )}
    </div>
  );
}
