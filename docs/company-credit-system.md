# Company Credit System Documentation

## Overview

The credit system enables companies to unlock full access to candidate profiles through a pay-per-view model. Credits are managed through Clerk's metadata system and provide a flexible, trackable way to monetize profile access.

## Architecture

### Credit Storage
Credits are stored in Clerk user metadata:
- **Current Balance**: `publicMetadata.credits` (number)
- **Transaction History**: `privateMetadata.creditHistory` (array)
- **Unlocked Profiles**: `publicMetadata.unlockedProfiles` (string array)

### Key Components

1. **Frontend Credit Display** (`/components/ui/credit-display.tsx`)
   - Shows current balance in navigation
   - Updates in real-time after transactions
   - Only visible to company users

2. **Profile Unlock Flow** (`/search/[id]`)
   - Check if profile already unlocked
   - Verify sufficient credits
   - Deduct credit and unlock profile
   - Record transaction

3. **API Endpoints**
   - `GET /api/user/credits` - Get current balance
   - `POST /api/user/credits` - Unlock profile (deduct credit)

## User Flow

### Company Perspective

1. **Initial Setup**
   - Company signs up via Clerk
   - Completes onboarding form
   - Admin grants initial credits

2. **Browsing Profiles**
   - View limited profile information for free
   - See "Unlock Full Profile" button
   - Credit cost displayed (1 credit)

3. **Unlocking a Profile**
   - Click "Unlock Profile" button
   - Confirmation dialog shows cost
   - Credit deducted upon confirmation
   - Full profile immediately visible
   - Profile remains unlocked forever

4. **Credit Management**
   - View balance in navigation bar
   - Contact admin for more credits
   - See unlocked profiles in account

### Admin Perspective

1. **Granting Credits**
   - Access company via `/admin/companies`
   - Edit company to manage credits
   - Add credits with reason
   - View transaction history

2. **Monitoring Usage**
   - Track credits across all companies
   - See which profiles were unlocked
   - Review transaction patterns
   - Export reports if needed

## API Implementation

### Get Credits
```typescript
// GET /api/user/credits
{
  "success": true,
  "data": {
    "credits": 10,
    "unlockedProfiles": ["profile-id-1", "profile-id-2"]
  }
}
```

### Unlock Profile
```typescript
// POST /api/user/credits
// Body: { "profileId": "profile-uuid", "profileTitle": "Senior Executive" }

// Success Response:
{
  "success": true,
  "data": {
    "newBalance": 9,
    "profileUnlocked": true,
    "unlockedProfiles": ["profile-id-1", "profile-id-2", "profile-id-3"]
  },
  "message": "Profile unlocked successfully"
}

// Insufficient Credits:
{
  "success": false,
  "error": "Insufficient credits",
  "code": 402
}
```

## Transaction Types

1. **admin_grant**: Admin adds credits
2. **admin_deduction**: Admin removes credits
3. **admin_reset**: Admin resets credits to 0
4. **admin_unlock_reset**: Admin resets unlocked profiles
5. **profile_unlock**: User unlocks a profile
6. **system_grant**: Automated credit addition (future)
7. **refund**: Credit refund for issues (future)

## Transaction Record Structure

```typescript
interface CreditTransaction {
  timestamp: string;          // ISO 8601 timestamp
  amount: number;            // Positive or negative
  balance: number;           // Balance after transaction
  reason: string;            // Human-readable reason
  type: TransactionType;     // Transaction type enum
  adminId?: string;          // Admin who made change
  adminEmail?: string;       // Admin email
  adminNote?: string;        // Additional admin notes
  profileId?: string;        // For profile unlocks
  profileTitle?: string;     // Profile title for reference
}
```

## Security Measures

1. **Role Verification**
   - Only 'company' and 'admin' roles can access credits
   - Middleware checks prevent unauthorized access

2. **Transaction Integrity**
   - All changes create audit records
   - Cannot modify history retroactively
   - Balance calculated from transactions

3. **Profile Access**
   - Unlocked profiles stored in array
   - Check prevents double-charging
   - Access persists even if credits removed

## Integration Points

### Middleware (`/middleware.ts`)
- Bypasses role check for credits API
- Allows API to handle role verification
- Prevents redirect loops

### Profile API (`/api/search/profiles/[id]`)
- Checks if user has unlocked profile
- Returns full data only if unlocked
- Maintains data privacy

### Search Results (`/search`)
- Shows unlock status on cards
- Displays credit cost
- Updates UI after unlock

## Best Practices

### For Companies
1. **Budget credits wisely** - Each unlock is permanent
2. **Review profiles carefully** before unlocking
3. **Track unlocked profiles** for team access
4. **Request credits in bulk** for better planning

### For Admins
1. **Document credit grants** with clear reasons
2. **Monitor usage patterns** for abuse
3. **Set credit policies** for consistency
4. **Review transactions regularly**

### For Developers
1. **Always check credit balance** before operations
2. **Record all transactions** with full context
3. **Handle edge cases** (negative balance, missing metadata)
4. **Maintain transaction integrity**

## Future Enhancements

1. **Credit Packages**
   - Bulk purchase options
   - Volume discounts
   - Subscription models

2. **Advanced Analytics**
   - Usage patterns
   - ROI tracking
   - Profile popularity

3. **Automated Systems**
   - Auto-recharge
   - Usage alerts
   - Expiry dates

4. **Team Features**
   - Shared credit pools
   - Team member limits
   - Usage reports

## Troubleshooting

### Credits Not Showing
1. Check user role is 'company'
2. Verify publicMetadata.credits exists
3. Check for console errors
4. Verify Clerk authentication

### Unlock Not Working
1. Confirm sufficient credits
2. Check if already unlocked
3. Verify profile exists
4. Check API response

### Transaction History Issues
1. Ensure privateMetadata exists
2. Check creditHistory array
3. Verify transaction format
4. Look for API errors