'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

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
  admin_notes?: string;
  user: {
    id: string;
    email: string;
    role: string;
    first_name?: string;
    last_name?: string;
  };
  credits: number;
  unlockedProfiles: string[];
  creditHistory: any[];
  unlockedProfileDetails?: any[];
  onboardingCompleted: boolean;
  clerkData?: {
    id: string;
    emailAddresses: any[];
    createdAt: number;
    lastSignInAt: number;
    publicMetadata: any;
  };
}

interface CreditTransaction {
  timestamp: string;
  amount: number;
  balance: number;
  reason: string;
  adminNote?: string;
  adminId?: string;
  adminEmail?: string;
  type: string;
  profileId?: string;
  profileTitle?: string;
}

export default function EditCompany() {
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  // Company data
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    website: '',
    position: '',
    hiring_needs: '',
    is_verified: false,
    admin_notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Credit management state
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [creditOperation, setCreditOperation] = useState<'add' | 'remove'>('add');
  const [processingCredit, setProcessingCredit] = useState(false);

  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetUnlocksConfirm, setShowResetUnlocksConfirm] = useState(false);

  // Fetch company data
  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }

      const result = await response.json();
      if (result.success) {
        setCompany(result.data);
        setFormData({
          company_name: result.data.company_name || '',
          industry: result.data.industry || '',
          company_size: result.data.company_size || '',
          website: result.data.website || '',
          position: result.data.position || '',
          hiring_needs: result.data.hiring_needs || '',
          is_verified: result.data.is_verified || false,
          admin_notes: result.data.admin_notes || '',
        });
      } else {
        throw new Error(result.error || 'Failed to load company');
      }
    } catch (err: any) {
      console.error('Error fetching company:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  // Save company changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update company');
      }

      // Refresh company data
      await fetchCompany();
      alert('Company updated successfully');
    } catch (err: any) {
      console.error('Error saving company:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle credit adjustment
  const handleCreditAdjustment = async () => {
    if (!creditAmount || !creditReason) {
      alert('Please enter amount and reason');
      return;
    }

    try {
      setProcessingCredit(true);
      setError(null);

      const amount = parseInt(creditAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount');
        return;
      }

      const token = await getToken();
      const response = await fetch(`/api/admin/companies/${companyId}/credits`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: creditOperation === 'add' ? amount : -amount,
          reason: creditReason,
          adminNote: creditNote,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to adjust credits');
      }

      // Refresh company data
      await fetchCompany();
      
      // Reset credit form
      setCreditAmount('');
      setCreditReason('');
      setCreditNote('');
      
      alert(result.message || 'Credits adjusted successfully');
    } catch (err: any) {
      console.error('Error adjusting credits:', err);
      setError(err.message);
    } finally {
      setProcessingCredit(false);
    }
  };

  // Reset credits
  const handleResetCredits = async () => {
    try {
      setProcessingCredit(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(`/api/admin/companies/${companyId}/credits`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset credits');
      }

      // Refresh company data
      await fetchCompany();
      setShowResetConfirm(false);
      alert('Credits reset to 0 successfully');
    } catch (err: any) {
      console.error('Error resetting credits:', err);
      setError(err.message);
    } finally {
      setProcessingCredit(false);
    }
  };

  // Reset unlocked profiles
  const handleResetUnlocks = async () => {
    try {
      setProcessingCredit(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(`/api/admin/companies/${companyId}/credits`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset unlocked profiles');
      }

      // Refresh company data
      await fetchCompany();
      setShowResetUnlocksConfirm(false);
      alert(result.message || 'Unlocked profiles reset successfully');
    } catch (err: any) {
      console.error('Error resetting unlocks:', err);
      setError(err.message);
    } finally {
      setProcessingCredit(false);
    }
  };

  // Delete company
  const handleDelete = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete company');
      }

      alert('Company deleted successfully');
      router.push('/admin/companies');
    } catch (err: any) {
      console.error('Error deleting company:', err);
      setError(err.message);
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Company not found</h2>
          <button
            onClick={() => router.push('/admin/companies')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Companies
          </button>
        </div>
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
                <h1 className="text-3xl font-bold text-gray-900">Edit Company</h1>
                <p className="mt-2 text-gray-600">
                  {company.company_name} - {company.user.email}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/admin/companies')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Company Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Size</label>
                <select
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hiring Needs</label>
                <textarea
                  value={formData.hiring_needs}
                  onChange={(e) => setFormData({ ...formData, hiring_needs: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                <textarea
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Internal notes about this company"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={formData.is_verified}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_verified" className="ml-2 block text-sm text-gray-900">
                  Verified Company
                </label>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="text-sm text-gray-900">{company.user_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">{new Date(company.created_at).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">{new Date(company.updated_at).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Onboarding</dt>
                  <dd className="text-sm text-gray-900">
                    {company.onboardingCompleted ? (
                      <span className="text-green-600">Completed</span>
                    ) : (
                      <span className="text-amber-600">Incomplete</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 border-t pt-6">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                Delete Company
              </button>
            </div>
          </div>

          {/* Credit Management */}
          <div className="space-y-6">
            {/* Current Credits */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Credit Management</h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{company.credits}</p>
                    <p className="text-sm text-gray-500">Current Credits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-green-600">{company.unlockedProfiles.length}</p>
                    <p className="text-sm text-gray-500">Profiles Unlocked</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Reset credits to 0
                </button>
              </div>

              {/* Add/Remove Credits */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Adjust Credits</h3>
                
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCreditOperation('add')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                        creditOperation === 'add'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Add Credits
                    </button>
                    <button
                      onClick={() => setCreditOperation('remove')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                        creditOperation === 'remove'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Remove Credits
                    </button>
                  </div>

                  <input
                    type="number"
                    placeholder="Amount"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    min="1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Reason (required)"
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />

                  <textarea
                    placeholder="Admin note (optional)"
                    value={creditNote}
                    onChange={(e) => setCreditNote(e.target.value)}
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />

                  <button
                    onClick={handleCreditAdjustment}
                    disabled={processingCredit || !creditAmount || !creditReason}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {processingCredit ? 'Processing...' : `${creditOperation === 'add' ? 'Add' : 'Remove'} Credits`}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Credit History */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Credit History</h3>
              
              {company.creditHistory.length > 0 ? (
                <div className="space-y-3">
                  {company.creditHistory.slice(-5).reverse().map((transaction: CreditTransaction, index: number) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.reason}
                            {transaction.profileTitle && ` - ${transaction.profileTitle}`}
                          </p>
                          {transaction.adminNote && (
                            <p className="text-xs text-gray-500 italic">{transaction.adminNote}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">Balance: {transaction.balance}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No credit history</p>
              )}

              {company.creditHistory.length > 5 && (
                <p className="mt-3 text-sm text-gray-500">
                  Showing last 5 of {company.creditHistory.length} transactions
                </p>
              )}
            </div>

            {/* Unlocked Profiles */}
            {company.unlockedProfileDetails && company.unlockedProfileDetails.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Unlocked Profiles</h3>
                  <button
                    onClick={() => setShowResetUnlocksConfirm(true)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Reset all unlocks
                  </button>
                </div>
                
                <div className="space-y-2">
                  {company.unlockedProfileDetails.map((profile: any) => (
                    <div key={profile.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {profile.users?.first_name} {profile.users?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{profile.title}</p>
                      </div>
                      <a
                        href={`/admin/candidates/${profile.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Company</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete {company.company_name}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Credits Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Credits</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to reset {company.company_name}'s credits to 0? Current balance: {company.credits} credits.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCredits}
                disabled={processingCredit}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {processingCredit ? 'Resetting...' : 'Reset to 0'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Unlocks Confirmation Modal */}
      {showResetUnlocksConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Unlocked Profiles</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to reset all unlocked profiles for {company.company_name}? They have unlocked {company.unlockedProfiles.length} profiles.
            </p>
            <p className="text-sm text-amber-600 mb-4">
              <strong>Note:</strong> This will allow the company to re-unlock these profiles using their credits.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetUnlocksConfirm(false)}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetUnlocks}
                disabled={processingCredit}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {processingCredit ? 'Resetting...' : 'Reset Unlocks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}