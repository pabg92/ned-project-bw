import { NextRequest } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { supabaseAdmin } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/auth/admin-check';

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard API: Request received');
    
    // Check authentication (skip in dev mode)
    const isDevMode = process.env.DEV_MODE === 'true';
    const isTestMode = process.env.TEST_MODE === 'true';
    
    if (!isDevMode && !isTestMode) {
      try {
        await requireAdmin();
      } catch (authError) {
        console.log('Admin auth failed, checking if dev mode is enabled via client');
        // Allow access if we're in a development environment
        if (process.env.NODE_ENV === 'development') {
          console.log('Development environment detected, allowing access');
        } else {
          throw authError;
        }
      }
    }
    
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30';
    const periodDays = parseInt(period, 10);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    // Fetch real data from Supabase
    // Get total candidates
    const { count: totalCandidates } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active candidates
    const { count: activeCandidates } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get verified candidates
    const { count: verifiedCandidates } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('private_metadata->>verificationStatus', 'verified');

    // Get total companies
    const { count: totalCompanies } = await supabaseAdmin
      .from('company_profiles')
      .select('*', { count: 'exact', head: true });

    // Get recent registrations (within period)
    const { count: recentRegistrations } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffDate.toISOString());

    // Get recent activity
    const { data: recentCandidates } = await supabaseAdmin
      .from('candidate_profiles')
      .select(`
        id,
        title,
        location,
        created_at,
        users!inner(
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentActivity = (recentCandidates || []).map(candidate => ({
      id: candidate.id,
      type: 'candidate_registration',
      data: {
        candidateId: candidate.id,
        title: candidate.title || 'No title',
        location: candidate.location || 'No location',
        name: `${candidate.users?.first_name || ''} ${candidate.users?.last_name || ''}`.trim() || 'Anonymous'
      },
      createdAt: candidate.created_at
    }));

    // Calculate health metrics
    const { count: completedProfiles } = await supabaseAdmin
      .from('candidate_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('profile_completed', true);

    const profileCompletionRate = totalCandidates > 0 
      ? Math.round((completedProfiles || 0) / totalCandidates * 100) 
      : 0;

    const activeProfileRate = totalCandidates > 0 
      ? Math.round((activeCandidates || 0) / totalCandidates * 100) 
      : 0;

    const dashboard = {
      period: {
        days: periodDays,
        startDate: cutoffDate,
        endDate: new Date(),
      },
      overview: {
        totalCandidates: totalCandidates || 0,
        totalCompanies: totalCompanies || 0,
        activeCandidates: activeCandidates || 0,
        verifiedCandidates: verifiedCandidates || 0,
      },
      activity: {
        recentRegistrations: recentRegistrations || 0,
        totalSearches: 0, // TODO: Implement search tracking
        totalPurchases: 0, // TODO: Implement purchase tracking
        recentActivity: recentActivity,
      },
      revenue: {
        totalRevenue: 0, // TODO: Implement revenue tracking
        totalTransactions: 0, // TODO: Implement transaction tracking
        averageOrderValue: 0, // TODO: Calculate from transactions
        dailyBreakdown: [], // TODO: Implement daily revenue breakdown
      },
      health: {
        profileCompletionRate: profileCompletionRate,
        activeProfileRate: activeProfileRate,
        totalProfiles: totalCandidates || 0,
        completedProfiles: completedProfiles || 0,
        activeProfiles: activeCandidates || 0,
      },
      topPerformers: {
        topCompaniesBySearches: [], // TODO: Implement top companies tracking
        topCompaniesByPurchases: [], // TODO: Implement purchase tracking
        topLocations: [], // TODO: Implement location analytics
      },
    };

    console.log('Dashboard API: Returning dashboard data', {
      totalCandidates,
      activeCandidates,
      verifiedCandidates
    });
    
    return createSuccessResponse(dashboard, 'Admin dashboard data retrieved successfully');

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return createErrorResponse('Failed to retrieve dashboard data', 500);
  }
}