# BoardChampions - Unified Next.js Application

This is the merged BoardChampions application that combines the frontend and backend into a single Next.js project.

## Project Structure

```
/app
├── page.tsx              # Public landing page
├── search/               # Public search functionality
├── signup/               # User registration
├── admin/                # Admin portal (from backend)
│   ├── page.tsx         # Admin dashboard
│   ├── candidates/      # Candidate management
│   └── api-test/        # API testing interface
└── api/                  # All API routes
    ├── admin/           # Admin API endpoints
    ├── v1/              # Public API v1
    ├── webhooks/        # Clerk & Stripe webhooks
    └── health/          # Health check endpoint
```

## Features

### Public Features (Frontend)
- Landing page with marketing content
- Expert search functionality
- User registration flow
- Shortlist management

### Admin Features (Backend)
- Admin dashboard with analytics
- Candidate management system
- Document upload and management
- Profile quality assessment
- API testing interface (67+ endpoints)
- User role management
- Enrichment record management
- Approval workflows

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in all required values in `.env.local`

3. **Set up the database:**
   ```bash
   npm run db:push
   npm run db:migrate
   npm run db:seed  # Optional: seed with test data
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

## Key Routes

- `/` - Public landing page
- `/search` - Search for experts
- `/signup` - User registration
- `/admin` - Admin dashboard (requires admin role)
- `/api/health` - API health check

## Authentication

The application uses Clerk for authentication with role-based access:
- Public users can access search and signup
- Admin users can access the admin portal
- API routes are protected based on user roles

## Database

- Uses Supabase with Drizzle ORM
- Run `npm run db:studio` to open Drizzle Studio

## Testing

```bash
npm run test           # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio

## Migration Notes

This project was created by merging:
- `ned-frontend` - Public-facing Next.js app
- `ned-backend` - Admin portal and API

All routes have been consolidated into a single Next.js application with:
- No route conflicts
- Unified authentication
- Shared components and utilities
- Single deployment target