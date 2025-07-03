import { UserRole, AdminPermission } from '@/lib/types/auth';

export const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || '';
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';

export const DEFAULT_ROLE: UserRole = 'candidate';

export const ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  candidate: [],
  company: [],
  admin: [
    'manage_candidates',
    'manage_companies',
    'manage_payments',
    'view_analytics',
    'manage_system',
    'export_data'
  ]
};

export const PROTECTED_ROUTES = {
  candidate: ['/profile', '/settings'],
  company: ['/dashboard', '/search', '/candidates', '/billing'],
  admin: ['/admin', '/admin/candidates', '/admin/companies', '/admin/analytics']
};

export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/sign-in',
  '/sign-up',
  '/api/webhooks/clerk',
  '/api/health'
];

export const ROLE_REDIRECTS = {
  candidate: '/profile',
  company: '/dashboard',
  admin: '/admin'
};