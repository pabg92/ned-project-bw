/**
 * Monitoring system exports
 * Central export point for all monitoring functionality
 */

export { logger, LogLevel, type LogContext } from './logger';
export { metrics, type ApiMetric, type HealthMetrics, type EndpointStats } from './metrics';
export { alertManager, AlertSeverity, type Alert, type AlertThresholds } from './alerts';
export { 
  withMonitoring, 
  generateRequestId, 
  checkRateLimit,
  type RequestMetrics 
} from './middleware';

// Usage analytics helper
export function trackUsage(feature: string, userId?: string, metadata?: Record<string, any>) {
  logger.info(`Usage: ${feature}`, {
    userId,
    feature,
    metadata
  });
}

// Performance measurement helper
export function measurePerformance<T>(
  name: string, 
  fn: () => Promise<T> | T
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      logger.debug(`Performance: ${name}`, {
        operation: name,
        duration
      });
      
      resolve(result);
    } catch (error) {
      const duration = Date.now() - start;
      
      logger.error(`Performance error: ${name}`, {
        operation: name,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      reject(error);
    }
  });
}