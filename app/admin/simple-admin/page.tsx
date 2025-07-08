"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Candidate {
  id: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    imageUrl?: string
    isActive: boolean
  }
  profile: {
    title?: string
    experience?: string
    location?: string
  }
  status: {
    isActive: boolean
    profileCompleted: boolean
  }
}

export default function SimpleAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/candidates?includeInactive=true', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError(`Error ${response.status}: Failed to fetch candidates`);
        return;
      }

      const result = await response.json();
      console.log('Candidates data:', result);
      
      if (result.success && result.data) {
        setCandidates(result.data.candidates || []);
      } else {
        setError(result.message || 'Failed to load candidates');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: true,
          profileCompleted: true,
          verificationStatus: 'verified'
        })
      });

      if (response.ok) {
        alert('Candidate approved!');
        fetchCandidates();
      } else {
        alert('Failed to approve candidate');
      }
    } catch (err) {
      console.error('Error approving candidate:', err);
      alert('Error approving candidate');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Admin - Candidate Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Error Loading Dashboard</p>
            <p className="text-sm mt-1">{error}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Troubleshooting:</strong></p>
              <ul className="list-disc list-inside">
                <li>Ensure you have configured Supabase credentials in .env.local</li>
                <li>Check that database migrations have been run</li>
                <li>Check if you have admin role in Clerk</li>
                <li>Verify your Clerk configuration is correct</li>
              </ul>
            </div>
            <button
              onClick={fetchCandidates}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!error && !loading && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Database Candidates ({candidates.length})</h2>
              <p className="text-sm text-gray-600 mt-1">Showing all candidates from Supabase database</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name / Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.user.firstName} {candidate.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {candidate.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.profile.title || 'No title'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.profile.location || 'No location'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          candidate.status.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {candidate.status.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {candidate.status.profileCompleted && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Complete
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/admin/candidates/${candidate.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        {!candidate.status.isActive && (
                          <button
                            onClick={() => handleApprove(candidate.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {candidates.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No candidates found in database</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}