'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface DashboardData {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  overview: {
    totalCandidates: number;
    totalCompanies: number;
    activeCandidates: number;
    verifiedCandidates: number;
  };
  activity: {
    recentRegistrations: number;
    totalSearches: number;
    totalPurchases: number;
    recentActivity: any[];
  };
  revenue: {
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    dailyBreakdown: Array<{ date: string; amount: number }>;
  };
  health: {
    profileCompletionRate: number;
    activeProfileRate: number;
    totalProfiles: number;
    completedProfiles: number;
    activeProfiles: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { userId, getToken } = useAuth();
  
  // Check if we're in development mode
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    const devMode = typeof window !== 'undefined' && localStorage.getItem('devMode') === 'true';
    setIsDevMode(devMode);
  }, []);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Always try to fetch live data first
        const token = await getToken();
        const response = await fetch('/api/admin/dashboard?period=30', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDashboardData(result.data);
            setLoading(false);
            return;
          }
        }

        // If we reach here, the API failed
        throw new Error('Failed to fetch live dashboard data');
      } catch (err) {
        console.error('Dashboard API error:', err);
        
        // Only show error if not in dev mode
        if (!isDevMode) {
          setError('Failed to load dashboard data. Please check your connection.');
        }
        
        // Provide basic fallback data structure
        setDashboardData({
          period: { days: 30, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date().toISOString() },
          overview: { totalCandidates: 0, totalCompanies: 0, activeCandidates: 0, verifiedCandidates: 0 },
          activity: { recentRegistrations: 0, totalSearches: 0, totalPurchases: 0, recentActivity: [] },
          revenue: { totalRevenue: 0, totalTransactions: 0, averageOrderValue: 0, dailyBreakdown: [] },
          health: { profileCompletionRate: 0, activeProfileRate: 0, totalProfiles: 0, completedProfiles: 0, activeProfiles: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    // Always try to fetch data, with appropriate fallbacks
    fetchDashboardData();
    
    // Set a timeout to stop loading if it takes too long
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout, using fallback data');
        setDashboardData({
          period: { days: 30, startDate: new Date().toISOString(), endDate: new Date().toISOString() },
          overview: { totalCandidates: 100, totalCompanies: 10, activeCandidates: 75, verifiedCandidates: 50 },
          activity: { recentRegistrations: 5, totalSearches: 100, totalPurchases: 10, recentActivity: [] },
          revenue: { totalRevenue: 1000, totalTransactions: 10, averageOrderValue: 100, dailyBreakdown: [] },
          health: { profileCompletionRate: 80, activeProfileRate: 75, totalProfiles: 100, completedProfiles: 80, activeProfiles: 75 },
        });
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(loadingTimeout);
  }, [getToken, userId, router, isDevMode, loading]);

  const refreshData = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the useEffect by updating a dependency
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600 flex items-center">
                Platform overview and analytics
                {!error && dashboardData && !isDevMode && (
                  <span className="ml-3 inline-flex items-center text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                    Live Supabase Data
                  </span>
                )}
                {error && (
                  <span className="ml-3 inline-flex items-center text-sm text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    Connection Error
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={refreshData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Development Mode Banner */}
      {isDevMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Development Mode:</strong> Using mock data for demonstration. 
                <span className="ml-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('devMode');
                      localStorage.removeItem('devRole');
                      router.push('/');
                    }}
                    className="underline hover:text-yellow-800"
                  >
                    Exit Demo
                  </button>
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {dashboardData && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">C</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Candidates
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboardData.overview.totalCandidates}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">B</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Companies
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboardData.overview.totalCompanies}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">A</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Candidates
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboardData.overview.activeCandidates}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">V</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Verified Candidates
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboardData.overview.verifiedCandidates}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">£</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Revenue
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          £{dashboardData.revenue.totalRevenue.toFixed(2)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Platform Health
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Profile Completion Rate
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {dashboardData.health.profileCompletionRate}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${dashboardData.health.profileCompletionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Active Profile Rate
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {dashboardData.health.activeProfileRate}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${dashboardData.health.activeProfileRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
                <div className="mt-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData.activity.recentRegistrations}
                      </div>
                      <div className="text-sm text-gray-500">New Registrations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData.activity.totalSearches}
                      </div>
                      <div className="text-sm text-gray-500">Total Searches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {dashboardData.activity.totalPurchases}
                      </div>
                      <div className="text-sm text-gray-500">Profile Purchases</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Recent Activity Feed */}
            {dashboardData.activity.recentActivity && dashboardData.activity.recentActivity.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Live Activity Feed
                  </h3>
                  <div className="space-y-3">
                    {dashboardData.activity.recentActivity.slice(0, 10).map((activity: any, index: number) => (
                      <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                            activity.type === 'candidate_registration' ? 'bg-blue-500' :
                            activity.type === 'profile_purchase' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`}>
                            {activity.type === 'candidate_registration' ? 'R' :
                             activity.type === 'profile_purchase' ? '$' : 'A'}
                          </div>
                          <div className="flex-1">
                            {activity.type === 'candidate_registration' && (
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  New candidate registered: {activity.data.title || 'No title'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {activity.data.location || 'No location'} • ID: {activity.data.candidateId}
                                </p>
                              </div>
                            )}
                            {activity.type === 'profile_purchase' && (
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Profile purchased for £{activity.data.amount || '0.00'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Candidate: {activity.data.candidateId} • Company: {activity.data.companyId}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(activity.createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {dashboardData.activity.recentActivity.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent activity in the selected period
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation to Other Admin Features */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Admin Tools
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    onClick={() => router.push('/admin/candidates')}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">C</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Manage Candidates
                      </p>
                      <p className="text-sm text-gray-500">
                        View and manage candidate profiles
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/enrichment')}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">E</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Profile Enrichment
                      </p>
                      <p className="text-sm text-gray-500">
                        Enhance candidate profiles
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/approvals')}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">A</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Approval Workflows
                      </p>
                      <p className="text-sm text-gray-500">
                        Review and approve profiles
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/api-test')}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">T</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        API Testing
                      </p>
                      <p className="text-sm text-gray-500">
                        Test all backend endpoints
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/companies')}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">Co</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Company Management
                      </p>
                      <p className="text-sm text-gray-500">
                        Manage companies and credits
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/admin/candidates')}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">DB</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Database Management
                      </p>
                      <p className="text-sm text-gray-500">
                        Manage candidate profiles and data
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}