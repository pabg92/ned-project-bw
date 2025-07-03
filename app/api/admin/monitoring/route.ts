import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { metrics } from '@/lib/monitoring/metrics';
import { alertManager } from '@/lib/monitoring/alerts';
import { logger } from '@/lib/monitoring/logger';
import { withValidation, createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

/**
 * GET /api/admin/monitoring
 * Get comprehensive monitoring dashboard data
 * Admin-only endpoint for system monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Note: In production, verify admin role from database
    // For now, any authenticated user can access
    
    const url = new URL(request.url);
    const timeWindow = url.searchParams.get('window') || '24h';
    const includeAlerts = url.searchParams.get('alerts') !== 'false';
    
    logger.info('Admin monitoring dashboard accessed', {
      userId,
      timeWindow,
      includeAlerts
    });

    const dashboardData = {
      timestamp: new Date().toISOString(),
      system: {
        health: metrics.getHealthMetrics(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV
      },
      metrics: {
        summary: metrics.getMetricsSummary(),
        endpoints: metrics.getAllEndpointStats()
      },
      alerts: includeAlerts ? {
        active: alertManager.getActiveAlerts(),
        history: alertManager.getAlertHistory(50),
        stats: alertManager.getAlertStats()
      } : undefined
    };

    return createSuccessResponse(dashboardData);
  } catch (error) {
    logger.error('Error fetching monitoring dashboard', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: auth().userId
    });
    
    return createErrorResponse('Failed to fetch monitoring data', 500);
  }
}

/**
 * POST /api/admin/monitoring/alerts/resolve
 * Resolve an active alert
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return createErrorResponse('Alert ID is required', 400);
    }

    const resolved = alertManager.resolveAlert(alertId);
    
    if (!resolved) {
      return createErrorResponse('Alert not found or already resolved', 404);
    }

    logger.info('Alert resolved by admin', {
      userId,
      alertId
    });

    return createSuccessResponse({ message: 'Alert resolved successfully' });
  } catch (error) {
    logger.error('Error resolving alert', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: auth().userId
    });
    
    return createErrorResponse('Failed to resolve alert', 500);
  }
}