import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { db } from '@/lib/supabase/client';
import { 
  companies,
  companyUsers
} from '@/lib/supabase/schema';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

// Initialize Stripe with fallback for development
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
});

const createSubscriptionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  tier: z.enum(['basic', 'premium', 'enterprise']).optional(),
});

const updateSubscriptionSchema = z.object({
  newPriceId: z.string().min(1, 'New price ID is required'),
  tier: z.enum(['basic', 'premium', 'enterprise']).optional(),
});

/**
 * GET /api/v1/payments/subscription
 * Get current subscription status for the company
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify company membership
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

    // Get subscription details from Stripe if customer exists
    let stripeSubscription = null;
    
    if (company.stripeCustomerId) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: company.stripeCustomerId,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          stripeSubscription = subscriptions.data[0];
        }
      } catch (stripeError) {
        console.error('Failed to fetch Stripe subscription:', stripeError);
        
        // If Stripe is not configured, return mock data for development
        if (!process.env.STRIPE_SECRET_KEY) {
          stripeSubscription = {
            id: 'sub_mock_development',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
            items: {
              data: [{
                price: {
                  id: 'price_mock_basic',
                  unit_amount: 2900, // $29.00
                  currency: 'usd',
                  recurring: { interval: 'month' },
                },
              }],
            },
          };
        }
      }
    }

    // Build subscription response
    const subscriptionInfo = {
      company: {
        id: company.id,
        name: company.name,
        tier: company.tier,
        searchQuota: company.searchQuota,
        searchesUsed: company.searchesUsed,
        subscriptionStatus: company.subscriptionStatus,
      },
      subscription: stripeSubscription ? {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        price: stripeSubscription.items.data[0]?.price ? {
          id: stripeSubscription.items.data[0].price.id,
          amount: stripeSubscription.items.data[0].price.unit_amount,
          currency: stripeSubscription.items.data[0].price.currency,
          interval: stripeSubscription.items.data[0].price.recurring?.interval,
        } : null,
      } : null,
      limits: {
        searchQuota: company.searchQuota,
        searchesUsed: company.searchesUsed,
        remainingSearches: company.searchQuota - company.searchesUsed,
        quotaResetDate: stripeSubscription ? 
          new Date(stripeSubscription.current_period_end * 1000) : 
          null,
      },
    };

    return createSuccessResponse(subscriptionInfo, 'Subscription information retrieved successfully');

  } catch (error) {
    console.error('Subscription info error:', error);
    return createErrorResponse('Failed to retrieve subscription information', 500);
  }
}

/**
 * POST /api/v1/payments/subscription
 * Create a new subscription for the company
 */
export const POST = withValidation(
  { body: createSubscriptionSchema },
  async ({ body }, request) => {
    try {
      // Check authentication
      const { userId } = await auth();
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }

      // Verify company membership and admin role
      const companyUser = await db.query.companyUsers.findFirst({
        where: eq(companyUsers.userId, userId),
        with: {
          company: true,
        },
      });

      if (!companyUser || companyUser.role !== 'owner') {
        return createErrorResponse('Access denied: Company owner permission required', 403);
      }

      const company = companyUser.company;
      const { priceId, tier } = body!;

      // Ensure company has a Stripe customer
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

          await db.update(companies)
            .set({ 
              stripeCustomerId: customer.id,
              updatedAt: new Date()
            })
            .where(eq(companies.id, company.id));
        } catch (stripeError) {
          console.error('Failed to create Stripe customer:', stripeError);
          
          // Mock subscription for development
          if (!process.env.STRIPE_SECRET_KEY) {
            const mockSubscription = {
              id: 'sub_mock_development',
              status: 'active',
              client_secret: 'seti_mock_development',
            };

            return createSuccessResponse({
              subscription: mockSubscription,
              setupComplete: true,
            }, 'Mock subscription created for development');
          }

          return createErrorResponse('Failed to create customer', 500);
        }
      }

      try {
        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            companyId: company.id,
            tier: tier || 'premium',
          },
        });

        return createSuccessResponse({
          subscription: {
            id: subscription.id,
            status: subscription.status,
            client_secret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          },
          setupComplete: subscription.status === 'active',
        }, 'Subscription created successfully');

      } catch (stripeError: any) {
        console.error('Stripe subscription creation failed:', stripeError);
        
        // Mock subscription for development
        if (stripeError.code === 'api_key_invalid' || !process.env.STRIPE_SECRET_KEY) {
          const mockSubscription = {
            id: 'sub_mock_development',
            status: 'active',
            client_secret: 'seti_mock_development',
          };

          return createSuccessResponse({
            subscription: mockSubscription,
            setupComplete: true,
          }, 'Mock subscription created for development');
        }
        
        return createErrorResponse('Failed to create subscription', 500);
      }

    } catch (error) {
      console.error('Subscription creation error:', error);
      return createErrorResponse('Subscription setup failed', 500);
    }
  }
);

