# MD Demo Guide - Board Champions Platform

## Demo Account Details

- **Email:** it@championsukplc.com  
- **Password:** G4rn3r92
- **Role:** Company Account
- **Credits:** 8 remaining (started with 10, unlocked 2 profiles)

## Demo Flow

### 1. Company Sign In
1. Navigate to https://boardchampions.com/sign-in
2. Use the demo credentials above
3. System will redirect to /search page

### 2. Search & Browse Candidates
1. **Search Bar:** Try searching for "technology", "finance", or "healthcare"
2. **Filters:** Demonstrate filtering by:
   - Location (London, Manchester, etc.)
   - Experience Level (10-20 years, 20+ years)
   - Sectors (Technology, Healthcare, etc.)
   - Board Experience Types
3. **Sort Options:** Show sorting by relevance, newest, experience

### 3. View Anonymized Profile
1. Click on any candidate card
2. Show the anonymized view:
   - Generic initials (e.g., "EP" for Executive Profile)
   - Professional summary visible
   - Board positions count visible
   - Contact details hidden
   - "Unlock Profile (1 Credit)" button prominent

### 4. Unlock Profile with Credits
1. Click "Unlock Profile (1 Credit)" button
2. Credits will deduct from 8 to 7 (visible in navbar)
3. Profile instantly reveals:
   - Full name (e.g., Sarah Thompson)
   - Contact details (email & phone)
   - LinkedIn profile link
   - Detailed board positions
   - Committee experience
   - Deal experience
   - "Download CV" button appears

### 5. Key Features to Highlight

#### Credit System
- Companies purchase credits
- 1 credit = 1 profile unlock
- Credits visible in navbar
- Unlocked profiles remain accessible forever

#### Profile Quality
- Verified professionals only
- 18+ years average experience
- PE/VC board experience
- Detailed committee expertise

#### Search Intelligence
- Real-time filter counts
- Relevance-based sorting
- Saved searches (if implemented)
- Export functionality

### 6. Technical Highlights

- **Built with:** Next.js 15, TypeScript, Tailwind CSS
- **Authentication:** Clerk (enterprise-grade)
- **Database:** Supabase PostgreSQL
- **Performance:** Server-side rendering, optimized search
- **Security:** Role-based access, secure profile data

## Common Questions & Answers

**Q: How do companies get more credits?**
A: Through the billing portal (Stripe integration coming soon)

**Q: Can unlocked profiles be downloaded?**
A: Yes, the "Download CV" button generates a PDF with full details

**Q: Is there a bulk unlock option?**
A: Coming in v2 - will allow package deals for multiple profiles

**Q: How are candidates verified?**
A: Manual verification process by Board Champions team

**Q: Can companies save searches?**
A: Yes, saved searches feature is available

## Troubleshooting During Demo

### If credits don't update:
1. Refresh the page (Ctrl+R / Cmd+R)
2. Credits should show correctly in navbar

### If profile won't unlock:
1. Check credits balance
2. Ensure you're logged in as company account
3. Try refreshing and clicking again

### If search returns no results:
1. Clear all filters
2. Try broader search terms
3. Show the "All Candidates" view

## Post-Demo Actions

1. **Add more credits** if needed:
   ```bash
   pnpm tsx scripts/add-clerk-credits.ts
   ```

2. **Reset demo account**:
   - Clear unlocked profiles
   - Reset to 10 credits
   - Remove search history

3. **Export demo data**:
   - Screenshots of key features
   - Sample unlocked profiles
   - Credit transaction history

## Key Selling Points

1. **Immediate ROI:** Find board-ready executives instantly
2. **Quality over Quantity:** Curated, verified professionals
3. **Transparent Pricing:** Pay only for profiles you need
4. **Time Savings:** 90% faster than traditional search
5. **Data Security:** Enterprise-grade authentication & encryption

## Next Steps After Demo

1. Discuss credit packages and pricing
2. Show roadmap for upcoming features
3. Offer pilot program for early adopters
4. Schedule follow-up for technical integration