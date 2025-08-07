'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Company {
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
}

interface CompaniesResponse {
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    totalCompanies: number;
    displayedCompanies: number;
    totalCredits: number;
    totalUnlockedProfiles: number;
    verifiedCount: number;
  };
}

export default function AdminCompanies() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CompaniesResponse['summary'] | null>(null);
  const [pagination, setPagination] = useState<CompaniesResponse['pagination']>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Search and filter states
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [creditRangeFilter, setCreditRangeFilter] = useState<'all' | '0' | '1-10' | '11-50' | '51-100' | '100+'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'company_name' | 'credits' | 'unlocked_profiles'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        verificationStatus: verificationFilter,
        creditRange: creditRangeFilter,
      });

      if (search) {
        queryParams.append('search', search);
      }

      const token = await getToken();
      const response = await fetch(`/api/admin/companies?${queryParams}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const result = await response.json();
      if (result.success) {
        setCompanies(result.data.companies);
        setPagination(result.data.pagination);
        setSummary(result.data.summary);
      } else {
        throw new Error(result.error || 'Failed to load companies');
      }
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [pagination.page, search, verificationFilter, creditRangeFilter, sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage companies and their credits
                </p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Companies</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{summary.totalCompanies}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Credits</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">{summary.totalCredits}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Unlocked Profiles</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{summary.totalUnlockedProfiles}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Verified Companies</dt>
                <dd className="mt-1 text-3xl font-semibold text-purple-600">{summary.verifiedCount}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Credits/Company</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {summary.displayedCompanies > 0 
                    ? Math.round(summary.totalCredits / summary.displayedCompanies) 
                    : 0}
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Company name or email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification</label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credit Range</label>
              <select
                value={creditRangeFilter}
                onChange={(e) => setCreditRangeFilter(e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All</option>
                <option value="0">0 Credits</option>
                <option value="1-10">1-10 Credits</option>
                <option value="11-50">11-50 Credits</option>
                <option value="51-100">51-100 Credits</option>
                <option value="100+">100+ Credits</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="created_at">Date Created</option>
                <option value="company_name">Company Name</option>
                <option value="credits">Credits</option>
                <option value="unlocked_profiles">Unlocked Profiles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unlocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {company.company_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {company.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.industry || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {company.credits} credits
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.unlockedProfiles.length} profiles
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.is_verified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(company.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/companies/${company.id}/edit`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}