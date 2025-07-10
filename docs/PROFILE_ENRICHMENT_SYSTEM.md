# Profile Enrichment & Approval System Documentation

## Overview

The BoardChampions platform features an automated profile enrichment system that processes candidate data upon admin approval. This system ensures that PE-relevant data (deal experiences, board committees, etc.) is properly stored and displayed while maintaining profile anonymization for the credit-based unlock system.

## System Architecture

### Data Flow

```
1. Candidate Signup (/sign-up)
   ↓
2. Data stored in private_metadata
   ↓
3. Admin reviews candidate
   ↓
4. Admin approves profile
   ↓
5. processProfileOnApproval() runs
   ↓
6. Data moved to database tables
   ↓
7. Profile displays (anonymized by default)
   ↓
8. Users unlock with credits to see full details
```

### Key Components

1. **Signup API** (`/app/api/v1/candidates/signup/route.ts`)
   - Stores all candidate data in `private_metadata`
   - Directly inserts work experiences, education, and tags
   - Preserves PE-specific data for later processing

2. **Approval API** (`/app/api/admin/candidates/[id]/approval/route.ts`)
   - Handles admin approval actions
   - Triggers `processProfileOnApproval()` function
   - Updates profile status flags

3. **Profile Processor** (`/lib/services/admin-profile-processor.ts`)
   - Extracts data from `private_metadata`
   - Processes and inserts PE-specific data into tables
   - Handles data transformation and validation

4. **Profile Display** (`/app/api/search/profiles/[id]/route.ts`)
   - Checks profile anonymization status
   - Verifies credit-based unlocks
   - Returns appropriate data based on access level

## Database Schema

### Core Tables

- `candidate_profiles` - Main profile data
- `users` - User authentication and basic info
- `work_experiences` - Employment history and board positions
- `education` - Educational credentials
- `tags` / `candidate_tags` - Skills and expertise

### PE-Specific Tables

- `deal_experiences` - Transaction history (M&A, IPOs, etc.)
- `board_committees` - Committee memberships
- `board_experience_types` - Types of boards served on

## Data Storage Strategy

### During Signup

Data is stored in `private_metadata` as JSON:

```json
{
  "phone": "+44 7700 900123",
  "boardExperience": true,
  "boardPositions": 5,
  "boardExperienceTypes": ["ftse100", "private-equity"],
  "boardCommittees": ["audit", "remuneration"],
  "dealExperiences": [...],
  "workExperiences": [...],
  // ... other fields
}
```

### After Approval

The processor moves data from `private_metadata` to proper database tables:

1. Deal experiences → `deal_experiences` table
2. Board committees → `board_committees` table
3. Board experience types → `board_experience_types` table
4. Work experiences → `work_experiences` table (if not already inserted)

## Profile Anonymization & Credits

### Default Behavior

- All profiles have `is_anonymized: true` by default
- Anonymized profiles show:
  - "Executive Profile" instead of real name
  - Basic summary and location
  - No contact details or detailed experiences

### Full Profile Access

Full details are shown when:
1. User has unlocked the profile with credits
2. User is viewing their own profile
3. User has admin privileges

### What's Hidden/Shown

| Data | Anonymized | Unlocked |
|------|------------|----------|
| Name | "Executive Profile" | Full Name |
| Summary | ✓ | ✓ |
| Location | ✓ | ✓ |
| Work History | ✗ | ✓ |
| Deal Experiences | ✗ | ✓ |
| Board Committees | ✗ | ✓ |
| Contact Info | ✗ | ✓ |
| LinkedIn | ✗ | ✓ |

## Processing Logic

### The processProfileOnApproval Function

```typescript
// 1. Extract metadata from private_metadata (primary source)
if (profile.private_metadata) {
  metadata = {
    dealExperiences: profile.private_metadata.dealExperiences,
    boardCommittees: profile.private_metadata.boardCommittees,
    // ... other fields
  };
}

// 2. Process each data type
await processDealExperiences(profileId, metadata.dealExperiences);
await processBoardCommittees(profileId, metadata.boardCommittees);
await processBoardExperienceTypes(profileId, metadata.boardExperienceTypes);

// 3. Update processing status
await updateProcessingStatus(profileId, 'completed', errors);
```

### Error Handling

- Each processing step is wrapped in try-catch
- Errors are collected but don't stop the process
- Processing status is tracked in `private_metadata`

## Common Issues & Solutions

### Issue: "Failed to parse admin_notes"
**Cause**: After processing, admin_notes contains plain text instead of JSON  
**Impact**: None - this is expected behavior  
**Solution**: The display route handles this gracefully

### Issue: Profile shows as "Executive Profile"
**Cause**: Profile is anonymized (is_anonymized: true)  
**Impact**: Working as designed for credit system  
**Solution**: Unlock with credits or view as profile owner

### Issue: Data not appearing after approval
**Cause**: Processing may have failed  
**Solution**: Check `private_metadata.processingStatus` for errors

## Testing Workflow

### 1. Create Test Profile
```bash
npx tsx scripts/create-test-profile-james.ts
```

### 2. Approve Profile
- Go to `/admin/candidates`
- Find the candidate
- Click "Approve"

### 3. Verify Processing
```bash
npx tsx scripts/check-james-status.ts
```

### 4. View Profile
- As anonymous user: See anonymized version
- Click "Unlock Profile": See full details
- As profile owner: Always see full details

## Monitoring & Debugging

### Server Logs to Watch
```
[PROCESSOR] Found private_metadata, extracting signup data
[PROCESSOR] Processing X deal experiences
[PROCESSOR] Processing X board committees
[PROCESSOR] Successfully inserted X work experiences
```

### Database Verification
```sql
-- Check if data was processed
SELECT 
  cp.id,
  cp.is_active,
  cp.is_anonymized,
  COUNT(DISTINCT de.id) as deal_count,
  COUNT(DISTINCT bc.id) as committee_count
FROM candidate_profiles cp
LEFT JOIN deal_experiences de ON de.candidate_id = cp.id
LEFT JOIN board_committees bc ON bc.candidate_id = cp.id
WHERE cp.id = 'profile-id-here'
GROUP BY cp.id;
```

## Best Practices

1. **Always preserve original data** - Keep copies in private_metadata
2. **Handle dates carefully** - Ensure proper formatting (YYYY-MM-DD)
3. **Log processing steps** - Use console.log with [PROCESSOR] prefix
4. **Test with real data** - Include all PE-specific fields
5. **Respect anonymization** - Don't bypass credit system in production

## Future Enhancements

1. **Batch processing** - Process multiple profiles at once
2. **Webhook notifications** - Notify candidates of approval
3. **Data validation** - Stricter validation before processing
4. **Audit trail** - Complete history of all processing attempts
5. **Admin dashboard** - Visual processing status and errors