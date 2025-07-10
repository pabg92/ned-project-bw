# Credits and Profile Unlock System

## Overview

The Board Champions platform uses a credit-based system for companies to unlock and view detailed candidate profiles. This document covers the implementation, troubleshooting, and usage of the credit system.

## System Architecture

### 1. Credit Storage

Credits are stored in Clerk's user metadata for simplicity and real-time updates:

```typescript
// User metadata structure
{
  publicMetadata: {
    role: 'company',
    credits: 10,
    unlockedProfiles: ['profile-id-1', 'profile-id-2'],
    companyName: 'Company Name'
  }
}
```

### 2. Authentication & Role Management

#### Middleware Configuration

The middleware handles role-based access control with special handling for the credits API:

```typescript
// middleware.ts
if (req.nextUrl.pathname.startsWith('/api/user/credits')) {
  console.log('[Middleware] Allowing credits API to handle role check internally');
  return NextResponse.next();
}
```

This allows the credits API to perform its own role validation, solving the issue where `currentUser()` cannot be used in middleware.

#### Role Checking in API

The credits API endpoints validate user roles internally:

```typescript
// api/user/credits/route.ts
const userRole = user.publicMetadata?.role as string;
if (userRole !== 'company' && userRole !== 'admin') {
  return createErrorResponse('Company account required', 403);
}
```

### 3. Profile Unlocking Flow

1. **User clicks "Unlock Profile (1 Credit)"**
2. **Frontend calls POST /api/user/credits** with profile ID
3. **API validates:**
   - User is authenticated
   - User has company role
   - User has sufficient credits
4. **API updates Clerk metadata:**
   - Deducts credits
   - Adds profile ID to unlockedProfiles array
   - Records transaction in creditHistory
5. **Profile page checks unlock status** and shows full details

## API Endpoints

### GET /api/user/credits

Returns the current user's credit balance:

```json
{
  "success": true,
  "data": {
    "credits": 10,
    "userId": "user_123",
    "email": "company@example.com"
  }
}
```

### POST /api/user/credits

Deducts credits when unlocking a profile:

**Request:**
```json
{
  "amount": 1,
  "profileId": "profile-123",
  "reason": "profile_unlock"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "credits": 9,
    "deducted": 1,
    "profileId": "profile-123"
  }
}
```

## Frontend Integration

### useCredits Hook

Provides credit management functionality:

```typescript
const { credits, loading, error, deductCredits, refetchCredits } = useCredits();

// Unlock a profile
const result = await deductCredits(1, profileId);
```

### Profile Page Integration

The profile page checks if a user has unlocked the profile:

```typescript
// In api/search/profiles/[id]/route.ts
const user = await currentUser();
const unlockedProfiles = user.publicMetadata?.unlockedProfiles as string[] || [];
const hasUnlockedProfile = unlockedProfiles.includes(profileId);
```

## Common Issues & Solutions

### 1. "Unexpected token '<', '<!DOCTYPE'... is not valid JSON"

**Cause:** The middleware is redirecting API calls to HTML pages instead of returning JSON.

**Solution:** 
- Add special handling in middleware to bypass role checking for credits API
- Let the API endpoint handle role validation internally

### 2. "Cannot read properties of undefined (reading 'getUser')"

**Cause:** Using `clerkClient()` incorrectly in middleware.

**Solution:**
- Remove `clerkClient` from middleware imports
- Use `currentUser()` in API routes instead
- Or configure custom claims in Clerk dashboard

### 3. Credits not updating in UI

**Cause:** React state not refreshing after API call.

**Solution:**
- The `useCredits` hook automatically updates state after successful deduction
- Manual refresh can be triggered with `refetchCredits()`

## Testing the System

### 1. Add Credits to a User

```bash
pnpm tsx scripts/add-clerk-credits.ts
```

### 2. Update User Role

```bash
pnpm tsx scripts/fix-user-role.ts
```

### 3. Test Profile Unlock

1. Sign in as a company user
2. Navigate to a candidate profile
3. Click "Unlock Profile (1 Credit)"
4. Verify:
   - Credits are deducted
   - Profile shows full details
   - Download CV button appears

## Configuration Notes

### Clerk Dashboard Settings

For production, configure Clerk to include `publicMetadata` in session claims:

1. Go to Clerk Dashboard > Sessions
2. Edit session token
3. Add custom claim:
   ```json
   {
     "publicMetadata": "{{user.public_metadata}}"
   }
   ```

This eliminates the need for the middleware workaround.

### Environment Variables

Ensure these are set in `.env.local`:

```env
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Security Considerations

1. **Role Validation:** Always validate user roles on the server side
2. **Credit Deduction:** Use database transactions or atomic updates to prevent race conditions
3. **Profile Access:** Check both authentication and profile unlock status before showing sensitive data

## Future Enhancements

1. **Credit Packages:** Implement different credit packages for purchase
2. **Credit History:** Add a detailed transaction history page
3. **Bulk Unlock:** Allow unlocking multiple profiles at once
4. **Credit Expiry:** Implement credit expiration dates
5. **Refund System:** Add ability to refund credits for specific cases