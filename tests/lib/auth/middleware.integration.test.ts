import { jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// Mock the config
jest.mock('../../../src/lib/auth/config', () => ({
  PUBLIC_ROUTES: ['/', '/about', '/api/health', '/sign-in', '/sign-up'],
  PROTECTED_ROUTES: {
    candidate: ['/profile', '/settings'],
    company: ['/dashboard', '/search'],
    admin: ['/admin'],
  },
  ROLE_REDIRECTS: {
    candidate: '/profile',
    company: '/dashboard',
    admin: '/admin',
  },
}));

// Mock Clerk's clerkMiddleware and createRouteMatcher
let mockAuth: any;
let actualMiddleware: any;

jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: jest.fn((middlewareFn) => {
    actualMiddleware = middlewareFn;
    return middlewareFn;
  }),
  createRouteMatcher: jest.fn((routes) => {
    return (req: any) => {
      const pathname = req.nextUrl?.pathname || req.pathname;
      return routes.some((route: string) => {
        if (route.includes('(.*)')) {
          const baseRoute = route.replace('(.*)', '');
          return pathname.startsWith(baseRoute);
        }
        return routes.includes(pathname);
      });
    };
  }),
}));

describe('Authentication Middleware Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAuth = jest.fn();
    
    // Import the middleware
    require('../../../src/lib/auth/middleware');
  });

  describe('Public Routes', () => {
    it('should allow access to public routes without authentication', async () => {
      mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

      const req = {
        nextUrl: { pathname: '/about' },
        url: 'http://localhost/about',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBe(200);
    });

    it('should allow access to API health endpoint', async () => {
      mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

      const req = {
        nextUrl: { pathname: '/api/health' },
        url: 'http://localhost/api/health',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBe(200);
    });
  });

  describe('Authentication Required', () => {
    it('should redirect unauthenticated users from protected routes', async () => {
      mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBeGreaterThanOrEqual(300);
      expect(result.headers.get('location')).toContain('/sign-in');
    });

    it('should redirect users without role to setup', async () => {
      mockAuth.mockResolvedValue({
        userId: 'user_123',
        sessionClaims: { metadata: null },
      });

      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBeGreaterThanOrEqual(300);
      expect(result.headers.get('location')).toContain('/setup-role');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin access to admin routes', async () => {
      mockAuth.mockResolvedValue({
        userId: 'admin_123',
        sessionClaims: {
          metadata: { role: 'admin' },
        },
      });

      const req = {
        nextUrl: { pathname: '/admin' },
        url: 'http://localhost/admin',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBe(200);
    });

    it('should redirect non-admin users from admin routes', async () => {
      mockAuth.mockResolvedValue({
        userId: 'candidate_123',
        sessionClaims: {
          metadata: { role: 'candidate' },
        },
      });

      const req = {
        nextUrl: { pathname: '/admin' },
        url: 'http://localhost/admin',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBeGreaterThanOrEqual(300);
      expect(result.headers.get('location')).toContain('/profile');
    });

    it('should allow company access to dashboard routes', async () => {
      mockAuth.mockResolvedValue({
        userId: 'company_123',
        sessionClaims: {
          metadata: { role: 'company' },
        },
      });

      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBe(200);
    });

    it('should redirect candidates from dashboard routes', async () => {
      mockAuth.mockResolvedValue({
        userId: 'candidate_123',
        sessionClaims: {
          metadata: { role: 'candidate' },
        },
      });

      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBeGreaterThanOrEqual(300);
      expect(result.headers.get('location')).toContain('/profile');
    });

    it('should allow candidate access to profile routes', async () => {
      mockAuth.mockResolvedValue({
        userId: 'candidate_123',
        sessionClaims: {
          metadata: { role: 'candidate' },
        },
      });

      const req = {
        nextUrl: { pathname: '/profile' },
        url: 'http://localhost/profile',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBe(200);
    });

    it('should redirect companies from profile routes', async () => {
      mockAuth.mockResolvedValue({
        userId: 'company_123',
        sessionClaims: {
          metadata: { role: 'company' },
        },
      });

      const req = {
        nextUrl: { pathname: '/profile' },
        url: 'http://localhost/profile',
      };

      const result = await actualMiddleware(mockAuth, req);
      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBeGreaterThanOrEqual(300);
      expect(result.headers.get('location')).toContain('/dashboard');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing sessionClaims gracefully', async () => {
      mockAuth.mockResolvedValue({
        userId: 'user_123',
        sessionClaims: null,
      });

      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      await expect(actualMiddleware(mockAuth, req)).resolves.not.toThrow();
    });

    it('should handle unknown roles gracefully', async () => {
      mockAuth.mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'unknown_role' },
        },
      });

      const req = {
        nextUrl: { pathname: '/some-route' },
        url: 'http://localhost/some-route',
      };

      await expect(actualMiddleware(mockAuth, req)).resolves.not.toThrow();
    });
  });
});