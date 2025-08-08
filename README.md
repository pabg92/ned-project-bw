# Board Champions - Executive Talent Marketplace

A premium Next.js-based executive talent marketplace connecting companies with board-level executives, fractional leaders, and strategic advisors. The platform specializes in PE-aligned appointments and strategic growth partnerships.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

## 🚀 Features

### For Companies
- **Advanced Search & Filtering**: Find executives by role type, sector, organization type, and specialisms
- **Credit-Based Profile Access**: Purchase credits to unlock and permanently access candidate profiles
- **Smart Matching**: AI-powered recommendations based on your specific requirements
- **Comprehensive Profiles**: View detailed work history, education, board experience, and expertise

### For Executives
- **Professional Profile Creation**: Showcase your experience, expertise, and availability
- **Verification System**: Admin-approved profiles ensure quality and authenticity
- **Confidential Introductions**: Control your visibility and engagement preferences
- **Zero Fees**: No charges for executives joining the platform

### Platform Features
- **Responsive Design**: Mobile-first approach with seamless experience across all devices
- **Real-Time Search**: Dynamic filtering with instant results and count updates
- **Secure Authentication**: Enterprise-grade security with Clerk authentication
- **Payment Processing**: Integrated Stripe for secure credit purchases
- **Admin Dashboard**: Comprehensive tools for profile approval and platform management

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React hooks with URL state synchronization

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL) with row-level security
- **ORM**: Drizzle ORM for type-safe database queries
- **Authentication**: Clerk for user management and auth
- **Payments**: Stripe integration for credit purchases
- **Email**: Resend for transactional emails
- **File Storage**: Supabase Storage for documents and images

### Development Tools
- **Package Manager**: pnpm for efficient dependency management
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: Jest and React Testing Library
- **CI/CD**: GitHub Actions for automated testing and deployment

## 📁 Project Structure

```
ned-frontend/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── search/            # Search interface
│   ├── signup/            # Registration flow
│   └── page.tsx           # Homepage
├── components/            
│   ├── sections/          # Page sections (Hero, Features, etc.)
│   │   ├── filters/       # Search filter components
│   │   └── Hero.tsx       # Hero section with filter bar
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   └── seo/               # SEO and meta components
├── lib/                   
│   ├── supabase/          # Database schema and client
│   ├── search/            # Search logic and filters
│   ├── validations/       # Zod validation schemas
│   └── typography.ts      # Design system tokens
├── styles/
│   ├── tokens.css         # CSS custom properties
│   └── globals.css        # Global styles
└── public/                # Static assets
```

## 🎨 Design System

### Typography Scale
- **Display**: BebasNeue for headlines
- **Body**: AktivGrotesk for content
- **Sizes**: Fluid typography with responsive scaling

### Color Tokens
```css
--ink: #0F172A              /* Primary text */
--muted: #475569            /* Secondary text */
--border: #E5E7EB           /* Borders */
--accent: #8595d5           /* Primary accent */
--accent-strong: #6b93ce    /* Interactive elements */
--accent-soft: rgba(133,149,213,.15)  /* Hover states */
```

### Component Architecture
- **Atomic Design**: Small, reusable components composed into larger sections
- **Token-Based Styling**: Consistent spacing, colors, and typography via CSS variables
- **Responsive Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- PostgreSQL (via Supabase)

### Environment Variables
Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Stripe Payments
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/board-champions.git
cd board-champions

# Install dependencies
pnpm install

# Set up the database
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start development server (port 3000)
pnpm build            # Build for production
pnpm start            # Run production server
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript compiler check

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

## 🔐 Security Features

- **Row-Level Security (RLS)**: Database-level access control
- **Input Validation**: Zod schemas for all user inputs
- **CSRF Protection**: Built into Next.js
- **Content Security Policy**: Restrictive CSP headers
- **Rate Limiting**: API endpoint protection
- **Secure Headers**: HSTS, X-Frame-Options, etc.

## 🌟 Key User Flows

### Executive Registration
1. Sign up via `/signup` with professional details
2. Complete profile with work history and expertise
3. Submit for admin approval
4. Once approved, profile becomes searchable

### Company Search & Unlock
1. Register as a company user
2. Purchase credits through Stripe
3. Search executives using advanced filters
4. Click to unlock profiles (deducts credits)
5. Access unlocked profiles permanently

### Admin Workflow
1. Review pending profiles at `/admin/candidates`
2. Verify credentials and experience
3. Add internal notes
4. Approve or reject with feedback
5. Monitor platform metrics on dashboard

## 🏗 Recent Updates

### Hero Filter System Improvements
- **Unified Design System**: Consistent control heights (h-12) and spacing across all filters
- **Premium Styling**: Custom design tokens for on-brand appearance
- **Bug Fixes**: Removed WebKit blue focus rings on search inputs
- **Performance**: Optimized re-renders with proper React memoization
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### Mobile Responsiveness
- Hidden decorative elements on mobile for better performance
- Horizontally scrollable client logos
- Stack filters vertically on small screens
- Touch-optimized tap targets (≥44px)

## 📊 Database Schema

### Key Tables
- `candidates`: Executive profiles with approval workflow
- `work_experiences`: Career history linked to candidates
- `education`: Academic credentials
- `company_profiles`: Tracks unlocked profiles per company
- `users`: User management with Clerk integration
- `credits`: Credit balance and transaction history

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is proprietary software. All rights reserved.

## 🔗 Links

- [Production Site](https://boardchampions.com)
- [Documentation](docs/README.md)
- [API Reference](docs/API.md)
- [Design System](docs/DESIGN.md)

## 💬 Support

For support, email support@boardchampions.com or open an issue in this repository.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com/)
- Authentication by [Clerk](https://clerk.com/)
- Payments by [Stripe](https://stripe.com/)

---

**Board Champions** - Connecting exceptional leaders with transformative opportunities.