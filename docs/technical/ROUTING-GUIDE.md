# Board Champions Routing Guide

## Overview

This guide documents the complete routing architecture for Board Champions, including route protection, authentication flows, middleware configuration, and redirect logic.

## Route Categories

### 1. Public Routes (No Authentication Required)

| Route | Purpose | Components |
|-------|---------|------------|
| `/` | Homepage | Marketing content, CTAs |
| `/companies` | Company information | Benefits, pricing, sign-up CTA |
| `/signup` | Candidate application | Multi-step form (no auth) |
| `/signup/success` | Application confirmation | Success message |
| `/sign-in/*` | Clerk sign-in | Authentication UI |
| `/sign-up/*` | Clerk sign-up | Registration UI |

### 2. Company Routes (Requires Company Role)

| Route | Purpose | Access |
|-------|---------|---------|
| `/search` | Browse candidates | Company, Admin |
| `/search/[id]` | View candidate profile | Company (if unlocked), Admin |
| `/billing` | Purchase credits | Company only |
| `/credits` | Credit history | Company, Admin |
| `/shortlist` | Saved candidates | Company, Admin |

### 3. Admin Routes (Requires Admin Role)

| Route | Purpose | Access |
|-------|---------|---------|
| `/admin` | Dashboard | Admin only |
| `/admin/candidates` | Manage all candidates | Admin only |
| `/admin/candidates/[id]` | Individual candidate | Admin only |
| `/admin/candidates/[id]/edit` | Edit candidate | Admin only |
| `/admin/analytics` | Platform statistics | Admin only |

### 4. Future Candidate Routes

| Route | Purpose | Status |
|-------|---------|---------|
| `/profile` | View own profile | Planned |
| `/profile/edit` | Edit own profile | Planned |
| `/profile/settings` | Privacy settings | Planned |

## Middleware Configuration

### Current Implementation
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)", 
  "/signup(.*)",              // Candidate application
  "/companies",               // Company landing
  "/api/v1/candidates/signup", // Public API
  "/api/webhooks(.*)",
]);

