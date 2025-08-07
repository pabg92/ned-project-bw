import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

// Query parameters schema
const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().optional(),
  industry: z.string().optional(),
  verificationStatus: z.enum(['all', 'verified', 'unverified']).optional().default('all'),
  creditRange: z.enum(['all', '0', '1-10', '11-50', '51-100', '100+']).optional().default('all'),
  sortBy: z.enum(['created_at', 'company_name', 'credits', 'unlocked_profiles']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

interface CompanyWithCredits {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  position: string | null;
  hiring_needs: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  credits: number;
  unlockedProfiles: string[];
  creditHistory: any[];
}

/**
 * GET /api/admin/companies
 * List all companies with their credit information
 */
export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // Verify admin authentication
    const { userId: adminId } = await auth();
    
    if (!adminId) {
      return createErrorResponse('Authentication required', 401);
    }

    // Verify admin role
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const validatedParams = querySchema.parse(Object.fromEntries(searchParams));

    const {
      page,
      limit,
      search,
      industry,
      verificationStatus,
      creditRange,
      sortBy,
      sortOrder,
    } = validatedParams;

    // Build query
    let query = supabaseAdmin
      .from('company_profiles')
      .select(`
        *,
        user:users!company_profiles_user_id_fkey(
          id,
          email,
          role
        )
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,user.email.ilike.%${search}%`);
    }

    if (industry) {
      query = query.eq('industry', industry);
    }

    if (verificationStatus !== 'all') {
      query = query.eq('is_verified', verificationStatus === 'verified');
    }

    // Apply sorting
    if (sortBy === 'company_name') {
      query = query.order('company_name', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: companies, error, count } = await query;

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    // Initialize Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    // Fetch Clerk metadata for each company user
    const companiesWithCredits: CompanyWithCredits[] = await Promise.all(
      (companies || []).map(async (company) => {
        try {
          const clerkUser = await clerkClient.users.getUser(company.user_id);
          const credits = (clerkUser.publicMetadata?.credits as number) || 0;
          const unlockedProfiles = (clerkUser.publicMetadata?.unlockedProfiles as string[]) || [];
          const creditHistory = (clerkUser.privateMetadata?.creditHistory as any[]) || [];

          // Apply credit range filter
          if (creditRange !== 'all') {
            if (creditRange === '0' && credits !== 0) return null;
            if (creditRange === '1-10' && (credits < 1 || credits > 10)) return null;
            if (creditRange === '11-50' && (credits < 11 || credits > 50)) return null;
            if (creditRange === '51-100' && (credits < 51 || credits > 100)) return null;
            if (creditRange === '100+' && credits < 100) return null;
          }

          return {
            ...company,
            credits,
            unlockedProfiles,
            creditHistory
          };
        } catch (error) {
          console.error(`Error fetching Clerk data for user ${company.user_id}:`, error);
          return {
            ...company,
            credits: 0,
            unlockedProfiles: [],
            creditHistory: []
          };
        }
      })
    );

    // Filter out nulls from credit range filtering
    const filteredCompanies = companiesWithCredits.filter(c => c !== null);

    // Sort by credits or unlocked profiles if needed
    if (sortBy === 'credits') {
      filteredCompanies.sort((a, b) => {
        return sortOrder === 'asc' ? a.credits - b.credits : b.credits - a.credits;
      });
    } else if (sortBy === 'unlocked_profiles') {
      filteredCompanies.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.unlockedProfiles.length - b.unlockedProfiles.length 
          : b.unlockedProfiles.length - a.unlockedProfiles.length;
      });
    }

    // Calculate summary statistics
    const totalCredits = filteredCompanies.reduce((sum, c) => sum + c.credits, 0);
    const totalUnlockedProfiles = filteredCompanies.reduce((sum, c) => sum + c.unlockedProfiles.length, 0);
    const verifiedCount = filteredCompanies.filter(c => c.is_verified).length;

    return createSuccessResponse({
      companies: filteredCompanies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
        hasNextPage: count ? offset + limit < count : false,
        hasPreviousPage: page > 1,
      },
      summary: {
        totalCompanies: count || 0,
        displayedCompanies: filteredCompanies.length,
        totalCredits,
        totalUnlockedProfiles,
        verifiedCount,
      }
    });

  } catch (error: any) {
    console.error('Companies list error:', error);
    return createErrorResponse('Failed to retrieve companies', 500);
  }
}