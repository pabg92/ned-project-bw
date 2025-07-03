import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analytics } from '@/lib/monitoring/usage-analytics';
import { logger } from '@/lib/monitoring/logger';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

/**
 * GET /api/admin/analytics
 * Get usage analytics and business metrics
 * Admin-only endpoint for business intelligence
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Note: In production, verify admin role from database
    
    const url = new URL(request.url);
    const timeWindow = url.searchParams.get('window') as '1h' | '24h' | '7d' | '30d' || '24h';
    const format = url.searchParams.get('format') as 'json' | 'csv' || 'json';
    const userId_param = url.searchParams.get('userId');
    
    logger.info('Analytics data accessed', {
      adminUserId: userId,
      timeWindow,
      format,
      targetUserId: userId_param
    });

    // Get user-specific insights if requested
    if (userId_param) {
      const userInsights = analytics.getUserInsights(userId_param);
      return createSuccessResponse({
        user: userId_param,
        insights: userInsights,
        timestamp: new Date().toISOString()
      });
    }

    // Export raw events if CSV format requested
    if (format === 'csv') {
      const csvData = analytics.exportEvents('csv');
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${timeWindow}-${Date.now()}.csv"`
        }
      });
    }

    // Get comprehensive analytics
    const analyticsData = {
      timestamp: new Date().toISOString(),
      timeWindow,
      metrics: analytics.getAnalytics(timeWindow),
      topEvents: analytics.getTopEvents(15, timeWindow),
      summary: {
        totalEvents: analytics.getAnalytics(timeWindow).featureUsage,
        conversionRates: analytics.getAnalytics(timeWindow).conversionRates
      }
    };

    return createSuccessResponse(analyticsData);
  } catch (error) {
    logger.error('Error fetching analytics data', {
      error: error instanceof Error ? error.message : 'Unknown error',
      adminUserId: auth().userId
    });
    
    return createErrorResponse('Failed to fetch analytics data', 500);
  }
}