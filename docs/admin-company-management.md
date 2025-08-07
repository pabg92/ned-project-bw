# Admin Company Management Documentation

## Overview

The admin company management system allows administrators to manage company accounts, their credits, and monitor their platform usage. This system integrates with Clerk for authentication and metadata storage while using Supabase for company profile data.

## Features

### 1. Company List View (`/admin/companies`)

The main company management interface provides:

- **Company Overview**: Lists all registered companies with key metrics
- **Credit Information**: Shows current credit balance and unlocked profiles count
- **Filtering Options**:
  - Search by company name or email
  - Filter by verification status (All/Verified/Unverified)
  - Filter by credit range (0, 1-10, 11-50, 51-100, 100+)
- **Sorting**: By creation date, company name, credits, or unlocked profiles
- **Pagination**: 20 companies per page
- **Summary Statistics**: Total companies, total credits, unlocked profiles, verified count

### 2. Company Edit View (`/admin/companies/[id]/edit`)

Detailed company management interface with two main sections:

#### Company Information Panel
- Edit company details:
  - Company name
  - Industry
  - Company size
  - Website
  - Contact position
  - Hiring needs
- Admin-only fields:
  - Verification status toggle
  - Internal admin notes
- Account information display:
  - User ID
  - Creation date
  - Last update
  - Onboarding status
- Delete company option (soft delete)

#### Credit Management Panel
- **Current Status**:
  - Credit balance display
  - Unlocked profiles count
- **Credit Adjustment**:
  - Add or remove credits
  - Required reason field
  - Optional admin note
  - Validation prevents negative balances
- **Reset Options**: 
  - Set credits to 0
  - Reset unlocked profiles (allows re-unlocking)
- **Transaction History**: Last 5 transactions with full details
- **Unlocked Profiles**: 
  - List of profiles the company has unlocked
  - "Reset all unlocks" button to clear the list

## API Endpoints

### 1. List Companies
```
GET /api/admin/companies
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term for company name or email
- `verificationStatus`: all, verified, unverified
- `creditRange`: all, 0, 1-10, 11-50, 51-100, 100+
- `sortBy`: created_at, company_name, credits, unlocked_profiles
- `sortOrder`: asc, desc

Response includes companies with credit information from Clerk metadata.

### 2. Get/Update Company
```
GET /api/admin/companies/[id]
PUT /api/admin/companies/[id]
DELETE /api/admin/companies/[id]
```

- **GET**: Returns full company details including credits and history
- **PUT**: Updates company information
- **DELETE**: Soft deletes by setting user role to 'deleted'

### 3. Credit Management
```
GET /api/admin/companies/[id]/credits/history
POST /api/admin/companies/[id]/credits
PATCH /api/admin/companies/[id]/credits      // Reset unlocked profiles
DELETE /api/admin/companies/[id]/credits     // Reset credits to 0
```

#### Add/Remove Credits (POST)
Request body:
```json
{
  "amount": 10,        // positive to add, negative to remove
  "reason": "Demo credits for presentation",
  "adminNote": "Approved by management"  // optional
}
```

#### Reset Unlocked Profiles (PATCH)
No request body needed. This endpoint:
- Clears the `unlockedProfiles` array
- Keeps credits unchanged
- Records transaction in history
- Returns count of profiles that were reset

#### Credit Transaction Record
Each transaction creates a record with:
```json
{
  "timestamp": "2025-01-10T15:30:00Z",
  "amount": 10,
  "balance": 25,  // new balance after transaction
  "reason": "Demo credits",
  "adminNote": "For MD presentation",
  "adminId": "user_xxx",
  "adminEmail": "admin@company.com",
  "type": "admin_grant"  // or admin_deduction, admin_reset, profile_unlock
}
```

## Data Storage

### Supabase (company_profiles table)
- Company information
- Onboarding details
- Verification status
- Admin notes

### Clerk Metadata
- **publicMetadata**:
  - `credits`: Current credit balance
  - `unlockedProfiles`: Array of unlocked profile IDs
  - `companyName`: Company name
  - `onboardingCompleted`: Boolean flag
- **privateMetadata**:
  - `creditHistory`: Array of all credit transactions

## Security

- All endpoints require admin authentication via Clerk
- Role verification happens at both middleware and API level
- Soft delete preserves data while preventing access
- Full audit trail for all credit modifications

## Usage Workflow

### Adding Credits for Demo
1. Navigate to `/admin/companies`
2. Find the company (use search if needed)
3. Click "Edit" to open company details
4. In Credit Management panel:
   - Select "Add Credits"
   - Enter amount (e.g., 10)
   - Enter reason (e.g., "Demo credits for MD presentation")
   - Click "Add Credits"
5. Credits are immediately available for the company to use

### Managing Company Information
1. Navigate to company edit page
2. Update any company fields
3. Toggle verification status if needed
4. Add admin notes for internal tracking
5. Click "Save Changes"

### Monitoring Credit Usage
1. View credit balance on company list or edit page
2. Check "Unlocked Profiles" count to see usage
3. Review transaction history for detailed audit trail
4. Click on unlocked profiles to view candidate details

## Integration with Profile Unlocking

When a company unlocks a profile:
1. Credit is deducted via `/api/user/credits`
2. Transaction is logged with profile details
3. Profile ID is added to `unlockedProfiles` array
4. Full profile data becomes available to the company

The admin can see all unlocked profiles and when they were unlocked through the transaction history.

## Best Practices

1. **Always provide clear reasons** when adjusting credits
2. **Use admin notes** for additional context that might be needed later
3. **Review transaction history** before making adjustments
4. **Verify company details** before granting credits
5. **Monitor credit usage patterns** to identify potential issues
6. **Consider reset unlocks** instead of adding more credits if a company needs to re-access profiles
7. **Document why unlocks were reset** in the transaction history

## Troubleshooting

### Company not appearing in list
- Check if user role is set to 'company' in Clerk
- Verify company_profiles record exists
- Check filters aren't hiding the company

### Credits not updating
- Ensure Clerk API key is valid
- Check browser console for API errors
- Verify admin has proper permissions

### Transaction history missing
- History is stored in Clerk privateMetadata
- Check if creditHistory array exists
- Older accounts may not have history