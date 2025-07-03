/**
 * Alert system for monitoring critical application events
 * Integrates with external services for notifications
 */

import { logger } from './logger';
import { metrics } from './metrics';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: number;
}

export interface AlertThresholds {
  errorRate: number;
  responseTime: number;
  memoryUsage: number;
  diskUsage: number;
  consecutiveErrors: number;
}

class AlertManager {
  private alerts: Alert[] = [];
  private alertHistory: Alert[] = [];
  private thresholds: AlertThresholds = {
    errorRate: 0.1, // 10%
    responseTime: 2000, // 2 seconds
    memoryUsage: 512 * 1024 * 1024, // 512MB
    diskUsage: 0.9, // 90%
    consecutiveErrors: 5
  };

  private consecutiveErrorCount = 0;
  private lastErrorEndpoint = '';

  generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  createAlert(severity: AlertSeverity, title: string, message: string, metadata?: Record<string, any>): Alert {
    const alert: Alert = {
      id: this.generateAlertId(),
      severity,
      title,
      message,
      timestamp: Date.now(),
      metadata,
      resolved: false
    };

    this.alerts.push(alert);
    this.alertHistory.push({ ...alert });

    // Log the alert
    logger.error(`ALERT [${severity.toUpperCase()}]: ${title}`, {
      alertId: alert.id,
      message,
      metadata
    });

    // In production, send to external alerting system
    this.sendExternalAlert(alert);

    return alert;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      
      logger.info(`Alert resolved: ${alert.title}`, {
        alertId,
        duration: alert.resolvedAt - alert.timestamp
      });
      
      return true;
    }
    return false;
  }

  checkHealthAlerts(): Alert[] {
    const newAlerts: Alert[] = [];
    const health = metrics.getHealthMetrics();
    
    // Error rate alert
    if (health.errorRate > this.thresholds.errorRate) {
      const existingAlert = this.alerts.find(a => 
        a.title.includes('High Error Rate') && !a.resolved
      );
      
      if (!existingAlert) {
        newAlerts.push(this.createAlert(
          AlertSeverity.HIGH,
          'High Error Rate Detected',
          `Error rate is ${(health.errorRate * 100).toFixed(1)}% (threshold: ${(this.thresholds.errorRate * 100).toFixed(1)}%)`,
          { errorRate: health.errorRate, threshold: this.thresholds.errorRate }
        ));
      }
    }

    // Response time alert
    if (health.averageResponseTime > this.thresholds.responseTime) {
      const existingAlert = this.alerts.find(a => 
        a.title.includes('High Response Time') && !a.resolved
      );
      
      if (!existingAlert) {
        newAlerts.push(this.createAlert(
          AlertSeverity.MEDIUM,
          'High Response Time Detected',
          `Average response time is ${health.averageResponseTime.toFixed(0)}ms (threshold: ${this.thresholds.responseTime}ms)`,
          { responseTime: health.averageResponseTime, threshold: this.thresholds.responseTime }
        ));
      }
    }

    // Memory usage alert
    if (health.memoryUsage.heapUsed > this.thresholds.memoryUsage) {
      const existingAlert = this.alerts.find(a => 
        a.title.includes('High Memory Usage') && !a.resolved
      );
      
      if (!existingAlert) {
        const memoryMB = health.memoryUsage.heapUsed / 1024 / 1024;
        const thresholdMB = this.thresholds.memoryUsage / 1024 / 1024;
        
        newAlerts.push(this.createAlert(
          AlertSeverity.HIGH,
          'High Memory Usage Detected',
          `Memory usage is ${memoryMB.toFixed(0)}MB (threshold: ${thresholdMB.toFixed(0)}MB)`,
          { memoryUsage: health.memoryUsage, threshold: this.thresholds.memoryUsage }
        ));
      }
    }

    return newAlerts;
  }

  onApiError(endpoint: string, statusCode: number, error: string) {
    // Track consecutive errors on the same endpoint
    if (this.lastErrorEndpoint === endpoint) {
      this.consecutiveErrorCount++;
    } else {
      this.consecutiveErrorCount = 1;
      this.lastErrorEndpoint = endpoint;
    }

    // Critical error codes
    if (statusCode === 500) {
      this.createAlert(
        AlertSeverity.HIGH,
        'Server Error Detected',
        `500 Internal Server Error on ${endpoint}`,
        { endpoint, statusCode, error }
      );
    }

    // Consecutive errors alert
    if (this.consecutiveErrorCount >= this.thresholds.consecutiveErrors) {
      const existingAlert = this.alerts.find(a => 
        a.title.includes('Consecutive Errors') && 
        a.metadata?.endpoint === endpoint && 
        !a.resolved
      );
      
      if (!existingAlert) {
        this.createAlert(
          AlertSeverity.CRITICAL,
          'Consecutive Errors Detected',
          `${this.consecutiveErrorCount} consecutive errors on ${endpoint}`,
          { endpoint, consecutiveErrors: this.consecutiveErrorCount, error }
        );
      }
    }
  }

  onApiSuccess(endpoint: string) {
    // Reset consecutive error count on success
    if (this.lastErrorEndpoint === endpoint) {
      this.consecutiveErrorCount = 0;
      this.lastErrorEndpoint = '';
      
      // Auto-resolve consecutive error alerts for this endpoint
      const consecutiveErrorAlerts = this.alerts.filter(a => 
        a.title.includes('Consecutive Errors') && 
        a.metadata?.endpoint === endpoint && 
        !a.resolved
      );
      
      consecutiveErrorAlerts.forEach(alert => {
        this.resolveAlert(alert.id);
      });
    }
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  getAlertHistory(limit = 100): Alert[] {
    return this.alertHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getAlertStats() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);
    
    const alerts24h = this.alertHistory.filter(a => a.timestamp > last24h);
    const alerts7d = this.alertHistory.filter(a => a.timestamp > last7d);
    
    return {
      active: this.getActiveAlerts().length,
      total: this.alertHistory.length,
      last24Hours: alerts24h.length,
      last7Days: alerts7d.length,
      bySeverity: {
        critical: this.alertHistory.filter(a => a.severity === AlertSeverity.CRITICAL).length,
        high: this.alertHistory.filter(a => a.severity === AlertSeverity.HIGH).length,
        medium: this.alertHistory.filter(a => a.severity === AlertSeverity.MEDIUM).length,
        low: this.alertHistory.filter(a => a.severity === AlertSeverity.LOW).length
      }
    };
  }

  private async sendExternalAlert(alert: Alert) {
    // In production, integrate with services like:
    // - PagerDuty
    // - Slack
    // - Discord
    // - Email notifications
    
    if (process.env.NODE_ENV === 'development') {
      logger.warn('External alert would be sent in production', {
        alertId: alert.id,
        severity: alert.severity,
        title: alert.title
      });
    }
    
    // Example Slack webhook integration:
    // if (process.env.SLACK_WEBHOOK_URL && alert.severity in [AlertSeverity.HIGH, AlertSeverity.CRITICAL]) {
    //   try {
    //     await fetch(process.env.SLACK_WEBHOOK_URL, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         text: `🚨 ${alert.title}`,
    //         attachments: [{
    //           color: alert.severity === AlertSeverity.CRITICAL ? 'danger' : 'warning',
    //           fields: [
    //             { title: 'Severity', value: alert.severity, short: true },
    //             { title: 'Message', value: alert.message, short: false }
    //           ]
    //         }]
    //       })
    //     });
    //   } catch (error) {
    //     logger.error('Failed to send Slack alert', { alertId: alert.id, error });
    //   }
    // }
  }

  // Auto-resolve old alerts
  autoResolveOldAlerts() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    this.alerts.forEach(alert => {
      if (!alert.resolved && alert.timestamp < cutoffTime) {
        this.resolveAlert(alert.id);
        logger.info('Auto-resolved old alert', { alertId: alert.id });
      }
    });
  }

  // Periodic health checks
  runHealthCheck() {
    this.checkHealthAlerts();
    this.autoResolveOldAlerts();
  }
}

export const alertManager = new AlertManager();

// Run health checks every 5 minutes
setInterval(() => {
  alertManager.runHealthCheck();
}, 5 * 60 * 1000);