/**
 * PUT /api/v1/payments/subscription
 * Update existing subscription (change plan)
 */
export const PUT = withValidation(
  { body: updateSubscriptionSchema },
  async ({ body }, request) => {
    try {
      // Check authentication
      const { userId } = await auth();
      if (!userId) {
        return createErrorResponse('Authentication required', 401);
      }

      // Verify company membership and admin role
      const companyUser = await db.query.companyUsers.findFirst({
        where: eq(companyUsers.userId, userId),
        with: {
          company: true,
        },
      });

      if (!companyUser || companyUser.role !== 'owner') {
        return createErrorResponse('Access denied: Company owner permission required', 403);
      }

      const company = companyUser.company;
      const { newPriceId, tier } = body!;

      if (!company.stripeCustomerId) {
        return createErrorResponse('No existing subscription found', 404);
      }

      try {
        // Get current subscription
        const subscriptions = await stripe.subscriptions.list({
          customer: company.stripeCustomerId,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length === 0) {
          return createErrorResponse('No active subscription found', 404);
        }

        const currentSubscription = subscriptions.data[0];

        // Update subscription
        const updatedSubscription = await stripe.subscriptions.update(
          currentSubscription.id,
          {
            items: [{
              id: currentSubscription.items.data[0].id,
              price: newPriceId,
            }],
            metadata: {
              ...currentSubscription.metadata,
              tier: tier || currentSubscription.metadata.tier,
            },
          }
        );

        return createSuccessResponse({
          subscription: {
            id: updatedSubscription.id,
            status: updatedSubscription.status,
            priceId: newPriceId,
          },
          updated: true,
        }, 'Subscription updated successfully');

      } catch (stripeError: any) {
        console.error('Stripe subscription update failed:', stripeError);
        
        // Mock update for development
        if (stripeError.code === 'api_key_invalid' || !process.env.STRIPE_SECRET_KEY) {
          return createSuccessResponse({
            subscription: {
              id: 'sub_mock_development',
              status: 'active',
              priceId: newPriceId,
            },
            updated: true,
          }, 'Mock subscription updated for development');
        }
        
        return createErrorResponse('Failed to update subscription', 500);
      }

    } catch (error) {
      console.error('Subscription update error:', error);
      return createErrorResponse('Subscription update failed', 500);
    }
  }
);

/**
 * DELETE /api/v1/payments/subscription
 * Cancel subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify company membership and admin role
    const companyUser = await db.query.companyUsers.findFirst({
      where: eq(companyUsers.userId, userId),
      with: {
        company: true,
      },
    });

    if (!companyUser || companyUser.role !== 'owner') {
      return createErrorResponse('Access denied: Company owner permission required', 403);
    }

    const company = companyUser.company;

    if (!company.stripeCustomerId) {
      return createErrorResponse('No subscription found', 404);
    }

    try {
      // Get current subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: company.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return createErrorResponse('No active subscription found', 404);
      }

      const currentSubscription = subscriptions.data[0];

      // Cancel subscription at period end
      const cancelledSubscription = await stripe.subscriptions.update(
        currentSubscription.id,
        { cancel_at_period_end: true }
      );

      return createSuccessResponse({
        subscription: {
          id: cancelledSubscription.id,
          status: cancelledSubscription.status,
          cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
          currentPeriodEnd: new Date(cancelledSubscription.current_period_end * 1000),
        },
        cancelled: true,
      }, 'Subscription will be cancelled at the end of the current period');

    } catch (stripeError: any) {
      console.error('Stripe subscription cancellation failed:', stripeError);
      
      // Mock cancellation for development
      if (stripeError.code === 'api_key_invalid' || !process.env.STRIPE_SECRET_KEY) {
        return createSuccessResponse({
          subscription: {
            id: 'sub_mock_development',
            status: 'active',
            cancelAtPeriodEnd: true,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          cancelled: true,
        }, 'Mock subscription cancelled for development');
      }
      
      return createErrorResponse('Failed to cancel subscription', 500);
    }

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return createErrorResponse('Subscription cancellation failed', 500);
  }
}