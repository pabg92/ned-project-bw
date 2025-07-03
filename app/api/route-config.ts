/**
 * API Route Configuration
 * This file helps prevent build errors when environment variables are not available
 */

// Export route configuration to prevent static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';