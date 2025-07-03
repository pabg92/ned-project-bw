'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ApiEndpoint {
  name: string;
  method: string;
  url: string;
  description: string;
  category: string;
  requiresBody?: boolean;
  sampleBody?: Record<string, unknown>;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // System Endpoints
  {
    name: 'Health Check',
    method: 'GET',
    url: '/api/health',
    description: 'Check API health status',
    category: 'System'
  },
  {
    name: 'Database Connection Test',
    method: 'GET',
    url: '/api/test-db',
    description: 'Test Supabase database connection',
    category: 'System'
  },

  // Admin Dashboard
  {
    name: 'Admin Dashboard',
    method: 'GET',
    url: '/api/admin/dashboard',
    description: 'Get admin dashboard analytics',
    category: 'Admin'
  },
  {
    name: 'Admin Dashboard (7 days)',
    method: 'GET',
    url: '/api/admin/dashboard?period=7',
    description: 'Get admin dashboard analytics for last 7 days',
    category: 'Admin'
  },

  // Candidate Management
  {
    name: 'List All Candidates',
    method: 'GET',
    url: '/api/admin/candidates',
    description: 'Get all candidates with pagination',
    category: 'Candidates'
  },
  {
    name: 'List Candidates (Page 2)',
    method: 'GET',
    url: '/api/admin/candidates?page=2&limit=5',
    description: 'Get candidates page 2 with 5 per page',
    category: 'Candidates'
  },
  {
    name: 'Search Candidates',
    method: 'GET',
    url: '/api/admin/candidates?search=developer',
    description: 'Search candidates by keyword',
    category: 'Candidates'
  },
  {
    name: 'Filter by Experience',
    method: 'GET',
    url: '/api/admin/candidates?experience=senior',
    description: 'Get only senior level candidates',
    category: 'Candidates'
  },
  {
    name: 'Filter by Remote',
    method: 'GET',
    url: '/api/admin/candidates?remotePreference=remote',
    description: 'Get only remote candidates',
    category: 'Candidates'
  },
  {
    name: 'Create New Candidate',
    method: 'POST',
    url: '/api/admin/candidates',
    description: 'Create a new candidate with user',
    category: 'Candidates',
    requiresBody: true,
    sampleBody: {
      userId: `test-${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      title: 'Senior Full Stack Developer',
      summary: 'Experienced developer with 8+ years in web development',
      experience: 'senior',
      location: 'San Francisco, CA',
      remotePreference: 'remote',
      availability: 'immediately',
      salaryMin: 150000,
      salaryMax: 200000,
      salaryCurrency: 'USD',
      linkedinUrl: 'https://linkedin.com/in/testuser',
      githubUrl: 'https://github.com/testuser',
      isActive: true,
      isAnonymized: false
    }
  },
  {
    name: 'Get Specific Candidate',
    method: 'GET',
    url: '/api/admin/candidates/[CANDIDATE_ID]',
    description: 'Get specific candidate (replace [CANDIDATE_ID])',
    category: 'Candidates'
  },
  {
    name: 'Update Candidate (Admin)',
    method: 'PUT',
    url: '/api/admin/candidates/candidate-1',
    description: 'Update candidate profile with admin metadata',
    category: 'Admin',
    requiresBody: true,
    sampleBody: {
      adminNotes: 'Updated candidate notes',
      verificationStatus: 'verified'
    }
  },
  {
    name: 'Get Enrichment Records',
    method: 'GET',
    url: '/api/admin/candidates/candidate-1/enrichment',
    description: 'Get candidate enrichment history',
    category: 'Admin'
  },
  {
    name: 'Create Enrichment Record',
    method: 'POST',
    url: '/api/admin/candidates/candidate-1/enrichment',
    description: 'Create new enrichment record',
    category: 'Admin',
    requiresBody: true,
    sampleBody: {
      enrichmentType: 'skill_assessment',
      data: {
        overallScore: 85,
        assessmentDate: '2024-01-20T10:00:00Z',
        assessmentType: 'technical_review'
      },
      notes: 'Strong technical skills demonstrated'
    }
  },
  {
    name: 'Get Documents',
    method: 'GET',
    url: '/api/admin/candidates/candidate-1/documents',
    description: 'Get candidate document list',
    category: 'Admin'
  },
  {
    name: 'Get Approval Status',
    method: 'GET',
    url: '/api/admin/candidates/candidate-1/approval',
    description: 'Get candidate approval status and history',
    category: 'Admin'
  },
  {
    name: 'Take Approval Action',
    method: 'POST',
    url: '/api/admin/candidates/candidate-1/approval',
    description: 'Take approval action (approve/reject/request changes)',
    category: 'Admin',
    requiresBody: true,
    sampleBody: {
      action: 'approve',
      reason: 'Profile meets all quality standards',
      priority: 'medium',
      notifyCandidate: true
    }
  },

  // Candidate Endpoints
  {
    name: 'Candidate Registration',
    method: 'POST',
    url: '/api/v1/candidates/register',
    description: 'Register or update candidate profile',
    category: 'Candidate',
    requiresBody: true,
    sampleBody: {
      title: 'Senior React Developer',
      summary: 'Experienced developer with 5+ years in React',
      location: 'San Francisco, CA',
      experience: 'senior',
      remotePreference: 'hybrid',
      availability: 'immediately'
    }
  },
  {
    name: 'Get Candidate Profile',
    method: 'GET',
    url: '/api/v1/candidates/profile',
    description: 'Get candidate profile with completion status',
    category: 'Candidate'
  },
  {
    name: 'Update Candidate Profile',
    method: 'PUT',
    url: '/api/v1/candidates/profile',
    description: 'Update candidate profile',
    category: 'Candidate',
    requiresBody: true,
    sampleBody: {
      title: 'Senior Full Stack Developer',
      summary: 'Updated summary with new skills'
    }
  },
  {
    name: 'Get Visibility Settings',
    method: 'GET',
    url: '/api/v1/candidates/profile/visibility',
    description: 'Get profile visibility settings',
    category: 'Candidate'
  },

  // Search Endpoints
  {
    name: 'Search Candidates',
    method: 'POST',
    url: '/api/v1/search',
    description: 'Search candidates with filters',
    category: 'Search',
    requiresBody: true,
    sampleBody: {
      query: 'React developer',
      filters: {
        experience: ['mid', 'senior'],
        location: ['San Francisco', 'New York'],
        remotePreference: ['remote', 'hybrid']
      },
      page: 1,
      limit: 10,
      sortBy: 'relevance'
    }
  },
  {
    name: 'Search Suggestions',
    method: 'GET',
    url: '/api/v1/search/suggestions?q=React&type=skills',
    description: 'Get search suggestions and autocomplete',
    category: 'Search'
  },
  {
    name: 'Search History',
    method: 'GET',
    url: '/api/v1/search/history',
    description: 'Get company search history',
    category: 'Search'
  },
  {
    name: 'Saved Searches',
    method: 'GET',
    url: '/api/v1/search/saved',
    description: 'Get saved searches for company',
    category: 'Search'
  },

  // Payment Endpoints
  {
    name: 'Create Payment Intent',
    method: 'POST',
    url: '/api/v1/payments/create-intent',
    description: 'Create payment intent for profile unlock',
    category: 'Payment',
    requiresBody: true,
    sampleBody: {
      candidateId: 'candidate-1',
      amount: 2500,
      currency: 'usd'
    }
  },
  {
    name: 'Payment History',
    method: 'GET',
    url: '/api/v1/payments/history',
    description: 'Get company payment history',
    category: 'Payment'
  },
  {
    name: 'Subscription Status',
    method: 'GET',
    url: '/api/v1/payments/subscription',
    description: 'Get current subscription status',
    category: 'Payment'
  },
  {
    name: 'Unlock Candidate Profile',
    method: 'GET',
    url: '/api/v1/candidates/candidate-1/unlock',
    description: 'Get full candidate profile after payment',
    category: 'Payment'
  }
];

export default function ApiTestPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(API_ENDPOINTS.map(ep => ep.category)))];

  const filteredEndpoints = selectedCategory === 'All' 
    ? API_ENDPOINTS 
    : API_ENDPOINTS.filter(ep => ep.category === selectedCategory);

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    const key = `${endpoint.method}-${endpoint.url}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const token = await getToken();
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.requiresBody && endpoint.sampleBody) {
        // Generate unique data for each test
        let body = { ...endpoint.sampleBody };
        if (body.userId && typeof body.userId === 'string' && body.userId.includes('test-')) {
          body.userId = `test-${Date.now()}`;
        }
        if (body.email && typeof body.email === 'string' && body.email.includes('test')) {
          body.email = `test${Date.now()}@example.com`;
        }
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint.url, options);
      
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      setResults(prev => ({
        ...prev,
        [key]: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [key]: {
          status: 0,
          statusText: 'Network Error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Testing Dashboard</h1>
              <p className="mt-2 text-gray-600">Test all backend API endpoints</p>
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

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedCategory === category
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-6">
          {filteredEndpoints.map((endpoint) => {
            const key = `${endpoint.method}-${endpoint.url}`;
            const result = results[key];
            const isLoading = loading[key];

            return (
              <div key={key} className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {endpoint.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {endpoint.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {endpoint.url}
                        </code>
                      </div>
                    </div>
                    <button
                      onClick={() => testEndpoint(endpoint)}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      {isLoading ? 'Testing...' : 'Test'}
                    </button>
                  </div>

                  {endpoint.requiresBody && endpoint.sampleBody && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Sample Request Body:</h4>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                        {JSON.stringify(endpoint.sampleBody, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Response:</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                            {result.status} {result.statusText}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(result.data || result.error, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Test All Button */}
        <div className="mt-8 text-center space-y-4">
          <button
            onClick={() => {
              filteredEndpoints.forEach(endpoint => {
                setTimeout(() => testEndpoint(endpoint), Math.random() * 2000);
              });
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Test All {selectedCategory} Endpoints
          </button>
          
          {/* Quick Actions */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  // Test database connection first
                  const dbTest = API_ENDPOINTS.find(e => e.url === '/api/test-db');
                  if (dbTest) testEndpoint(dbTest);
                  
                  // Then list candidates
                  setTimeout(() => {
                    const listTest = API_ENDPOINTS.find(e => e.url === '/api/admin/candidates');
                    if (listTest) testEndpoint(listTest);
                  }, 1000);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Test DB + List Candidates
              </button>
              
              <button
                onClick={() => {
                  const createTest = API_ENDPOINTS.find(e => e.name === 'Create New Candidate');
                  if (createTest) testEndpoint(createTest);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Create Test Candidate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}