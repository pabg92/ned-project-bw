/**
 * Monitoring middleware for API performance tracking and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, LogContext } from './logger';
import { metrics } from './metrics';

export interface RequestMetrics {
  startTime: number;
  requestId: string;
  userId?: string;
  endpoint: string;
  method: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
    }
  }
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createRequestMetrics(request: NextRequest, requestId: string): RequestMetrics {
  return {
    startTime: Date.now(),
    requestId,
    endpoint: request.nextUrl.pathname,
    method: request.method
  };
}

export function logRequestStart(metrics: RequestMetrics, userId?: string) {
  const context: LogContext = {
    requestId: metrics.requestId,
    endpoint: metrics.endpoint,
    method: metrics.method,
    userId
  };

  logger.apiRequest(metrics.method, metrics.endpoint, context);
}

export function logRequestEnd(metrics: RequestMetrics, response: NextResponse, userId?: string, error?: string) {
  const duration = Date.now() - metrics.startTime;
  const statusCode = response.status;

  const context: LogContext = {
    requestId: metrics.requestId,
    endpoint: metrics.endpoint,
    method: metrics.method,
    statusCode,
    duration,
    userId,
    error
  };

  logger.apiResponse(metrics.method, metrics.endpoint, statusCode, duration, context);
  
  // Track metrics
  metrics.recordApiCall(metrics.endpoint, metrics.method, statusCode, duration);
}

export function checkRateLimit(clientId: string): { allowed: boolean; resetTime: number; remaining: number } {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'); // 1 minute
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'); // 100 requests per minute
  
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const clientData = rateLimitStore.get(clientId);
  
  if (!clientData || clientData.resetTime <= now) {
    // Reset or initialize
    const resetTime = now + windowMs;
    rateLimitStore.set(clientId, { count: 1, resetTime });
    return { allowed: true, resetTime, remaining: maxRequests - 1 };
  }
  
  if (clientData.count >= maxRequests) {
    return { allowed: false, resetTime: clientData.resetTime, remaining: 0 };
  }
  
  clientData.count++;
  rateLimitStore.set(clientId, clientData);
  
  return { allowed: true, resetTime: clientData.resetTime, remaining: maxRequests - clientData.count };
}

export function withMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const requestId = generateRequestId();
    const requestMetrics = createRequestMetrics(request, requestId);
    
    // Extract client ID for rate limiting (IP or user ID)
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientId);
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: 'Rate limit exceeded', resetTime: rateLimit.resetTime },
        { status: 429 }
      );
      
      response.headers.set('X-RateLimit-Limit', process.env.RATE_LIMIT_MAX_REQUESTS || '100');
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
      
      logRequestEnd(requestMetrics, response, undefined, 'Rate limit exceeded');
      return response;
    }

    logRequestStart(requestMetrics);
    
    try {
      const response = await handler(...args);
      
      // Add monitoring headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-RateLimit-Limit', process.env.RATE_LIMIT_MAX_REQUESTS || '100');
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
      
      logRequestEnd(requestMetrics, response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const response = NextResponse.json(
        { error: 'Internal server error', requestId },
        { status: 500 }
      );
      
      response.headers.set('X-Request-ID', requestId);
      logRequestEnd(requestMetrics, response, undefined, errorMessage);
      
      logger.error('Unhandled API error', {
        requestId,
        endpoint: requestMetrics.endpoint,
        method: requestMetrics.method,
        error: errorMessage,
        metadata: { stack: error instanceof Error ? error.stack : undefined }
      });
      
      return response;
    }
  };
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [clientId, data] of rateLimitStore.entries()) {
    if (data.resetTime <= now) {
      rateLimitStore.delete(clientId);
    }
  }
}, 60000); // Cleanup every minute