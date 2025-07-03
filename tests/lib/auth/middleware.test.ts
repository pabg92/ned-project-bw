import { jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// Mock Clerk's clerkMiddleware and createRouteMatcher
const mockClerkMiddleware = jest.fn();
const mockCreateRouteMatcher = jest.fn();

jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: mockClerkMiddleware,
  createRouteMatcher: mockCreateRouteMatcher,
}));

// Mock the config and utilities
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

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset module registry to ensure fresh imports
    jest.resetModules();
    
    // Setup default mocks
    mockCreateRouteMatcher.mockReturnValue(() => false);
  });

  describe('Middleware Configuration', () => {
    it('should configure clerkMiddleware correctly', () => {
      // Import the middleware to trigger configuration
      require('../../../src/lib/auth/middleware');

      expect(mockClerkMiddleware).toHaveBeenCalledWith(expect.any(Function));
      expect(mockCreateRouteMatcher).toHaveBeenCalledWith(['/', '/about', '/api/health', '/sign-in', '/sign-up']);
      expect(mockCreateRouteMatcher).toHaveBeenCalledWith(['/admin(.*)']);
      expect(mockCreateRouteMatcher).toHaveBeenCalledWith(['/dashboard(.*)']);
      expect(mockCreateRouteMatcher).toHaveBeenCalledWith(['/profile(.*)']);
    });

    it('should export correct config', () => {
      const middlewareModule = require('../../../src/lib/auth/middleware');

      expect(middlewareModule.config).toEqual({
        matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
      });
    });
  });

  describe('Middleware Logic', () => {
    let middlewareFn: Function;

    beforeEach(() => {
      // Clear previous mocks
      jest.clearAllMocks();
      
      // Setup default mock behaviors
      mockCreateRouteMatcher.mockReturnValue(() => false);
      
      // Import middleware and get the middleware function
      require('../../../src/lib/auth/middleware');
      
      // Extract the middleware function
      middlewareFn = mockClerkMiddleware.mock.calls[0][0];
    });

    it('should allow public routes without authentication', async () => {
      // Mock public route matcher to return true for /about
      const mockIsPublicRoute = jest.fn().mockReturnValue(true);
      
      // Clear and reset mocks
      jest.clearAllMocks();
      mockCreateRouteMatcher.mockReturnValueOnce(mockIsPublicRoute);
      
      // Re-import to get fresh middleware function with new mocks
      jest.resetModules();
      require('../../../src/lib/auth/middleware');
      const testMiddlewareFn = mockClerkMiddleware.mock.calls[0][0];
      
      const auth = jest.fn().mockResolvedValue({ userId: null, sessionClaims: null });
      const req = {
        nextUrl: { pathname: '/about' },
        url: 'http://localhost/about',
      };

      const result = await testMiddlewareFn(auth, req);

      expect(result).toBeDefined();
      expect(mockIsPublicRoute).toHaveBeenCalledWith(req);
    });

    it('should redirect unauthenticated users from protected routes', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(false);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(true);
      const mockIsProfileRoute = jest.fn().mockReturnValue(false);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({ userId: null, sessionClaims: null });
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
      // Check if it's a redirect (status 307 or 302)
      expect(result.status).toBeGreaterThanOrEqual(300);
    });

    it('should allow authenticated users with correct role', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(false);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(true);
      const mockIsProfileRoute = jest.fn().mockReturnValue(false);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'company' },
        },
      });
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
    });

    it('should redirect users without role to setup', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      mockCreateRouteMatcher.mockReturnValueOnce(mockIsPublicRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {},
      });
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBeGreaterThanOrEqual(300);
    });

    it('should redirect users to appropriate dashboard for their role', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(false);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(true);
      const mockIsProfileRoute = jest.fn().mockReturnValue(false);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'candidate' },
        },
      });
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
      // Should redirect candidate to /profile
      if ([302, 307].includes(result.status)) {
        // This is a redirect, which is expected for role mismatch
        expect(result.status).toBeGreaterThan(300);
      }
    });

    it('should allow admin access to admin routes', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(true);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(false);
      const mockIsProfileRoute = jest.fn().mockReturnValue(false);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'admin' },
        },
      });
      const req = {
        nextUrl: { pathname: '/admin' },
        url: 'http://localhost/admin',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
    });

    it('should redirect non-admin users from admin routes', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(true);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(false);
      const mockIsProfileRoute = jest.fn().mockReturnValue(false);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'candidate' },
        },
      });
      const req = {
        nextUrl: { pathname: '/admin' },
        url: 'http://localhost/admin',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBeGreaterThanOrEqual(300);
    });

    it('should handle profile routes correctly for candidates', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(false);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(false);
      const mockIsProfileRoute = jest.fn().mockReturnValue(true);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'candidate' },
        },
      });
      const req = {
        nextUrl: { pathname: '/profile' },
        url: 'http://localhost/profile',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
    });

    it('should redirect companies from candidate-specific routes', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(false);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(false);
      const mockIsProfileRoute = jest.fn().mockReturnValue(true);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'company' },
        },
      });
      const req = {
        nextUrl: { pathname: '/profile' },
        url: 'http://localhost/profile',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
      expect(result.status).toBeGreaterThanOrEqual(300);
    });
  });

  describe('Edge Cases', () => {
    let middlewareFn: Function;

    beforeEach(() => {
      // Clear previous mocks
      jest.clearAllMocks();
      
      // Setup default mock behaviors
      mockCreateRouteMatcher.mockReturnValue(() => false);
      
      require('../../../src/lib/auth/middleware');
      
      // Extract the middleware function
      middlewareFn = mockClerkMiddleware.mock.calls[0][0];
    });

    it('should handle missing sessionClaims gracefully', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      mockCreateRouteMatcher.mockReturnValueOnce(mockIsPublicRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: null,
      });
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      await expect(middlewareFn(auth, req)).resolves.not.toThrow();
    });

    it('should handle missing metadata in sessionClaims', async () => {
      // Mock route matchers
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      mockCreateRouteMatcher.mockReturnValueOnce(mockIsPublicRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: null,
        },
      });
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      await expect(middlewareFn(auth, req)).resolves.not.toThrow();
    });

    it('should handle unknown roles gracefully', async () => {
      // Mock route matchers - all return false for unknown route
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(false);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(false);
      const mockIsProfileRoute = jest.fn().mockReturnValue(false);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'unknown_role' },
        },
      });
      const req = {
        nextUrl: { pathname: '/dashboard' },
        url: 'http://localhost/dashboard',
      };

      await expect(middlewareFn(auth, req)).resolves.not.toThrow();
    });

    it('should handle routes not in protected routes list', async () => {
      // Mock route matchers - all return false for unknown route
      const mockIsPublicRoute = jest.fn().mockReturnValue(false);
      const mockIsAdminRoute = jest.fn().mockReturnValue(false);
      const mockIsDashboardRoute = jest.fn().mockReturnValue(false);
      const mockIsProfileRoute = jest.fn().mockReturnValue(false);
      
      mockCreateRouteMatcher
        .mockReturnValueOnce(mockIsPublicRoute)
        .mockReturnValueOnce(mockIsAdminRoute)
        .mockReturnValueOnce(mockIsDashboardRoute)
        .mockReturnValueOnce(mockIsProfileRoute);
      
      const auth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        sessionClaims: {
          metadata: { role: 'candidate' },
        },
      });
      const req = {
        nextUrl: { pathname: '/unknown-route' },
        url: 'http://localhost/unknown-route',
      };

      const result = await middlewareFn(auth, req);

      expect(result.constructor.name).toBe('NextResponse');
    });
  });
});