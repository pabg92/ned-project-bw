import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, desc, and, gte } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { 
  profileViews,
  candidateProfiles,
  companyUsers,
  users
} from '@/lib/supabase/schema';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

const paymentHistoryQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 50) : 20),
  days: z.string().optional().transform(val => val ? parseInt(val, 10) : 30),
  candidateId: z.string().uuid().optional(),
});

/**
 * GET /api/v1/payments/history
 * Get payment history for the current company
 */
export const GET = withValidation(
  { query: paymentHistoryQuerySchema },
  async ({ query }, request) => {
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

      const { page, limit, days, candidateId } = query!;
      const offset = (page! - 1) * limit!;

      // Build where conditions
      const whereConditions = [
        eq(profileViews.companyId, companyUser.companyId),
        eq(profileViews.viewType, 'purchased'),
      ];

      // Date filter
      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        whereConditions.push(gte(profileViews.createdAt, cutoffDate));
      }

      // Specific candidate filter
      if (candidateId) {
        whereConditions.push(eq(profileViews.candidateId, candidateId));
      }

      // Get payment history with candidate information
      const payments = await db
        .select({
          id: profileViews.id,
          candidateId: profileViews.candidateId,
          paymentId: profileViews.paymentId,
          paymentAmount: profileViews.paymentAmount,
          currency: profileViews.currency,
          purchaseDate: profileViews.createdAt,
          candidateTitle: candidateProfiles.title,
          candidateExperience: candidateProfiles.experience,
          candidateLocation: candidateProfiles.location,
          purchaserFirstName: users.firstName,
          purchaserLastName: users.lastName,
        })
        .from(profileViews)
        .innerJoin(candidateProfiles, eq(profileViews.candidateId, candidateProfiles.id))
        .innerJoin(users, eq(profileViews.viewedByUserId, users.id))
        .where(and(...whereConditions))
        .orderBy(desc(profileViews.createdAt))
        .limit(limit!)
        .offset(offset);

      // Get total count for pagination
      const totalResult = await db
        .select({ count: profileViews.id })
        .from(profileViews)
        .where(and(...whereConditions));

      const total = totalResult.length;
      const totalPages = Math.ceil(total / limit!);

      // Calculate summary statistics
      const totalSpent = payments.reduce((sum, payment) => {
        return sum + (payment.paymentAmount ? parseFloat(payment.paymentAmount) : 0);
      }, 0);

      // Format the payment history
      const formattedPayments = payments.map(payment => ({
        id: payment.id,
        paymentId: payment.paymentId,
        candidate: {
          id: payment.candidateId,
          title: payment.candidateTitle || 'Unnamed Professional',
          experience: payment.candidateExperience,
          location: payment.candidateLocation,
        },
        purchase: {
          amount: payment.paymentAmount ? parseFloat(payment.paymentAmount) : null,
          currency: payment.currency,
          date: payment.purchaseDate,
          purchasedBy: `${payment.purchaserFirstName || ''} ${payment.purchaserLastName || ''}`.trim() || 'Unknown User',
        },
      }));

      const response = {
        payments: formattedPayments,
        pagination: {
          page: page!,
          limit: limit!,
          total,
          totalPages,
          hasNext: page! < totalPages,
          hasPrev: page! > 1,
        },
        summary: {
          totalPayments: total,
          totalSpent,
          averagePayment: total > 0 ? totalSpent / total : 0,
          periodDays: days!,
        },
      };

      return createSuccessResponse(response, 'Payment history retrieved successfully');

    } catch (error) {
      console.error('Payment history error:', error);
      return createErrorResponse('Failed to retrieve payment history', 500);
    }
  }
);

/**
 * GET /api/v1/payments/history/stats
 * Get payment statistics for the company
 */
export async function GET_STATS(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify company membership
    const companyUser = await db.query.companyUsers.findFirst({
      where: eq(companyUsers.userId, userId),
    });

    if (!companyUser) {
      return createErrorResponse('Access denied: Company membership required', 403);
    }

    // Get all company payments
    const allPayments = await db
      .select({
        paymentAmount: profileViews.paymentAmount,
        currency: profileViews.currency,
        createdAt: profileViews.createdAt,
      })
      .from(profileViews)
      .where(
        and(
          eq(profileViews.companyId, companyUser.companyId),
          eq(profileViews.viewType, 'purchased')
        )
      )
      .orderBy(desc(profileViews.createdAt));

    // Calculate statistics
    const totalPayments = allPayments.length;
    const totalSpent = allPayments.reduce((sum, payment) => {
      return sum + (payment.paymentAmount ? parseFloat(payment.paymentAmount) : 0);
    }, 0);

    // Calculate monthly breakdown
    const monthlyStats = allPayments.reduce((acc, payment) => {
      const month = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const amount = payment.paymentAmount ? parseFloat(payment.paymentAmount) : 0;
      
      if (!acc[month]) {
        acc[month] = { count: 0, total: 0 };
      }
      
      acc[month].count += 1;
      acc[month].total += amount;
      
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPayments = allPayments.filter(
      payment => payment.createdAt >= thirtyDaysAgo
    );

    const recentTotal = recentPayments.reduce((sum, payment) => {
      return sum + (payment.paymentAmount ? parseFloat(payment.paymentAmount) : 0);
    }, 0);

    const stats = {
      overview: {
        totalPayments,
        totalSpent,
        averagePayment: totalPayments > 0 ? totalSpent / totalPayments : 0,
        firstPurchase: allPayments.length > 0 ? allPayments[allPayments.length - 1].createdAt : null,
        lastPurchase: allPayments.length > 0 ? allPayments[0].createdAt : null,
      },
      recent: {
        last30Days: {
          payments: recentPayments.length,
          totalSpent: recentTotal,
          averagePayment: recentPayments.length > 0 ? recentTotal / recentPayments.length : 0,
        },
      },
      monthly: Object.entries(monthlyStats)
        .sort(([a], [b]) => b.localeCompare(a)) // Sort by month descending
        .slice(0, 12) // Last 12 months
        .map(([month, data]) => ({
          month,
          payments: data.count,
          totalSpent: data.total,
          averagePayment: data.total / data.count,
        })),
    };

    return createSuccessResponse(stats, 'Payment statistics retrieved successfully');

  } catch (error) {
    console.error('Payment stats error:', error);
    return createErrorResponse('Failed to retrieve payment statistics', 500);
  }
}