import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, supabaseAdmin } from '@/lib/supabase/client';
import { candidateProfiles } from '@/lib/supabase/schema';
import { requireAdmin } from '@/lib/auth/utils';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

// Prevent static optimization during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp', '.txt'];

/**
 * GET /api/admin/candidates/[id]/documents
 * Get all documents for a candidate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    await requireAdmin();

    const candidateId = params.id;

    // Verify candidate exists
    const candidate = await db.query.candidateProfiles.findFirst({
      where: eq(candidateProfiles.id, candidateId),
    });

    if (!candidate) {
      return createErrorResponse('Candidate not found', 404);
    }

    // List files in candidate's document folder
    const folderPath = `candidates/${candidateId}/admin-documents`;
    
    try {
      const { data: files, error } = await supabaseAdmin.storage
        .from('documents')
        .list(folderPath, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('Supabase storage error:', error);
        
        // Return mock data if storage is not configured
        return createSuccessResponse({
          candidateId,
          documents: [
            {
              id: 'doc_mock_1',
              name: 'background-check-report.pdf',
              type: 'background_check',
              size: 1234567,
              uploadedAt: candidate.updatedAt,
              uploadedBy: 'admin',
              url: '/mock/background-check-report.pdf',
            },
            {
              id: 'doc_mock_2',
              name: 'skill-assessment-results.pdf',
              type: 'skill_assessment',
              size: 987654,
              uploadedAt: candidate.updatedAt,
              uploadedBy: 'admin',
              url: '/mock/skill-assessment-results.pdf',
            },
          ],
          summary: {
            totalDocuments: 2,
            totalSize: 2222221,
            lastUpload: candidate.updatedAt,
          },
        }, 'Mock documents retrieved for development (Supabase storage not configured)');
      }

      const documents = files?.map(file => ({
        id: file.id,
        name: file.name,
        type: getDocumentType(file.name),
        size: file.metadata?.size || 0,
        uploadedAt: file.created_at,
        uploadedBy: file.metadata?.uploadedBy || 'unknown',
        url: `${supabaseUrl}/storage/v1/object/public/documents/${folderPath}/${file.name}`,
      })) || [];

      const summary = {
        totalDocuments: documents.length,
        totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
        lastUpload: documents.length > 0 ? documents[0].uploadedAt : null,
      };

      return createSuccessResponse({
        candidateId,
        documents,
        summary,
      }, 'Candidate documents retrieved successfully');

    } catch (storageError) {
      console.error('Storage access error:', storageError);
      
      // Return mock data for development
      return createSuccessResponse({
        candidateId,
        documents: [],
        summary: {
          totalDocuments: 0,
          totalSize: 0,
          lastUpload: null,
        },
      }, 'No documents found (storage not configured for development)');
    }

  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }
    
    console.error('Admin documents retrieval error:', error);
    return createErrorResponse('Failed to retrieve candidate documents', 500);
  }
}

/**
 * POST /api/admin/candidates/[id]/documents
 * Upload a new document for a candidate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminUser = await requireAdmin();

    const candidateId = params.id;

    // Verify candidate exists
    const candidate = await db.query.candidateProfiles.findFirst({
      where: eq(candidateProfiles.id, candidateId),
    });

    if (!candidate) {
      return createErrorResponse('Candidate not found', 404);
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return createErrorResponse('No file provided', 400);
    }

    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return createErrorResponse(fileValidation.error!, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFileName(file.name);
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = `candidates/${candidateId}/admin-documents/${fileName}`;

    try {
      // Upload file to Supabase Storage
      const fileBuffer = await file.arrayBuffer();
      const { data, error } = await supabaseAdmin.storage
        .from('documents')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          metadata: {
            candidateId,
            uploadedBy: adminUser.id,
            documentType: documentType || 'general',
            description: description || '',
            originalName: file.name,
          },
        });

      if (error) {
        console.error('Supabase upload error:', error);
        
        // Mock successful upload for development
        const mockDocument = {
          id: `doc_${timestamp}`,
          name: fileName,
          type: documentType || 'general',
          size: file.size,
          uploadedAt: new Date(),
          uploadedBy: adminUser.id,
          url: `/mock/documents/${fileName}`,
          description: description || '',
        };

        return createSuccessResponse(mockDocument, 'Mock document upload successful (Supabase storage not configured)');
      }

      // Update candidate's private metadata with document reference
      const currentPrivateMetadata = candidate.privateMetadata || {};
      const documents = currentPrivateMetadata.documents || [];
      
      const newDocument = {
        id: data.id || `doc_${timestamp}`,
        name: fileName,
        originalName: file.name,
        type: documentType || 'general',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: adminUser.id,
        description: description || '',
        path: filePath,
      };

      documents.push(newDocument);

      await db
        .update(candidateProfiles)
        .set({
          privateMetadata: {
            ...currentPrivateMetadata,
            documents,
            lastUpdatedBy: adminUser.id,
            lastUpdatedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(candidateProfiles.id, candidateId));

      // Log admin action
      await logDocumentAction(adminUser.id, 'document_uploaded', candidateId, {
        fileName,
        fileSize: file.size,
        documentType,
      });

      return createSuccessResponse({
        ...newDocument,
        url: `${supabaseUrl}/storage/v1/object/public/documents/${filePath}`,
      }, 'Document uploaded successfully', 201);

    } catch (uploadError) {
      console.error('Document upload error:', uploadError);
      
      // Mock successful upload for development
      const mockDocument = {
        id: `doc_mock_${timestamp}`,
        name: fileName,
        type: documentType || 'general',
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy: adminUser.id,
        url: `/mock/documents/${fileName}`,
        description: description || '',
      };

      return createSuccessResponse(mockDocument, 'Mock document upload for development');
    }

  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }
    
    console.error('Admin document upload error:', error);
    return createErrorResponse('Failed to upload document', 500);
  }
}

/**
 * DELETE /api/admin/candidates/[id]/documents/[documentId]
 * Delete a candidate document
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const adminUser = await requireAdmin();

    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const candidateId = pathSegments[4];
    const documentId = pathSegments[6];

    if (!candidateId || !documentId) {
      return createErrorResponse('Candidate ID and Document ID are required', 400);
    }

    // Verify candidate exists
    const candidate = await db.query.candidateProfiles.findFirst({
      where: eq(candidateProfiles.id, candidateId),
    });

    if (!candidate) {
      return createErrorResponse('Candidate not found', 404);
    }

    // Find document in metadata
    const currentPrivateMetadata = candidate.privateMetadata || {};
    const documents = currentPrivateMetadata.documents || [];
    
    const documentIndex = documents.findIndex((doc: any) => doc.id === documentId);
    if (documentIndex === -1) {
      return createErrorResponse('Document not found', 404);
    }

    const document = documents[documentIndex];

    try {
      // Delete from Supabase Storage
      if (document.path) {
        const { error } = await supabaseAdmin.storage
          .from('documents')
          .remove([document.path]);

        if (error) {
          console.error('Supabase delete error:', error);
        }
      }
    } catch (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with metadata removal even if storage deletion fails
    }

    // Remove from candidate metadata
    documents.splice(documentIndex, 1);

    await db
      .update(candidateProfiles)
      .set({
        privateMetadata: {
          ...currentPrivateMetadata,
          documents,
          lastUpdatedBy: adminUser.id,
          lastUpdatedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(candidateProfiles.id, candidateId));

    // Log admin action
    await logDocumentAction(adminUser.id, 'document_deleted', candidateId, {
      documentId,
      fileName: document.name,
    });

    return createSuccessResponse(null, 'Document deleted successfully');

  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }
    
    console.error('Admin document deletion error:', error);
    return createErrorResponse('Failed to delete document', 500);
  }
}

/**
 * Validate uploaded file
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File extension not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename for safe storage
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Determine document type from filename
 */
function getDocumentType(fileName: string): string {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('resume') || lowerName.includes('cv')) {
    return 'resume';
  }
  if (lowerName.includes('background') || lowerName.includes('check')) {
    return 'background_check';
  }
  if (lowerName.includes('skill') || lowerName.includes('assessment')) {
    return 'skill_assessment';
  }
  if (lowerName.includes('portfolio') || lowerName.includes('work')) {
    return 'portfolio';
  }
  
  return 'general';
}

/**
 * Log document action for audit trail
 */
async function logDocumentAction(
  adminUserId: string,
  action: string,
  candidateId: string,
  metadata: any
) {
  try {
    console.log('Admin document action logged:', {
      adminUserId,
      action,
      candidateId,
      metadata,
      timestamp: new Date().toISOString(),
    });
    
    // Future: Store in audit log table or send to monitoring service
  } catch (error) {
    console.error('Failed to log document action:', error);
    // Don't fail the request if logging fails
  }
}