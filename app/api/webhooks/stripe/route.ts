import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { 
  candidateProfiles, 
  companies,
  profileViews,
  users
} from '@/lib/supabase/schema';

// Initialize Stripe with fallback for development
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    if (!webhookSecret) {
      console.warn('Stripe webhook secret not configured, processing event anyway for development');
      event = JSON.parse(body);
    } else if (!signature) {
      console.error('No Stripe signature provided');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    
    // In development, allow processing without signature verification
    if (process.env.NODE_ENV === 'development' && !webhookSecret) {
      try {
        event = JSON.parse(body);
      } catch (parseError) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }
  }

  console.log('Processing Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePayment(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle successful payment for profile unlock
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { candidateId, companyId, userId } = paymentIntent.metadata;

  if (!candidateId || !companyId || !userId) {
    console.error('Missing required metadata in payment intent:', paymentIntent.metadata);
    return;
  }

  try {
    // Verify the candidate and company exist
    const [candidate, company] = await Promise.all([
      db.query.candidateProfiles.findFirst({
        where: eq(candidateProfiles.id, candidateId),
      }),
      db.query.companies.findFirst({
        where: eq(companies.id, companyId),
      }),
    ]);

    if (!candidate || !company) {
      console.error('Candidate or company not found:', { candidateId, companyId });
      return;
    }

    // Check if this purchase already exists
    const existingPurchase = await db.query.profileViews.findFirst({
      where: and(
        eq(profileViews.candidateId, candidateId),
        eq(profileViews.companyId, companyId),
        eq(profileViews.paymentId, paymentIntent.id)
      ),
    });

    if (existingPurchase) {
      console.log('Purchase already recorded:', paymentIntent.id);
      return;
    }

    // Create profile view record for successful purchase
    await db.insert(profileViews).values({
      candidateId,
      companyId,
      viewedByUserId: userId,
      viewType: 'purchased',
      paymentId: paymentIntent.id,
      paymentAmount: (paymentIntent.amount / 100).toString(), // Convert cents to dollars
      currency: paymentIntent.currency.toUpperCase(),
    });

    console.log('Profile purchase recorded successfully:', {
      candidateId,
      companyId,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
    });

    // Optional: Send notification or trigger other business logic
    await notifyPaymentSuccess(candidateId, companyId, userId, paymentIntent);

  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { candidateId, companyId, userId } = paymentIntent.metadata;

  console.log('Payment failed:', {
    paymentIntentId: paymentIntent.id,
    candidateId,
    companyId,
    userId,
    lastPaymentError: paymentIntent.last_payment_error,
  });

  // Optional: Log failed payment for analytics or retry logic
  // Could implement retry notifications or failed payment tracking here
}

/**
 * Handle subscription changes (for company subscription tiers)
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Find company by Stripe customer ID
    const company = await db.query.companies.findFirst({
      where: eq(companies.stripeCustomerId, customerId),
    });

    if (!company) {
      console.error('Company not found for Stripe customer:', customerId);
      return;
    }

    // Update company subscription status and tier
    const subscriptionStatus = subscription.status;
    let tier = 'basic';

    // Determine tier based on subscription
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      
      // Map price IDs to tiers (these would be configured in Stripe)
      if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
        tier = 'premium';
      } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
        tier = 'enterprise';
      }
    }

    // Update search quota based on tier
    let searchQuota = 10; // basic
    if (tier === 'premium') searchQuota = 100;
    if (tier === 'enterprise') searchQuota = 1000;

    await db.update(companies)
      .set({
        tier,
        searchQuota,
        subscriptionStatus: subscriptionStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, company.id));

    console.log('Subscription updated:', {
      companyId: company.id,
      tier,
      searchQuota,
      subscriptionStatus,
    });

  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const company = await db.query.companies.findFirst({
      where: eq(companies.stripeCustomerId, customerId),
    });

    if (!company) {
      console.error('Company not found for cancelled subscription:', customerId);
      return;
    }

    // Downgrade to basic tier
    await db.update(companies)
      .set({
        tier: 'basic',
        searchQuota: 10,
        subscriptionStatus: 'inactive',
        updatedAt: new Date(),
      })
      .where(eq(companies.id, company.id));

    console.log('Subscription cancelled, downgraded to basic:', company.id);

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

/**
 * Handle invoice payment for subscriptions
 */
async function handleInvoicePayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  try {
    const company = await db.query.companies.findFirst({
      where: eq(companies.stripeCustomerId, customerId),
    });

    if (!company) {
      console.error('Company not found for invoice payment:', customerId);
      return;
    }

    // Update subscription status to active on successful payment
    await db.update(companies)
      .set({
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(companies.id, company.id));

    console.log('Invoice payment processed:', {
      companyId: company.id,
      invoiceId: invoice.id,
      amount: invoice.amount_paid / 100,
    });

  } catch (error) {
    console.error('Error handling invoice payment:', error);
    throw error;
  }
}

/**
 * Optional: Send notifications for successful payments
 */
async function notifyPaymentSuccess(
  candidateId: string,
  companyId: string,
  userId: string,
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    // This could integrate with the notification system (Task 11)
    // For now, just log the event
    console.log('Payment success notification triggered:', {
      candidateId,
      companyId,
      userId,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
    });
    
    // Future: Send email notification, in-app notification, etc.
  } catch (error) {
    console.error('Error sending payment notification:', error);
    // Don't fail the webhook processing if notification fails
  }
}