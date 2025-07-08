# Board Champions - Unified Application

This is the merged Board Champions application that combines both frontend and backend into a single Next.js application.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values:
   - Supabase credentials
   - Clerk authentication keys
   - Stripe payment keys (optional)
   - Resend email API key (optional)

3. **Run database migrations:**
   ```bash
   pnpm db:push      # Push schema to Supabase
   pnpm db:migrate   # Run migrations
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## 🏗️ Architecture

This unified application combines:
- **Frontend**: Marketing pages, search interface, and user dashboard
- **Backend API**: All API routes under `/api/*` 
- **Admin Panel**: Available at `/admin` (requires admin role)

### Key Routes:
- `/` - Home page
- `/search` - Candidate search (requires authentication)
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/admin` - Admin dashboard (requires admin role)
- `/set-admin` - Grant yourself admin access

### API Routes:
- `/api/health` - Health check
- `/api/admin/*` - Admin API endpoints
- `/api/v1/*` - Public API endpoints
- `/api/webhooks/clerk` - Clerk webhook handler

## 🔐 Authentication

The application uses Clerk for authentication with SSO support.

### Setting up Admin Access:
1. Sign in with your account
2. Visit `/set-admin`
3. Click "Grant Admin Access"
4. You can now access `/admin`

For production, admin roles should be managed through Clerk dashboard.

## 📊 Database

The application uses Supabase (PostgreSQL) with Drizzle ORM.

### Database Commands:
```bash
pnpm db:generate  # Generate migrations
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
```

## 🛠️ Development

### Project Structure:
```
ned-frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (merged from backend)
│   ├── admin/             # Admin pages
│   ├── search/            # Search interface
│   └── ...                # Other pages
├── components/            # React components
├── lib/                   # Utility functions
│   ├── supabase/         # Database client
│   ├── auth/             # Authentication helpers
│   └── validations/      # Zod schemas
└── public/               # Static assets
```

### Key Technologies:
- **Framework**: Next.js 15.2.4
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS v3
- **Components**: shadcn/ui with Radix UI
- **Database**: Supabase with Drizzle ORM
- **Auth**: Clerk
- **Payments**: Stripe (optional)
- **Email**: Resend (optional)

## 🚀 Deployment

### Building for Production:
```bash
pnpm build
pnpm start
```

### Environment Variables for Production:
Ensure all variables in `.env.example` are set in your production environment.

### Deployment Options:
1. **Vercel** (Recommended)
   - Connect your GitHub repo
   - Add environment variables
   - Deploy

2. **Self-hosted**
   - Build the application
   - Run with a process manager (PM2, systemd)
   - Use a reverse proxy (Nginx, Caddy)

## 🧪 Testing

```bash
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Run tests with coverage
```

## 📝 Notes

- The frontend and backend have been merged into a single application
- All API routes are now local (no need for CORS or external API calls)
- The admin panel connects directly to the database through API routes
- Authentication is shared across the entire application

## 🆘 Troubleshooting

### "Admin API not found" error:
- Ensure Supabase credentials are correctly set in `.env.local`
- Check that you have admin role (visit `/set-admin`)
- Verify database migrations have been run

### Authentication issues:
- Verify Clerk keys are correct
- Ensure Clerk webhook secret is set for user sync
- Check that your Clerk instance URLs match your application

### Database connection issues:
- Verify Supabase URL and keys
- Check that your IP is whitelisted in Supabase
- Ensure database migrations have been run

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)