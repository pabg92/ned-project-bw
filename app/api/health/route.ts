import { NextResponse } from "next/server";
import { metrics } from "@/lib/monitoring/metrics";
import { alertManager } from "@/lib/monitoring/alerts";
import { db } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const detailed = url.searchParams.get('detailed') === 'true';
  
  try {
    // Basic health check
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "NED Backend API",
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime()
    };

    if (!detailed) {
      return NextResponse.json(healthData);
    }

    // Detailed health check with metrics
    const [healthMetrics, dbHealth] = await Promise.all([
      metrics.getHealthMetrics(),
      checkDatabaseHealth()
    ]);

    const detailedHealth = {
      ...healthData,
      metrics: {
        ...healthMetrics,
        database: dbHealth
      },
      alerts: {
        active: alertManager.getActiveAlerts().length,
        stats: alertManager.getAlertStats()
      },
      endpoints: metrics.getAllEndpointStats()
    };

    return NextResponse.json(detailedHealth);
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "NED Backend API",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 503 }
    );
  }
}

async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    // Simple query to check database connectivity
    await db.execute('SELECT 1');
    const duration = Date.now() - start;
    
    return {
      status: "healthy",
      responseTime: duration,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown database error",
      timestamp: new Date().toISOString()
    };
  }
}