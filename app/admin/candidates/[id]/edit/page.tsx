'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';

interface CandidateFormData {
  title?: string;
  summary?: string;
  experience?: string;
  location?: string;
  remotePreference?: string;
  availability?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  isActive?: boolean;
  isAnonymized?: boolean;
  adminNotes?: string;
  verificationStatus?: string;
  backgroundCheckStatus?: string;
  skillAssessmentScore?: number;
}

export default function EditCandidatePage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CandidateFormData>({
    salaryCurrency: 'USD',
  });
  const [originalData, setOriginalData] = useState<{
    title?: string;
    summary?: string;
    experience?: string;
    location?: string;
    remotePreference?: string;
    availability?: string;
    salary?: {
      min?: number;
      max?: number;
      currency: string;
    };
    adminData?: {
      adminNotes?: string;
      verificationStatus?: string;
      backgroundCheckStatus?: string;
      skillAssessmentScore?: number;
    };
    settings?: {
      isActive?: boolean;
      isAnonymized?: boolean;
    };
    [key: string]: unknown;
  } | null>(null);

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        
        // Prepare headers
        const headers: any = {
          'Content-Type': 'application/json',
        };
        
        // Add auth token if available
        if (getToken) {
          try {
            const token = await getToken();
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
          } catch (authError) {
            console.warn('Failed to get auth token:', authError);
          }
        }
        
        console.log('Fetching candidate with ID:', candidateId);
        
        const response = await fetch(`/api/admin/candidates/${candidateId}`, {
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch candidate data:', {
            candidateId,
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            url: `/api/admin/candidates/${candidateId}`
          });
          
          // Try to parse error response
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || `Failed to fetch candidate data: ${response.statusText}`);
          } catch {
            throw new Error(`Failed to fetch candidate data: ${response.statusText}`);
          }
        }

        const result = await response.json();
        const candidate = result.data?.data || result.data;
        
        // Store original data
        setOriginalData(candidate);
        
        // Map API response to form data
        setFormData({
          title: candidate.title || '',
          summary: candidate.summary || '',
          experience: candidate.experience || '',
          location: candidate.location || '',
          remotePreference: candidate.remotePreference || '',
          availability: candidate.availability || '',
          salaryMin: candidate.salary?.min || undefined,
          salaryMax: candidate.salary?.max || undefined,
          salaryCurrency: candidate.salary?.currency || 'USD',
          linkedinUrl: candidate.profile?.linkedinUrl || '',
          githubUrl: candidate.profile?.githubUrl || '',
          portfolioUrl: candidate.documents?.portfolioUrl || '',
          resumeUrl: candidate.documents?.resumeUrl || '',
          isActive: candidate.settings?.isActive ?? true,
          isAnonymized: candidate.settings?.isAnonymized ?? true,
          adminNotes: candidate.adminData?.adminNotes || '',
          verificationStatus: candidate.adminData?.verificationStatus || 'unverified',
          backgroundCheckStatus: candidate.adminData?.backgroundCheckStatus || 'not_required',
          skillAssessmentScore: candidate.adminData?.skillAssessmentScore || undefined,
        });

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch candidate:', err);
        setError((err as Error).message || 'Failed to load candidate data');
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId, getToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = await getToken();
      
      // Prepare update data - only send changed fields
      const updateData: Record<string, unknown> = {};
      
      // Check each field for changes
      Object.keys(formData).forEach(key => {
        const formValue = formData[key as keyof CandidateFormData];
        const originalValue = originalData?.[key] || 
          originalData?.salary?.[key] || 
          originalData?.adminData?.[key] ||
          originalData?.settings?.[key];
        
        if (formValue !== originalValue) {
          updateData[key] = formValue;
        }
      });

      if (Object.keys(updateData).length === 0) {
        alert('No changes detected');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update candidate');
      }

      alert('Candidate updated successfully!');
      router.push('/admin/candidates');
    } catch (err: any) {
      console.error('Update error:', err);
      setError((err as Error).message || 'Failed to update candidate');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !originalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/candidates')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Candidate</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update candidate profile information
                </p>
                {originalData?.user && (
                  <p className="mt-2 text-sm text-gray-500">
                    {originalData.user.firstName} {originalData.user.lastName} ({originalData.user.email})
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push('/admin/candidates')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                    <select
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select experience level</option>
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
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remote Preference</label>
                    <select
                      name="remotePreference"
                      value={formData.remotePreference || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select preference</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Availability</label>
                    <select
                      name="availability"
                      value={formData.availability || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select availability</option>
                      <option value="immediately">Immediately</option>
                      <option value="2weeks">2 weeks</option>
                      <option value="1month">1 month</option>
                      <option value="3months">3 months</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                  <textarea
                    name="summary"
                    value={formData.summary || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Salary Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Salary</label>
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Salary</label>
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      name="salaryCurrency"
                      value={formData.salaryCurrency || 'USD'}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Links */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Links</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resume URL</label>
                    <input
                      type="url"
                      name="resumeUrl"
                      value={formData.resumeUrl || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Settings</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                    <select
                      name="verificationStatus"
                      value={formData.verificationStatus || 'unverified'}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="unverified">Unverified</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Background Check Status</label>
                    <select
                      name="backgroundCheckStatus"
                      value={formData.backgroundCheckStatus || 'not_required'}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="not_required">Not Required</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skill Assessment Score (0-100)</label>
                    <input
                      type="number"
                      name="skillAssessmentScore"
                      value={formData.skillAssessmentScore || ''}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                  <textarea
                    name="adminNotes"
                    value={formData.adminNotes || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Profile is active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAnonymized"
                      id="isAnonymized"
                      checked={formData.isAnonymized ?? true}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isAnonymized" className="ml-2 block text-sm text-gray-900">
                      Profile is anonymized
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/candidates')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}