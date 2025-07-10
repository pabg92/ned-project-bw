# BoardChampions Demo Setup Guide

## Overview
This guide walks through setting up a complete demo environment for showcasing BoardChampions to the MD, including company account creation, credit assignment, and profile unlocking.

## Pre-Demo Setup (Day Before)

### 1. Create Demo Profiles
```bash
npx tsx scripts/create-demo-profiles.ts
```
This creates 3 high-quality executive profiles:
- Catherine Blackwell - PE-focused Chair
- Marcus Chen - FinTech NED  
- Sarah Williams-Green - ESG Specialist

### 2. Approve Profiles
1. Go to http://localhost:3000/admin/candidates
2. Approve all 3 demo profiles
3. Verify they appear in search

### 3. Create Company Account
1. Navigate to http://localhost:3000/companies
2. Click "Get Started"
3. Sign up with a demo company email (e.g., `demo@acmecorp.com`)
4. You'll be redirected to /search after signup

### 4. Add Credits to Company
1. Update the email in `scripts/add-credits-to-company.ts`
2. Run:
```bash
npx tsx scripts/add-credits-to-company.ts
```
3. This adds 20 credits to the account

## Demo Flow

### Part 1: Company Perspective (5 mins)

1. **Landing Page** (http://localhost:3000/companies)
   - Show value proposition
   - Explain credit-based model
   - Show pricing tiers

2. **Search Page** (http://localhost:3000/search)
   - Log in as company account
   - Show anonymized profiles
   - Demonstrate filters:
     - Board experience types
     - Industries
     - Availability
   - Point out "Executive Profile" anonymization

3. **Profile Unlocking**
   - Click on Catherine Blackwell's profile
   - Show anonymized view first
   - Click "Unlock Profile (1 Credit)"
   - Show full details revealed:
     - Full name and photo
     - Contact information
     - Complete work history
     - PE deal experiences
     - Board committees
     - LinkedIn link

### Part 2: Credit System (2 mins)

1. Show credit balance (should be 19 after unlock)
2. Explain no expiry on credits
3. Show pricing packages
4. Mention bulk discounts

### Part 3: Profile Quality (3 mins)

1. Unlock Marcus Chen's profile
2. Highlight:
   - Verified executive status
   - Detailed PE/M&A experience
   - Board committee expertise
   - Availability timeline
   - Compensation expectations

### Part 4: Search Features (2 mins)

1. Use filters to find specific expertise
2. Show sorting options
3. Demonstrate saved searches (if available)
4. Show how unlocked profiles are marked

## Key Talking Points

### For Companies
- **Time Saving**: "Find board members in minutes, not months"
- **Quality**: "Every profile is verified and actively seeking"
- **Cost Effective**: "Pay only for profiles you're interested in"
- **No Commitment**: "No subscriptions or contracts"

### Profile Richness
- **PE Experience**: Deal history with values and outcomes
- **Board Expertise**: Committee memberships and achievements
- **Availability**: Clear timeline expectations
- **Verification**: All profiles are reviewed by our team

### Competitive Advantages
1. **Specialized**: Focus only on board-level positions
2. **Transparent**: See profiles before paying
3. **Flexible**: Credits never expire
4. **Quality**: Curated, not crowd-sourced

## Troubleshooting

### Profile Not Showing
- Ensure profile is approved in admin panel
- Check `is_active` and `profile_completed` are true
- Verify profile has PE data in database

### Credits Not Working
- Check user_credits table has record
- Verify user role is 'company'
- Check browser console for errors

### Can't See Full Details After Unlock
- Ensure `is_anonymized` is true (for proper demo)
- Check unlocked_profiles table has entry
- Try refreshing the page

## Post-Demo

### Reset for Next Demo
1. Add more credits if needed
2. Can create additional profiles
3. Clear unlocked_profiles if wanting fresh demo

### Follow-up Actions
- Export list of unlocked profiles
- Show credit purchase flow
- Demonstrate admin analytics (if available)

## Quick Commands Reference

```bash
# Create profiles
npx tsx scripts/create-demo-profiles.ts

# Add credits (update email first)
npx tsx scripts/add-credits-to-company.ts

# Check profile status
npx tsx scripts/check-james-status.ts

# Debug profile display
npx tsx scripts/debug-james-profile.ts
```

## Demo Environment URLs

- Company Landing: http://localhost:3000/companies
- Search Page: http://localhost:3000/search
- Admin Panel: http://localhost:3000/admin/candidates
- Individual Profile: http://localhost:3000/search/[profile-id]

---

Remember: The goal is to show how quickly and easily companies can find qualified board members!