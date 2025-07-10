# Admin Guide: Profile Approval Process

## Overview

When candidates sign up through `/sign-up`, their profiles require admin approval before becoming active. The approval process triggers automatic data enrichment that organizes PE-specific information into the proper database structure.

## Approval Workflow

### 1. Review Pending Candidates

Navigate to: `http://localhost:3000/admin/candidates`

You'll see a list of candidates with their status:
- 🟡 **Pending** - Awaiting approval
- ✅ **Active** - Approved and processed
- ❌ **Inactive** - Rejected or disabled

### 2. Review Candidate Information

Each candidate card shows:
- Name and title
- Location and experience level
- Summary (truncated)
- Signup date

### 3. Approve a Candidate

Click the **"Approve"** button to:
1. Activate the profile (`is_active: true`)
2. Mark as complete (`profile_completed: true`)
3. Trigger automatic data processing

### 4. What Happens During Approval

The system automatically:
- Extracts PE data from signup metadata
- Creates deal experience records
- Stores board committee memberships
- Records board experience types
- Validates and formats all dates
- Updates processing status

## Understanding the Data Processing

### Data Types Processed

1. **Deal Experiences**
   - M&A transactions
   - IPOs and exits
   - Restructurings
   - Investment rounds

2. **Board Committees**
   - Audit
   - Remuneration
   - Risk
   - ESG
   - Technology
   - Investment

3. **Board Experience Types**
   - FTSE 100/250
   - Private Equity
   - Startup/Scale-up
   - Non-profit

4. **Work Experiences**
   - Current and past positions
   - Board vs non-board roles
   - Company types

### Processing Status

After approval, check the processing status in the candidate's private metadata:

```json
{
  "processingStatus": {
    "status": "completed",
    "lastProcessedAt": "2024-01-10T10:30:00Z",
    "completedSteps": [
      "tags",
      "workExperiences",
      "education", 
      "dealExperiences",
      "boardCommittees",
      "boardExperienceTypes"
    ]
  }
}
```

## Monitoring & Troubleshooting

### Server Logs

Watch for these log messages during approval:

```
[PROCESSOR] Found private_metadata, extracting signup data
[PROCESSOR] Processing 5 deal experiences
[PROCESSOR] Processing 4 board committees
[PROCESSOR] Processing 3 board experience types
[PROCESSOR] Successfully inserted 5 deal experiences
```

### Common Scenarios

#### ✅ Successful Processing
- All log messages appear
- No error messages
- Profile shows as active
- Data visible in database tables

#### ⚠️ Partial Processing
- Some data processed, others failed
- Check `processingStatus.errors` array
- May need to manually reprocess

#### ❌ Failed Processing
- Error messages in logs
- Profile activated but data missing
- Check database constraints or data format

### Manual Verification

To verify a profile was processed correctly:

```bash
# Replace with actual profile ID
npx tsx scripts/check-james-status.ts
```

This shows:
- Profile status (active/inactive)
- Data counts in private_metadata
- Data counts in database tables
- Processing status

## Profile Display After Approval

### Default State (Anonymized)

Approved profiles are **anonymized by default**:
- Shows "Executive Profile" instead of name
- Hides detailed work history
- Hides PE transactions
- Hides contact information

### Full Profile Access

Full details are visible when:
1. **Credits Used** - User unlocks with platform credits
2. **Own Profile** - Candidate viewing their own profile
3. **Admin Access** - Admins always see full details

### Why Anonymization?

This supports the business model:
- Companies pay credits to unlock profiles
- Protects candidate privacy
- Creates revenue stream
- Maintains professional discretion

## Best Practices

### Before Approving

1. **Review the summary** - Ensure it's professional and complete
2. **Check for spam** - Verify legitimate candidate
3. **Verify experience level** - Matches their claims

### During Approval

1. **Monitor logs** - Watch for processing errors
2. **One at a time** - Don't bulk approve initially
3. **Verify completion** - Check profile displays correctly

### After Approval

1. **Spot check profiles** - View some on the search page
2. **Monitor errors** - Check for processing failures
3. **Gather feedback** - Ensure data displays properly

## Advanced Operations

### Reprocess a Profile

If processing failed or data changed:

```bash
npx tsx scripts/reprocess-profiles.ts
```

### Bulk Operations

For multiple profiles:
1. Use the reprocess script
2. Monitor logs carefully
3. Verify each profile

### Debug Specific Profile

To investigate issues:

```bash
npx tsx scripts/debug-james-profile.ts
```

## FAQ

**Q: Why does it show "Executive Profile"?**  
A: Profiles are anonymized by default. This is correct behavior.

**Q: Where does the data come from?**  
A: From the signup form, stored in private_metadata, then processed on approval.

**Q: Can I re-run the processing?**  
A: Yes, the processing is idempotent (safe to run multiple times).

**Q: What if processing fails?**  
A: The profile still activates, but check logs for errors and reprocess if needed.

**Q: How do I know it worked?**  
A: Check the database tables for the candidate's deal experiences, committees, etc.