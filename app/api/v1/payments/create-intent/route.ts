import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import Stripe from 'stripe';
import { db } from '@/lib/supabase/client';
import { 
  candidateProfiles, 
  companies,
  companyUsers,
  profileViews
} from '@/lib/supabase/schema';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { paymentIntentSchema } from '@/lib/validations/company';
import type { PaymentIntentSchema } from '@/lib/validations/company';

// Initialize Stripe with fallback for development
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
});

// Payment configuration
const PROFILE_UNLOCK_PRICE = 2500; // $25.00 in cents
const CURRENCY = 'usd';

/**
 * POST /api/v1/payments/create-intent
 * Create a Stripe Payment Intent for candidate profile unlock
 */
export const POST = withValidation(
  { body: paymentIntentSchema },
  async ({ body }, request) => {
    try {
      // Check authentication
      const { userId } = await auth();
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }

      // Get user and verify they're associated with a company
      const companyUser = await db.query.companyUsers.findFirst({
        where: eq(companyUsers.userId, userId),
        with: {
          company: true,
        },
      });

      if (!companyUser) {
        return createErrorResponse('Access denied: Company membership required', 403);
      }

      const company = companyUser.company;
      const { candidateId, amount, currency, metadata } = body!;

      // Verify candidate exists and is not already purchased by this company
      const candidate = await db.query.candidateProfiles.findFirst({
        where: eq(candidateProfiles.id, candidateId),
      });

      if (!candidate) {
        return createErrorResponse('Candidate not found', 404);
      }

      // Check if company has already purchased this profile
      const existingPurchase = await db.query.profileViews.findFirst({
        where: and(
          eq(profileViews.candidateId, candidateId),
          eq(profileViews.companyId, company.id),
          eq(profileViews.viewType, 'purchased')
        ),
      });

      if (existingPurchase) {
        return createErrorResponse('Profile already purchased by your company', 409);
      }

      // Use provided amount or default pricing
      const finalAmount = amount || PROFILE_UNLOCK_PRICE;
      const finalCurrency = currency || CURRENCY;

      // Create Stripe customer if not exists
      let stripeCustomerId = company.stripeCustomerId;
      
      if (!stripeCustomerId) {
        try {
          const customer = await stripe.customers.create({
            email: `billing@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            name: company.name,
            metadata: {
              companyId: company.id,
              platform: 'ned-backend',
            },
          });
          
          stripeCustomerId = customer.id;
          
          // Update company with Stripe customer ID
          await db.update(companies)
            .set({ 
              stripeCustomerId: customer.id,
              updatedAt: new Date()
            })
            .where(eq(companies.id, company.id));
        } catch (stripeError) {
          console.error('Failed to create Stripe customer:', stripeError);
          
          // If Stripe is not configured, create a mock payment intent
          if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY) {
            const mockPaymentIntent = {
              id: `pi_mock_${Date.now()}`,
              client_secret: `pi_mock_${Date.now()}_secret_mock`,
              amount: finalAmount,
              currency: finalCurrency,
              status: 'requires_payment_method',
              metadata: {
                candidateId,
                companyId: company.id,
                userId,
                ...metadata,
              },
            };

            return createSuccessResponse({
              paymentIntent: mockPaymentIntent,
              amount: finalAmount,
              currency: finalCurrency,
              candidatePreview: {
                id: candidate.id,
                title: candidate.title,
                experience: candidate.experience,
                location: candidate.location,
                isAnonymized: candidate.isAnonymized,
              },
            }, 'Mock payment intent created for development');
          }
          
          return createErrorResponse('Failed to create payment customer', 500);
        }
      }

      // Create Payment Intent
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: finalAmount,
          currency: finalCurrency,
          customer: stripeCustomerId,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            candidateId,
            companyId: company.id,
            userId,
            candidateTitle: candidate.title || 'Unnamed Professional',
            companyName: company.name,
            ...metadata,
          },
          description: `Unlock candidate profile: ${candidate.title || 'Professional'} for ${company.name}`,
        });

        // Log the payment attempt for analytics
        await logPaymentAttempt(company.id, userId, candidateId, finalAmount, finalCurrency, paymentIntent.id);

        return createSuccessResponse({
          paymentIntent: {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
          },
          amount: finalAmount,
          currency: finalCurrency,
          candidatePreview: {
            id: candidate.id,
            title: candidate.title,
            experience: candidate.experience,
            location: candidate.location,
            isAnonymized: candidate.isAnonymized,
          },
        }, 'Payment intent created successfully');

      } catch (stripeError: any) {
        console.error('Stripe payment intent creation failed:', stripeError);
        
        // If Stripe is not configured, create a mock payment intent for development
        if (stripeError.code === 'api_key_invalid' || !process.env.STRIPE_SECRET_KEY) {
          const mockPaymentIntent = {
            id: `pi_mock_${Date.now()}`,
            client_secret: `pi_mock_${Date.now()}_secret_mock`,
            amount: finalAmount,
            currency: finalCurrency,
            status: 'requires_payment_method',
          };

          return createSuccessResponse({
            paymentIntent: mockPaymentIntent,
            amount: finalAmount,
            currency: finalCurrency,
            candidatePreview: {
              id: candidate.id,
              title: candidate.title,
              experience: candidate.experience,
              location: candidate.location,
              isAnonymized: candidate.isAnonymized,
            },
          }, 'Mock payment intent created for development');
        }
        
        return createErrorResponse('Failed to create payment intent', 500);
      }

    } catch (error) {
      console.error('Payment intent creation error:', error);
      return createErrorResponse('Payment processing failed', 500);
    }
  }
);

/**
 * Log payment attempt for analytics
 */
async function logPaymentAttempt(
  companyId: string,
  userId: string,
  candidateId: string,
  amount: number,
  currency: string,
  paymentIntentId: string
) {
  try {
    // This could be logged to a payments table or analytics service
    console.log('Payment attempt logged:', {
      companyId,
      userId,
      candidateId,
      amount,
      currency,
      paymentIntentId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log payment attempt:', error);
    // Don't fail the payment flow if logging fails
  }
}