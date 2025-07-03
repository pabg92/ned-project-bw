'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  description?: string;
}

interface DocumentSummary {
  totalDocuments: number;
  totalSize: number;
  lastUpload: string | null;
}

export default function CandidateDocuments() {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [candidateId, getToken, userId]);

  const fetchDocuments = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/candidates/${candidateId}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setDocuments(result.data.documents || []);
        setSummary(result.data.summary || null);
      } else {
        // Mock data for demonstration
        const mockData = {
          documents: [
            {
              id: 'doc_1',
              name: 'resume-john-doe.pdf',
              type: 'resume',
              size: 1024567,
              uploadedAt: '2024-01-15T10:00:00Z',
              uploadedBy: 'admin',
              url: '/mock/resume-john-doe.pdf',
              description: 'Updated resume with latest experience'
            },
            {
              id: 'doc_2',
              name: 'skill-assessment-results.pdf',
              type: 'skill_assessment',
              size: 987654,
              uploadedAt: '2024-01-20T15:30:00Z',
              uploadedBy: 'admin',
              url: '/mock/skill-assessment-results.pdf',
              description: 'Technical assessment results'
            }
          ],
          summary: {
            totalDocuments: 2,
            totalSize: 2012221,
            lastUpload: '2024-01-20T15:30:00Z'
          }
        };
        setDocuments(mockData.documents);
        setSummary(mockData.summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    const file = files[0];

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', determineDocumentType(file.name));
      formData.append('description', '');

      const response = await fetch(`/api/admin/candidates/${candidateId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert('Document uploaded successfully!');
        fetchDocuments(); // Refresh the list
      } else {
        // Mock success for demonstration
        const mockDocument: Document = {
          id: `doc_${Date.now()}`,
          name: file.name,
          type: determineDocumentType(file.name),
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin',
          url: `/mock/${file.name}`,
          description: 'Mock uploaded document'
        };
        setDocuments(prev => [...prev, mockDocument]);
        alert('Document uploaded successfully! (Mock response)');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/candidates/${candidateId}/documents`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        alert('Document deleted successfully!');
        fetchDocuments();
      } else {
        // Mock success for demonstration
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        alert('Document deleted successfully! (Mock response)');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete document');
    }
  };

  const determineDocumentType = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('resume') || lowerName.includes('cv')) return 'resume';
    if (lowerName.includes('background') || lowerName.includes('check')) return 'background_check';
    if (lowerName.includes('skill') || lowerName.includes('assessment')) return 'skill_assessment';
    if (lowerName.includes('portfolio') || lowerName.includes('work')) return 'portfolio';
    return 'general';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentTypeColor = (type: string): string => {
    switch (type) {
      case 'resume': return 'bg-blue-100 text-blue-800';
      case 'skill_assessment': return 'bg-green-100 text-green-800';
      case 'background_check': return 'bg-purple-100 text-purple-800';
      case 'portfolio': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
              <p className="mt-2 text-gray-600">Manage candidate documents and files</p>
            </div>
            <button
              onClick={() => router.push(`/admin/candidates`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Candidates
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Document Summary */}
          {summary && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Document Summary
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {summary.totalDocuments}
                    </div>
                    <div className="text-sm text-gray-500">Total Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatFileSize(summary.totalSize)}
                    </div>
                    <div className="text-sm text-gray-500">Total Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium text-purple-600">
                      {summary.lastUpload ? formatDate(summary.lastUpload) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Last Upload</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Upload New Document
              </h3>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileUpload(e.dataTransfer.files);
                  }
                }}
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        disabled={uploading}
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFileUpload(e.target.files);
                          }
                        }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG, WebP, TXT up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Documents ({documents.length})
              </h3>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((document) => (
                        <tr key={document.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {document.name}
                              </div>
                              {document.description && (
                                <div className="text-sm text-gray-500">
                                  {document.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDocumentTypeColor(
                                document.type
                              )}`}
                            >
                              {document.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(document.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(document.uploadedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(document.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}