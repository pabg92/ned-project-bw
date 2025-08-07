# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Board Champions (TNA - The Network Agency) is a Next.js-based executive talent marketplace connecting companies with board-level executives, fractional leaders, and strategic advisors. The platform focuses on PE-aligned appointments and strategic growth partnerships.

## Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom typography system
- **Components**: shadcn/ui (Radix UI primitives)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Clerk
- **Payments**: Stripe
- **Email**: Resend
- **Package Manager**: pnpm

## Essential Commands

```bash
# Development
pnpm dev              # Start development server (port 3000)
pnpm build            # Build for production
pnpm start            # Run production server
pnpm lint             # Run ESLint

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema changes to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:seed          # Seed database with test data

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report
```

**⚠️ Build Configuration**: ESLint and TypeScript errors are ignored during builds (`next.config.mjs`). Always manually verify type safety and linting before committing.

## Architecture & Key Patterns

### User Roles System
- **guest**: Unauthenticated users
- **candidate**: Job seekers/executives creating profiles
- **company**: Companies searching for talent (requires credits to unlock profiles)
- **admin**: Full system access for management

### Credit System
Companies purchase credits to unlock candidate profiles:
- Each profile unlock costs credits (configurable per profile)
- Unlocked profiles remain accessible permanently
- Credits tracked in user metadata via Clerk
- Admin can manually adjust credits

### Database Schema (`/lib/supabase/schema.ts`)
Key tables:
- `candidates`: Executive profiles with approval workflow
- `work_experiences`: Career history linked to candidates
- `education`: Academic credentials
- `company_profiles`: Tracks which profiles a company has unlocked
- `users`: User management with Clerk integration

### Component Organization

1. **Page Sections** (root level): Self-contained homepage sections
   - `hero-section.tsx`, `navbar.tsx`, `footer.tsx`, etc.
   - Each manages own state and data

2. **Feature Components** (`/components/`):
   - `/auth/`: Authentication flows and signup forms
   - `/search/`: Search interface, filters, and results
   - `/ui/`: Reusable shadcn/ui components
   - `/seo/`: SEO and meta tag components

3. **Admin Panel** (`/app/admin/`):
   - `/candidates`: Approve/reject profiles
   - `/companies`: Manage company credits
   - Dashboard with analytics

### API Routes Pattern
All API routes in `/app/api/` follow RESTful conventions:
- `/v1/`: Public API endpoints
- `/admin/`: Admin-only endpoints
- `/search/`: Search and filter endpoints
- Authentication via Clerk middleware
- Validation with Zod schemas (`/lib/validations/`)

### Styling System (`/lib/typography.ts`)
Centralized design tokens:
- **Typography**: h1, h2, h3, body (large/base/small), button, nav, label
- **Spacing**: section (base/compact/large), container, grid
- **Buttons**: primary (#7394c7), secondary (white), accent (gradient)
- **Border radius**: Standardized to `rounded-lg`
- **Colors**: Blues (#7394c7, #8595d5), Grays (#4a4a4a to #6a6a6a)

## Current Homepage Flow

1. **Hero Section** - Strategic appointments value proposition
2. **Trusted By** - Client logo carousel
3. **Elite Network** - Featured expert profiles
4. **Expertise** - Service category filters
5. **CTA Buttons** - Dual path (need expert/available to hire)
6. **Process** - 5-step appointment methodology
7. **Testimonials** - Client success stories
8. **Main CTA** - Email capture with consultation offer
9. **Foundation Partners** - Partnership credibility
10. **Awards** - Accreditations carousel

## Key User Flows

### Profile Creation
1. Candidate signs up via `/signup`
2. Creates profile with work experience, education
3. Profile enters pending state
4. Admin reviews at `/admin/candidates`
5. Approved profiles become searchable

### Company Search & Unlock
1. Company signs up and purchases credits
2. Searches profiles at `/search`
3. Clicks to unlock profile (deducts credits)
4. Profile permanently accessible via `/company_profiles`

### Admin Approval Workflow
1. View pending profiles at `/admin/candidates`
2. Review detailed profile information
3. Add admin notes and approve/reject
4. Optional: Enrich profile with additional data

## Environment Variables

Required in `.env.local`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET

# Stripe Payments
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY

# Email (Resend)
RESEND_API_KEY
```

## Development Guidelines

- All components use `"use client"` directive
- No global state management - components manage local state
- Mobile-first responsive design with breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Authentication required for `/search`, `/admin` routes
- Credit balance validated before profile unlocks
- Use existing patterns from similar components
- Follow kebab-case for file naming