// Define role-specific routes
const isCompanyRoute = createRouteMatcher([
  "/search(.*)",
  "/billing(.*)",
  "/credits(.*)",
  "/shortlist(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  
  // Check company routes
  if (isCompanyRoute(req)) {
    if (!userId) {
      return redirectToSignIn(req);
    }
    
    const userRole = sessionClaims?.publicMetadata?.role;
    if (userRole !== 'company' && userRole !== 'admin') {
      return redirectToCompanyInfo(req);
    }
  }
  
  // Check admin routes
  if (isAdminRoute(req)) {
    if (!userId) {
      return redirectToSignIn(req);
    }
    
    const userRole = sessionClaims?.publicMetadata?.role;
    if (userRole !== 'admin') {
      return redirectToHome(req);
    }
  }
  
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

## Authentication Flows

### 1. Company Sign-Up Flow
```
/companies → /sign-up?role=company → Set metadata → /search
```

**Implementation Details**:
1. User lands on `/companies` page
2. Clicks "Get Started" button
3. Redirected to `/sign-up?role=company`
4. Clerk sign-up form with role parameter
5. On completion, webhook sets role metadata
6. Auto-redirect to `/search`

### 2. Company Sign-In Flow
```
/sign-in → Check role → Redirect based on role
```

**Redirect Logic**:
```typescript
// In sign-in page
const getRedirectUrl = (role: string, intendedUrl?: string) => {
  // If user was trying to access specific page
  if (intendedUrl && isAuthorizedForUrl(role, intendedUrl)) {
    return intendedUrl;
  }
  
  // Default redirects by role
  switch(role) {
    case 'company':
      return '/search';
    case 'admin':
      return '/admin';
    case 'candidate':
      return '/profile'; // Future
    default:
      return '/';
  }
};
```

### 3. Candidate Application Flow
```
/ → /signup → Form submission → /signup/success
```

**No Authentication Required**:
- Public form submission
- Creates database record only
- No Clerk account
- Awaits admin approval

## Route Protection Patterns

### 1. Authentication Check
```typescript
// Basic auth check
if (!userId) {
  const signInUrl = new URL('/sign-in', req.url);
  signInUrl.searchParams.set('redirect_url', req.url);
  return NextResponse.redirect(signInUrl);
}
```

### 2. Role-Based Access
```typescript
// Role verification
const userRole = sessionClaims?.publicMetadata?.role;

if (!isAuthorizedRole(userRole, requiredRoles)) {
  return NextResponse.redirect(new URL('/unauthorized', req.url));
}
```

### 3. Resource-Level Access
```typescript
// Check specific resource access (e.g., unlocked profiles)
const hasAccess = await checkProfileAccess(userId, profileId);
if (!hasAccess) {
  return NextResponse.json({ 
    error: 'Profile locked. Credits required.' 
  }, { status: 403 });
}
```

## API Route Protection

### Public API Endpoints
```typescript
// No protection needed
POST   /api/v1/candidates/signup     // Public application
GET    /api/webhooks/clerk          // Webhook endpoint
```

### Protected API Endpoints
```typescript
// Requires authentication
GET    /api/user/profile            // User's own data
GET    /api/user/credits            // Credit balance
POST   /api/user/credits/purchase   // Buy credits

// Requires company role
GET    /api/search/candidates       // Search profiles
POST   /api/profiles/[id]/unlock    // Unlock profile

// Requires admin role
GET    /api/admin/candidates        // All candidates
POST   /api/admin/candidates/[id]/approve
```

### API Protection Pattern
```typescript
// In API route
export async function GET(request: Request) {
  const { userId, sessionClaims } = auth();
  
  // Check authentication
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Check role
  const userRole = sessionClaims?.publicMetadata?.role;
  if (!hasRequiredRole(userRole, ['company', 'admin'])) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // Process request...
}
```

## Error Handling

### Unauthorized Access
```typescript
// When user lacks authentication
Status: 401
Redirect: /sign-in?redirect_url=[original_url]

// When user lacks permissions
Status: 403
Redirect: /unauthorized or role-specific info page
```

### Invalid Routes
```typescript
// 404 handling
export default function NotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <Link href="/">Return home</Link>
    </div>
  );
}
```

## Navigation Components

### Dynamic Navigation
```typescript
// navbar.tsx
const Navbar = () => {
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  
  return (
    <nav>
      {/* Public links */}
      <Link href="/">Home</Link>
      
      {/* Role-based links */}
      {role === 'company' && (
        <>
          <Link href="/search">Search Candidates</Link>
          <Link href="/credits">Credits: {credits}</Link>
        </>
      )}
      
      {role === 'admin' && (
        <Link href="/admin">Admin Dashboard</Link>
      )}
      
      {/* Auth links */}
      {user ? (
        <UserButton />
      ) : (
        <>
          <Link href="/sign-in">Login</Link>
          <Link href="/sign-up?role=company">Sign Up</Link>
        </>
      )}
    </nav>
  );
};
```

## Redirect Utilities

### Helper Functions
```typescript
// lib/navigation.ts
export const getRoleBasedRedirect = (role: string): string => {
  const redirectMap = {
    company: '/search',
    admin: '/admin',
    candidate: '/profile',
  };
  return redirectMap[role] || '/';
};

export const isAuthorizedForRoute = (
  role: string, 
  route: string
): boolean => {
  const routePermissions = {
    '/search': ['company', 'admin'],
    '/admin': ['admin'],
    '/profile': ['candidate'],
  };
  
  const allowedRoles = routePermissions[route] || [];
  return allowedRoles.includes(role);
};
```

## Testing Routes

### Test Scenarios
```bash
# Public access
curl http://localhost:3000/
curl http://localhost:3000/signup

# Protected routes (should redirect)
curl http://localhost:3000/search
curl http://localhost:3000/admin

# With authentication
curl -H "Authorization: Bearer [token]" http://localhost:3000/api/user/profile
```

### Development Testing
```typescript
// Force role in development
if (process.env.NODE_ENV === 'development') {
  // Override role for testing
  const testRole = process.env.TEST_USER_ROLE;
  if (testRole) {
    sessionClaims.publicMetadata.role = testRole;
  }
}
```

## Common Issues & Solutions

### Issue: Infinite redirect loop
**Cause**: Redirect URL points back to protected route
**Solution**: Check redirect logic, ensure public routes are excluded

### Issue: User can't access authorized route
**Cause**: Role metadata not set properly
**Solution**: Check Clerk webhook, verify metadata structure

### Issue: API returns 403 for authorized user
**Cause**: Role check failing in API route
**Solution**: Debug sessionClaims, check role string exactly

## Future Enhancements

### 1. Dynamic Route Permissions
```typescript
// Database-driven permissions
const routePermissions = await getRoutePermissions();
const canAccess = checkDynamicPermission(user, route, routePermissions);
```

### 2. Feature Flags
```typescript
// Route availability based on features
if (featureFlags.candidateProfiles && role === 'candidate') {
  allowedRoutes.push('/profile');
}
```

### 3. Time-Based Access
```typescript
// Temporary access grants
const hasTemporaryAccess = checkTemporaryGrant(userId, route);
```

---

Last Updated: [Current Date]
Version: 1.0