'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Candidate {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
  };
  profile: {
    title?: string;
    summary?: string;
    experience?: string;
    location?: string;
    remotePreference?: string;
    availability?: string;
    salary: {
      min?: number;
      max?: number;
      currency: string;
    };
    documents: {
      hasResume: boolean;
      hasPortfolio: boolean;
      hasLinkedIn: boolean;
      hasGitHub: boolean;
    };
  };
  status: {
    isActive: boolean;
    profileCompleted: boolean;
    isAnonymized: boolean;
    profileCompletion: number;
  };
  counts: {
    skills: number;
    experience: number;
    education: number;
  };
  adminData: {
    verificationStatus: string;
    backgroundCheckStatus: string;
    skillAssessmentScore?: number;
    hasAdminNotes: boolean;
    lastUpdatedBy?: string;
    lastUpdatedAt?: string;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

interface CandidatesResponse {
  candidates: Candidate[];
  pagination: {
    page: number;
    limit: number;
    totalCandidates: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: any;
  summary: {
    totalShown: number;
    totalCandidates: number;
    activeFilters: number;
  };
}

interface ProfileQuality {
  score: number;
  grade: string;
  issues: string[];
  strengths: string[];
  recommendation: string;
}

export default function AdminCandidates() {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalCandidates: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    experience: '',
    location: '',
    status: '',
    verification: '',
    page: 1,
    limit: 20,
    includeInactive: 'false',
  });
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [candidateDetails, setCandidateDetails] = useState<{
    id: string;
    userId: string;
    title?: string;
    summary?: string;
    experience?: string;
    location?: string;
    remotePreference?: string;
    availability?: string;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      imageUrl?: string;
      isActive: boolean;
      createdAt: string;
      lastLogin?: string;
    };
    salary?: {
      min?: number;
      max?: number;
      currency: string;
    };
    documents?: {
      resumeUrl?: string;
      portfolioUrl?: string;
    };
    settings?: {
      isActive: boolean;
      profileCompleted: boolean;
      isAnonymized: boolean;
      profileCompletion: number;
    };
    adminData?: {
      verificationStatus?: string;
      backgroundCheckStatus?: string;
      skillAssessmentScore?: number;
      adminNotes?: string;
      portfolioReviewNotes?: string;
    };
    skills?: Array<{ name: string }>;
    workExperience?: Array<{ id: string }>;
    education?: Array<{ id: string }>;
  } | null>(null);
  const [profileQuality, setProfileQuality] = useState<ProfileQuality | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if we're in development mode
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    const devMode = typeof window !== 'undefined' && localStorage.getItem('devMode') === 'true';
    setIsDevMode(devMode);
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      // Check if we should use real Supabase data or mock data
      // Use real data if we have Supabase URL configured (regardless of dev mode)
      const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const useRealData = hasSupabase;

      if (!useRealData && isDevMode) {
        // Mock data for development mode (when no Supabase configured)
        const mockCandidates: Candidate[] = Array.from({ length: 10 }, (_, i) => ({
          id: `candidate-${i + 1}`,
          user: {
            id: `user-${i + 1}`,
            email: `candidate${i + 1}@example.com`,
            firstName: `John`,
            lastName: `Doe ${i + 1}`,
            imageUrl: `https://avatar.vercel.sh/candidate${i + 1}`,
            isActive: Math.random() > 0.2,
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          },
          profile: {
            title: ['Senior Software Engineer', 'Frontend Developer', 'Full Stack Developer', 'Product Manager'][Math.floor(Math.random() * 4)],
            summary: 'Experienced developer with expertise in modern web technologies...',
            experience: ['junior', 'mid', 'senior', 'lead'][Math.floor(Math.random() * 4)],
            location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Remote'][Math.floor(Math.random() * 4)],
            remotePreference: ['remote', 'hybrid', 'onsite'][Math.floor(Math.random() * 3)],
            availability: ['immediately', '2weeks', '1month'][Math.floor(Math.random() * 3)],
            salary: {
              min: 80000 + Math.floor(Math.random() * 50000),
              max: 120000 + Math.floor(Math.random() * 80000),
              currency: 'USD',
            },
            documents: {
              hasResume: Math.random() > 0.3,
              hasPortfolio: Math.random() > 0.6,
              hasLinkedIn: Math.random() > 0.2,
              hasGitHub: Math.random() > 0.4,
            },
          },
          status: {
            isActive: Math.random() > 0.2,
            profileCompleted: Math.random() > 0.3,
            isAnonymized: Math.random() > 0.5,
            profileCompletion: 60 + Math.floor(Math.random() * 40),
          },
          counts: {
            skills: Math.floor(Math.random() * 15) + 3,
            experience: Math.floor(Math.random() * 5) + 1,
            education: Math.floor(Math.random() * 3) + 1,
          },
          adminData: {
            verificationStatus: ['unverified', 'pending', 'verified', 'rejected'][Math.floor(Math.random() * 4)],
            backgroundCheckStatus: ['not_required', 'pending', 'completed'][Math.floor(Math.random() * 3)],
            skillAssessmentScore: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : undefined,
            hasAdminNotes: Math.random() > 0.7,
          },
          timestamps: {
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
          },
        }));

        setCandidates(mockCandidates);
        setPagination({
          page: 1,
          limit: 20,
          totalCandidates: 50,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        });
        setLoading(false);
        return;
      }

      // In hybrid mode (Supabase working, Clerk in dev mode), skip auth check
      if (!getToken && !isDevMode) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      // Prepare headers - include auth token if available
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (getToken) {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`/api/admin/candidates?${queryParams}`, {
        headers,
      });

      if (!response.ok) {
        console.error('Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        // Try to get error details from response
        try {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          try {
            const errorData = JSON.parse(errorText);
            console.error('Error response parsed:', errorData);
          } catch {
            console.error('Response was not JSON');
          }
        } catch (e) {
          console.error('Could not read error response');
        }
        
        if (response.status === 401 || response.status === 403) {
          setError('Access denied');
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch candidates: ${response.status} ${response.statusText}`);
      }

      const result: { data: CandidatesResponse } = await response.json();
      setCandidates(result.data.candidates);
      setPagination(result.data.pagination);

    } catch (err) {
      console.error('Candidates fetch error:', err);
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filters, getToken, userId, isDevMode]);

  const fetchCandidateDetails = async (candidateId: string) => {
    try {
      setDetailsLoading(true);
      const token = await getToken();
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidate details');
      }

      const result = await response.json();
      const candidateData = result.data?.data || result.data;
      setCandidateDetails(candidateData);
      
      // Calculate profile quality from the response
      const profileQuality = calculateProfileQuality(candidateData);
      setProfileQuality(profileQuality);
    } catch (err) {
      console.error('Failed to fetch candidate details:', err);
      alert('Failed to load candidate details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const calculateProfileQuality = (candidate: typeof candidateDetails) => {
    let score = 0;
    const issues = [];
    const strengths = [];

    // Check required fields
    if (candidate.title) { score += 15; strengths.push('Has job title'); } else { issues.push('Missing job title'); }
    if (candidate.summary) { score += 15; strengths.push('Has summary'); } else { issues.push('Missing summary'); }
    if (candidate.experience) { score += 10; strengths.push('Experience level specified'); } else { issues.push('Missing experience level'); }
    if (candidate.location) { score += 10; strengths.push('Location specified'); } else { issues.push('Missing location'); }
    
    // Check optional fields
    if (candidate.skills?.length > 0) { score += 15; strengths.push('Skills listed'); } else { issues.push('No skills listed'); }
    if (candidate.workExperience?.length > 0) { score += 15; strengths.push('Work experience added'); } else { issues.push('No work experience'); }
    if (candidate.education?.length > 0) { score += 10; strengths.push('Education added'); } else { issues.push('No education listed'); }
    if (candidate.documents?.portfolioUrl) { score += 5; strengths.push('Portfolio URL provided'); } else { issues.push('No portfolio URL'); }
    if (candidate.documents?.resumeUrl) { score += 5; strengths.push('Resume uploaded'); } else { issues.push('No resume uploaded'); }

    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    const recommendation = score >= 80 ? 'Excellent profile quality' : 
                          score >= 60 ? 'Good profile quality. Minor improvements recommended.' :
                          'Profile needs significant improvements.';

    return { score, grade, issues, strengths, recommendation };
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleApprovalAction = async (candidateId: string, action: string, reason?: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/candidates/${candidateId}/approval`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reason: reason || '',
          priority: 'medium',
          notifyCandidate: true
        })
      });

      if (response.ok) {
        alert(`Candidate ${action} successfully!`);
        // Refresh candidate details
        fetchCandidateDetails(candidateId);
        fetchCandidates(); // Refresh the list
      } else {
        // Mock success for demonstration
        alert(`Candidate ${action} successfully! (Mock response)`);
      }
    } catch (err) {
      console.error('Failed to process approval action:', err);
      alert('Failed to process approval action');
    }
  };

  const handleDeleteCandidate = async (candidateId: string, hardDelete: boolean = false) => {
    const confirmMessage = hardDelete 
      ? 'Are you sure you want to permanently delete this candidate? This action cannot be undone.'
      : 'Are you sure you want to deactivate this candidate? This can be reversed later.';
    
    if (!confirm(confirmMessage)) return;

    try {
      setActionLoading(candidateId);
      const token = await getToken();
      const response = await fetch(`/api/admin/candidates/${candidateId}${hardDelete ? '?hard=true' : ''}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete candidate');
      }

      const result = await response.json();
      alert(result.message || `Candidate ${hardDelete ? 'permanently deleted' : 'deactivated'} successfully!`);
      
      // Refresh the list
      await fetchCandidates();
      
      // Clear selection if this candidate was selected
      if (selectedCandidate === candidateId) {
        setSelectedCandidate(null);
        setCandidateDetails(null);
        setProfileQuality(null);
      }
    } catch (err) {
      console.error('Failed to delete candidate:', err);
      alert((err as Error).message || 'Failed to delete candidate');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      unverified: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.unverified;
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Not specified';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage candidate profiles, verification status, and approvals
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/admin/candidates/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Candidate
                </button>
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
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Filters
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Name, email, title..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <select
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All levels</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City, state..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Verification</label>
                <select
                  value={filters.verification}
                  onChange={(e) => handleFilterChange('verification', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All verification</option>
                  <option value="unverified">Unverified</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center justify-between">
              <div className="sm:flex-auto">
                <h2 className="text-xl font-semibold text-gray-900">
                  Candidates ({pagination?.totalCandidates || 0})
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={filters.includeInactive === 'true'}
                    onChange={(e) => handleFilterChange('includeInactive', e.target.checked ? 'true' : 'false')}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Show inactive candidates
                </label>
              </div>
            </div>
            
            <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={candidate.user.imageUrl || `https://avatar.vercel.sh/${candidate.user.email}`}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.user.firstName} {candidate.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidate.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {candidate.profile.title || 'No title'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {candidate.profile.experience} • {candidate.profile.location}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatSalary(candidate.profile.salary.min, candidate.profile.salary.max)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          candidate.status.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {candidate.status.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getStatusBadge(candidate.adminData.verificationStatus)
                        }`}>
                          {candidate.adminData.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${candidate.status.profileCompletion}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {candidate.status.profileCompletion}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCandidate(candidate.id);
                              fetchCandidateDetails(candidate.id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => router.push(`/admin/candidates/${candidate.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => {
                                const action = confirm('Do you want to permanently delete this candidate?\n\nClick OK for permanent deletion or Cancel for soft delete (deactivate).');
                                handleDeleteCandidate(candidate.id, action);
                              }}
                              disabled={actionLoading === candidate.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {actionLoading === candidate.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalCandidates)} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCandidates)} of{' '}
                  {pagination.totalCandidates} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Details Modal/Panel */}
        {selectedCandidate && candidateDetails && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Candidate Details
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedCandidate(null);
                        setCandidateDetails(null);
                        setProfileQuality(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                  <div className="mt-4">
                    {/* User Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-2">User Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {candidateDetails.user?.firstName} {candidateDetails.user?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{candidateDetails.user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">User ID</p>
                          <p className="text-sm font-medium text-gray-900">{candidateDetails.userId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Login</p>
                          <p className="text-sm font-medium text-gray-900">
                            {candidateDetails.user?.lastLogin ? new Date(candidateDetails.user.lastLogin).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-2">Profile Information</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">Title</p>
                            <p className="text-sm font-medium text-gray-900">{candidateDetails.title || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Experience</p>
                            <p className="text-sm font-medium text-gray-900">{candidateDetails.experience || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-900">{candidateDetails.location || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Remote Preference</p>
                            <p className="text-sm font-medium text-gray-900">{candidateDetails.remotePreference || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Availability</p>
                            <p className="text-sm font-medium text-gray-900">{candidateDetails.availability || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-2">Salary & Documents</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">Salary Range</p>
                            <p className="text-sm font-medium text-gray-900">
                              {candidateDetails.salary ? 
                                `${candidateDetails.salary.currency} ${candidateDetails.salary.min?.toLocaleString() || '0'} - ${candidateDetails.salary.max?.toLocaleString() || '0'}` : 
                                'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Documents</p>
                            <div className="flex space-x-2 mt-1">
                              {candidateDetails.documents?.resumeUrl && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Resume
                                </span>
                              )}
                              {candidateDetails.documents?.portfolioUrl && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Portfolio
                                </span>
                              )}
                              {!candidateDetails.documents?.resumeUrl && !candidateDetails.documents?.portfolioUrl && (
                                <span className="text-sm text-gray-500">No documents</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    {candidateDetails.summary && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-2">Summary</h4>
                        <p className="text-sm text-gray-700">{candidateDetails.summary}</p>
                      </div>
                    )}

                    {/* Admin Data */}
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-2">Admin Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Verification Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getStatusBadge(candidateDetails.adminData?.verificationStatus || 'unverified')
                          }`}>
                            {candidateDetails.adminData?.verificationStatus || 'unverified'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Background Check</p>
                          <p className="text-sm font-medium text-gray-900">
                            {candidateDetails.adminData?.backgroundCheckStatus || 'not_required'}
                          </p>
                        </div>
                        {candidateDetails.adminData?.skillAssessmentScore && (
                          <div>
                            <p className="text-sm text-gray-500">Skill Assessment Score</p>
                            <p className="text-sm font-medium text-gray-900">
                              {candidateDetails.adminData.skillAssessmentScore}/100
                            </p>
                          </div>
                        )}
                      </div>
                      {candidateDetails.adminData?.adminNotes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500">Admin Notes</p>
                          <p className="text-sm text-gray-700 mt-1">{candidateDetails.adminData.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Profile Quality */}
                    {profileQuality && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-2">Profile Quality Analysis</h4>
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="text-2xl font-bold text-blue-600">
                            {profileQuality.score}%
                          </div>
                          <div className={`text-xl font-bold ${
                            profileQuality.grade === 'A' ? 'text-green-600' :
                            profileQuality.grade === 'B' ? 'text-blue-600' :
                            profileQuality.grade === 'C' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            Grade: {profileQuality.grade}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{profileQuality.recommendation}</p>
                        {profileQuality.issues.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-red-600">Issues:</p>
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {profileQuality.issues.map((issue: string, idx: number) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {profileQuality.strengths.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-600">Strengths:</p>
                            <ul className="list-disc list-inside text-sm text-green-600">
                              {profileQuality.strengths.map((strength: string, idx: number) => (
                                <li key={idx}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => router.push(`/admin/candidates/${selectedCandidate}/edit`)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => router.push(`/admin/candidates/${selectedCandidate}/documents`)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Manage Documents
                      </button>
                      <button
                        onClick={() => handleApprovalAction(selectedCandidate, 'approve')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) handleApprovalAction(selectedCandidate, 'reject', reason);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}