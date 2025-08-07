# Quick Reference: Company Credits & Management

## For MD Demo

### 1. Add Credits to Company
```bash
# Navigate to admin
/admin/companies

# Find company and click Edit
# In Credit Management section:
- Click "Add Credits"
- Enter amount: 10
- Enter reason: "Demo credits for MD presentation"
- Click "Add Credits"
```

### 2. Company Unlocks Profile
```bash
# As company user
/search
# Click on any profile
# Click "Unlock Full Profile" 
# Confirm (1 credit deducted)
# Full profile now visible
```

## Admin Quick Actions

### View All Companies
- URL: `/admin/companies`
- Shows: Credits, unlocked profiles, verification status
- Filter by: Credits, verification, search

### Edit Company & Credits
- URL: `/admin/companies/[id]/edit`
- Actions:
  - Add/remove credits
  - View transaction history
  - Edit company info
  - Reset credits to 0

### Common Credit Operations

#### Grant Demo Credits
```json
POST /api/admin/companies/[id]/credits
{
  "amount": 10,
  "reason": "Demo presentation",
  "adminNote": "Approved by CEO"
}
```

#### Remove Credits
```json
POST /api/admin/companies/[id]/credits
{
  "amount": -5,
  "reason": "Refund unused credits",
  "adminNote": "Customer request"
}
```

#### Reset to Zero
```
DELETE /api/admin/companies/[id]/credits
```

## Credit Transaction Types
- `admin_grant` - Admin adds credits
- `admin_deduction` - Admin removes credits  
- `admin_reset` - Reset to 0
- `profile_unlock` - Company unlocked profile

## Key URLs
- Company List: `/admin/companies`
- Edit Company: `/admin/companies/[id]/edit`
- Company Credits API: `/api/admin/companies/[id]/credits`
- User Credits API: `/api/user/credits`

## Troubleshooting

### Credits not showing?
1. Check user role is 'company' in Clerk
2. Verify publicMetadata.credits exists
3. Check console for errors

### Can't unlock profile?
1. Verify credits > 0
2. Check if already unlocked
3. Ensure logged in as company user

### Transaction missing?
1. Check privateMetadata.creditHistory
2. Verify transaction was recorded
3. Review API response