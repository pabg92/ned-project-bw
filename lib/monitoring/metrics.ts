/**
 * Metrics collection and aggregation system
 * Tracks API performance, usage patterns, and system health
 */

export interface ApiMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
}

export interface HealthMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage?: number;
  activeConnections: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
}

export interface EndpointStats {
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  last24Hours: number;
  errorRate: number;
}

class MetricsCollector {
  private metrics: ApiMetric[] = [];
  private startTime = Date.now();
  private activeConnections = 0;
  private readonly maxMetricsHistory = 10000; // Keep last 10k requests in memory

  recordApiCall(endpoint: string, method: string, statusCode: number, duration: number) {
    const metric: ApiMetric = {
      endpoint,
      method,
      statusCode,
      duration,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Keep memory usage bounded
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  incrementActiveConnections() {
    this.activeConnections++;
  }

  decrementActiveConnections() {
    this.activeConnections = Math.max(0, this.activeConnections - 1);
  }

  getHealthMetrics(): HealthMetrics {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > last24Hours);
    const totalRequests = recentMetrics.length;
    const totalErrors = recentMetrics.filter(m => m.statusCode >= 400).length;
    
    const responseTimes = recentMetrics.map(m => m.duration);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    return {
      uptime: now - this.startTime,
      memoryUsage: process.memoryUsage(),
      activeConnections: this.activeConnections,
      totalRequests,
      errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
      averageResponseTime
    };
  }

  getEndpointStats(endpoint: string): EndpointStats {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint);
    const recent24h = endpointMetrics.filter(m => m.timestamp > last24Hours);
    
    const responseTimes = endpointMetrics.map(m => m.duration);
    const totalErrors = endpointMetrics.filter(m => m.statusCode >= 400).length;

    return {
      totalRequests: endpointMetrics.length,
      totalErrors,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      last24Hours: recent24h.length,
      errorRate: endpointMetrics.length > 0 ? totalErrors / endpointMetrics.length : 0
    };
  }

  getAllEndpointStats(): Record<string, EndpointStats> {
    const endpoints = [...new Set(this.metrics.map(m => m.endpoint))];
    const stats: Record<string, EndpointStats> = {};
    
    for (const endpoint of endpoints) {
      stats[endpoint] = this.getEndpointStats(endpoint);
    }
    
    return stats;
  }

  getMetricsSummary() {
    const now = Date.now();
    const timeWindows = {
      '1h': now - (60 * 60 * 1000),
      '24h': now - (24 * 60 * 60 * 1000),
      '7d': now - (7 * 24 * 60 * 60 * 1000)
    };

    const summary: Record<string, any> = {};

    for (const [window, since] of Object.entries(timeWindows)) {
      const windowMetrics = this.metrics.filter(m => m.timestamp > since);
      const errors = windowMetrics.filter(m => m.statusCode >= 400);
      const responseTimes = windowMetrics.map(m => m.duration);

      summary[window] = {
        totalRequests: windowMetrics.length,
        totalErrors: errors.length,
        errorRate: windowMetrics.length > 0 ? errors.length / windowMetrics.length : 0,
        averageResponseTime: responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0,
        slowestRequest: responseTimes.length > 0 ? Math.max(...responseTimes) : 0
      };
    }

    return summary;
  }

  // Alert thresholds
  checkAlerts(): string[] {
    const alerts: string[] = [];
    const health = this.getHealthMetrics();
    
    // High error rate alert
    if (health.errorRate > 0.1) { // 10% error rate
      alerts.push(`High error rate: ${(health.errorRate * 100).toFixed(1)}%`);
    }
    
    // High response time alert
    if (health.averageResponseTime > 2000) { // 2 seconds
      alerts.push(`High response time: ${health.averageResponseTime.toFixed(0)}ms`);
    }
    
    // High memory usage alert
    const memoryUsageMB = health.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) { // 500MB
      alerts.push(`High memory usage: ${memoryUsageMB.toFixed(0)}MB`);
    }
    
    return alerts;
  }

  // Export metrics for external systems
  exportMetrics() {
    return {
      health: this.getHealthMetrics(),
      endpoints: this.getAllEndpointStats(),
      summary: this.getMetricsSummary(),
      alerts: this.checkAlerts(),
      timestamp: Date.now()
    };
  }
}

export const metrics = new MetricsCollector();