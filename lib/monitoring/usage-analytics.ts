/**
 * Usage analytics tracking for business metrics
 * Tracks user behavior and feature adoption
 */

import { logger } from './logger';

export interface UsageEvent {
  event: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export interface AnalyticsMetrics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  featureUsage: Record<string, number>;
  userJourneys: Record<string, number>;
  conversionRates: Record<string, number>;
}

class UsageAnalytics {
  private events: UsageEvent[] = [];
  private readonly maxEvents = 50000; // Keep last 50k events in memory

  track(event: string, userId?: string, properties?: Record<string, any>) {
    const usageEvent: UsageEvent = {
      event,
      userId,
      properties,
      timestamp: Date.now()
    };

    this.events.push(usageEvent);

    // Keep memory bounded
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log for external analytics services
    logger.info('Usage Analytics', {
      event,
      userId,
      properties,
      timestamp: usageEvent.timestamp
    });
  }

  // Track user registration
  trackUserRegistration(userId: string, userType: 'candidate' | 'company', properties?: Record<string, any>) {
    this.track('user_registration', userId, {
      userType,
      ...properties
    });
  }

  // Track profile completion
  trackProfileCompletion(userId: string, completionPercentage: number, profileType: string) {
    this.track('profile_completion', userId, {
      completionPercentage,
      profileType
    });
  }

  // Track search usage
  trackSearch(userId: string, searchType: string, resultsCount: number, filters?: Record<string, any>) {
    this.track('search_performed', userId, {
      searchType,
      resultsCount,
      filters
    });
  }

  // Track payment events
  trackPayment(userId: string, amount: number, currency: string, paymentType: string, success: boolean) {
    this.track('payment_attempt', userId, {
      amount,
      currency,
      paymentType,
      success
    });
  }

  // Track feature adoption
  trackFeatureUsage(userId: string, feature: string, action: string, properties?: Record<string, any>) {
    this.track('feature_usage', userId, {
      feature,
      action,
      ...properties
    });
  }

  // Get analytics metrics
  getAnalytics(timeWindow: '1h' | '24h' | '7d' | '30d' = '24h'): AnalyticsMetrics {
    const now = Date.now();
    const windowMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }[timeWindow];

    const windowStart = now - windowMs;
    const windowEvents = this.events.filter(e => e.timestamp > windowStart);

    // Calculate DAU/MAU
    const uniqueUsers = new Set(windowEvents.filter(e => e.userId).map(e => e.userId));
    const dailyActiveUsers = timeWindow === '24h' ? uniqueUsers.size : 0;
    const monthlyActiveUsers = timeWindow === '30d' ? uniqueUsers.size : 0;

    // Calculate feature usage
    const featureUsage: Record<string, number> = {};
    windowEvents.forEach(event => {
      featureUsage[event.event] = (featureUsage[event.event] || 0) + 1;
    });

    // Calculate user journeys (simplified)
    const userJourneys: Record<string, number> = {
      'registration_to_profile': this.calculateConversionRate(
        windowEvents,
        'user_registration',
        'profile_completion'
      ),
      'search_to_contact': this.calculateConversionRate(
        windowEvents,
        'search_performed',
        'contact_initiated'
      ),
      'profile_view_to_contact': this.calculateConversionRate(
        windowEvents,
        'profile_viewed',
        'contact_initiated'
      )
    };

    // Calculate conversion rates
    const conversionRates: Record<string, number> = {
      'payment_success_rate': this.calculatePaymentSuccessRate(windowEvents),
      'profile_completion_rate': this.calculateProfileCompletionRate(windowEvents),
      'search_to_action_rate': this.calculateSearchActionRate(windowEvents)
    };

    return {
      dailyActiveUsers,
      monthlyActiveUsers,
      featureUsage,
      userJourneys,
      conversionRates
    };
  }

  private calculateConversionRate(events: UsageEvent[], fromEvent: string, toEvent: string): number {
    const userFlows = new Map<string, { from: boolean; to: boolean }>();

    events.forEach(event => {
      if (!event.userId) return;

      if (!userFlows.has(event.userId)) {
        userFlows.set(event.userId, { from: false, to: false });
      }

      const flow = userFlows.get(event.userId)!;
      if (event.event === fromEvent) flow.from = true;
      if (event.event === toEvent) flow.to = true;
    });

    const completed = Array.from(userFlows.values()).filter(flow => flow.from && flow.to).length;
    const started = Array.from(userFlows.values()).filter(flow => flow.from).length;

    return started > 0 ? completed / started : 0;
  }

  private calculatePaymentSuccessRate(events: UsageEvent[]): number {
    const paymentEvents = events.filter(e => e.event === 'payment_attempt');
    const successfulPayments = paymentEvents.filter(e => e.properties?.success === true);
    
    return paymentEvents.length > 0 ? successfulPayments.length / paymentEvents.length : 0;
  }

  private calculateProfileCompletionRate(events: UsageEvent[]): number {
    const registrations = events.filter(e => e.event === 'user_registration').length;
    const completions = events.filter(e => 
      e.event === 'profile_completion' && 
      (e.properties?.completionPercentage >= 80)
    ).length;
    
    return registrations > 0 ? completions / registrations : 0;
  }

  private calculateSearchActionRate(events: UsageEvent[]): number {
    const searches = events.filter(e => e.event === 'search_performed').length;
    const actions = events.filter(e => 
      ['profile_viewed', 'contact_initiated', 'save_candidate'].includes(e.event)
    ).length;
    
    return searches > 0 ? actions / searches : 0;
  }

  // Export data for external analytics platforms
  exportEvents(format: 'json' | 'csv' = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.events, null, 2);
    }

    // Simple CSV export
    const headers = ['timestamp', 'event', 'userId', 'properties'];
    const rows = this.events.map(event => [
      new Date(event.timestamp).toISOString(),
      event.event,
      event.userId || '',
      JSON.stringify(event.properties || {})
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Get top events
  getTopEvents(limit = 10, timeWindow: '1h' | '24h' | '7d' = '24h') {
    const analytics = this.getAnalytics(timeWindow);
    return Object.entries(analytics.featureUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  }

  // Get user behavior insights
  getUserInsights(userId: string) {
    const userEvents = this.events.filter(e => e.userId === userId);
    const eventCounts = userEvents.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: userEvents.length,
      firstSeen: userEvents.length > 0 ? new Date(Math.min(...userEvents.map(e => e.timestamp))) : null,
      lastSeen: userEvents.length > 0 ? new Date(Math.max(...userEvents.map(e => e.timestamp))) : null,
      eventBreakdown: eventCounts,
      mostUsedFeature: Object.entries(eventCounts).sort(([,a], [,b]) => b - a)[0]?.[0]
    };
  }
}

export const analytics = new UsageAnalytics();