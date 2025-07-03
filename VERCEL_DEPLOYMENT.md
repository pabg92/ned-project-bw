# Vercel Deployment Guide

## Quick Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select your GitHub account
   - Find and import `pabg92/ned-frontend`
   - Select the `main-unified-final` branch

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Leave empty (we're in the root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**
   Add these required variables:
   ```
   # Database (Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Payments (Stripe)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key

   # Optional Development
   DEV_MODE=false
   TEST_MODE=false
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

## Post-Deployment Setup

1. **Configure Custom Domain** (if needed)
   - Go to Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Set up Webhooks**
   - **Clerk Webhook**: `https://your-domain.vercel.app/api/webhooks/clerk`
   - **Stripe Webhook**: `https://your-domain.vercel.app/api/webhooks/stripe`

3. **Update Environment URLs**
   - Update `NEXT_PUBLIC_APP_URL` to your production URL
   - Redeploy to apply changes

## Important Routes

- **Public Site**: `/`
- **Search Portal**: `/search`
- **Signup**: `/signup`
- **Admin Portal**: `/admin`
- **API Health Check**: `/api/health`

## Troubleshooting

- If build fails, check the build logs in Vercel dashboard
- Ensure all environment variables are set correctly
- For database issues, verify Supabase connection and service role key
- For auth issues, check Clerk configuration and keys

## Making This the Main Branch

To make this the default branch on GitHub:
1. Go to Settings → Branches in your GitHub repo
2. Change default branch from current to `main-unified-final`
3. Update Vercel to track the new default branch