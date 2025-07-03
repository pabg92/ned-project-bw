/**
 * Structured logging system for NED Backend API
 * Provides consistent logging across the application with proper metadata
 */

export interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      service: 'ned-backend',
      version: process.env.npm_package_version || '1.0.0',
      ...context
    };

    return this.isDevelopment 
      ? JSON.stringify(logEntry, null, 2)
      : JSON.stringify(logEntry);
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatLog(LogLevel.ERROR, message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatLog(LogLevel.WARN, message, context));
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatLog(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatLog(LogLevel.DEBUG, message, context));
    }
  }

  // API-specific logging methods
  apiRequest(method: string, endpoint: string, context?: Partial<LogContext>) {
    this.info(`API Request: ${method} ${endpoint}`, {
      method,
      endpoint,
      ...context
    });
  }

  apiResponse(method: string, endpoint: string, statusCode: number, duration: number, context?: Partial<LogContext>) {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API Response: ${method} ${endpoint} - ${statusCode} (${duration}ms)`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, { method, endpoint, statusCode, duration, ...context });
    } else {
      this.info(message, { method, endpoint, statusCode, duration, ...context });
    }
  }

  authEvent(event: string, userId?: string, context?: Partial<LogContext>) {
    this.info(`Auth Event: ${event}`, {
      userId,
      event,
      ...context
    });
  }

  databaseQuery(operation: string, table: string, duration?: number, context?: Partial<LogContext>) {
    this.debug(`Database: ${operation} on ${table}`, {
      operation,
      table,
      duration,
      ...context
    });
  }

  paymentEvent(event: string, amount?: number, currency?: string, context?: Partial<LogContext>) {
    this.info(`Payment Event: ${event}`, {
      event,
      amount,
      currency,
      ...context
    });
  }
}

export const logger = new Logger();