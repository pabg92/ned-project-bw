import { supabaseAdmin } from './client';

// Storage bucket configurations
export const STORAGE_BUCKETS = {
  RESUMES: 'resumes',
  PROFILE_IMAGES: 'profile-images',
  COMPANY_LOGOS: 'company-logos',
  DOCUMENTS: 'documents',
} as const;

// File upload limits and types
export const UPLOAD_LIMITS = {
  RESUME: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
  },
  IMAGE: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
  },
} as const;

// Storage bucket policies for different user roles
export const STORAGE_POLICIES = {
  // Candidates can upload/read their own resumes and profile images
  CANDIDATE_RESUMES: `
    CREATE POLICY "Candidates can upload resumes" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'resumes' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
    
    CREATE POLICY "Candidates can read own resumes" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'resumes' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
    
    CREATE POLICY "Candidates can update own resumes" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'resumes' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
    
    CREATE POLICY "Candidates can delete own resumes" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'resumes' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  `,
  
  CANDIDATE_IMAGES: `
    CREATE POLICY "Candidates can upload profile images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'profile-images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
    
    CREATE POLICY "Users can read profile images" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');
    
    CREATE POLICY "Candidates can update own profile images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'profile-images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
    
    CREATE POLICY "Candidates can delete own profile images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'profile-images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  `,
  
  COMPANY_LOGOS: `
    CREATE POLICY "Company users can upload logos" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'company-logos' AND
      EXISTS (
        SELECT 1 FROM company_users cu
        WHERE cu.user_id = auth.uid()::text
        AND cu.company_id::text = (storage.foldername(name))[1]
        AND cu.role IN ('owner', 'admin')
      )
    );
    
    CREATE POLICY "Users can read company logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'company-logos');
    
    CREATE POLICY "Company users can update logos" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'company-logos' AND
      EXISTS (
        SELECT 1 FROM company_users cu
        WHERE cu.user_id = auth.uid()::text
        AND cu.company_id::text = (storage.foldername(name))[1]
        AND cu.role IN ('owner', 'admin')
      )
    );
    
    CREATE POLICY "Company users can delete logos" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'company-logos' AND
      EXISTS (
        SELECT 1 FROM company_users cu
        WHERE cu.user_id = auth.uid()::text
        AND cu.company_id::text = (storage.foldername(name))[1]
        AND cu.role IN ('owner', 'admin')
      )
    );
  `,
  
  ADMIN_DOCUMENTS: `
    CREATE POLICY "Admins can manage all documents" ON storage.objects
    FOR ALL USING (
      bucket_id = 'documents' AND
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()::text
        AND u.role = 'admin'
      )
    );
  `,
};

// Initialize storage buckets
export async function createStorageBuckets() {
  const buckets = Object.values(STORAGE_BUCKETS);
  
  for (const bucketName of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBucket } = await supabaseAdmin.storage.getBucket(bucketName);
      
      if (!existingBucket) {
        // Create bucket
        const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: bucketName === STORAGE_BUCKETS.PROFILE_IMAGES || bucketName === STORAGE_BUCKETS.COMPANY_LOGOS,
          allowedMimeTypes: getBucketAllowedTypes(bucketName),
          fileSizeLimit: getBucketSizeLimit(bucketName),
        });
        
        if (error) {
          console.error(`Error creating bucket ${bucketName}:`, error);
        } else {
          console.log(`Created storage bucket: ${bucketName}`);
        }
      }
    } catch (error) {
      console.error(`Error with bucket ${bucketName}:`, error);
    }
  }
}

// Helper functions
function getBucketAllowedTypes(bucketName: string): string[] {
  switch (bucketName) {
    case STORAGE_BUCKETS.RESUMES:
    case STORAGE_BUCKETS.DOCUMENTS:
      return UPLOAD_LIMITS.DOCUMENT.allowedTypes;
    case STORAGE_BUCKETS.PROFILE_IMAGES:
    case STORAGE_BUCKETS.COMPANY_LOGOS:
      return UPLOAD_LIMITS.IMAGE.allowedTypes;
    default:
      return [];
  }
}

function getBucketSizeLimit(bucketName: string): number {
  switch (bucketName) {
    case STORAGE_BUCKETS.RESUMES:
      return UPLOAD_LIMITS.RESUME.maxSize;
    case STORAGE_BUCKETS.PROFILE_IMAGES:
    case STORAGE_BUCKETS.COMPANY_LOGOS:
      return UPLOAD_LIMITS.IMAGE.maxSize;
    case STORAGE_BUCKETS.DOCUMENTS:
      return UPLOAD_LIMITS.DOCUMENT.maxSize;
    default:
      return 5 * 1024 * 1024; // 5MB default
  }
}

// File upload utilities
export function generateFileName(userId: string, originalName: string, bucket: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${userId}/${timestamp}.${extension}`;
}

export function getFileUrl(bucket: string, fileName: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

export function validateFile(file: File, type: keyof typeof UPLOAD_LIMITS): { valid: boolean; error?: string } {
  const limits = UPLOAD_LIMITS[type];
  
  // Check file size
  if (file.size > limits.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${limits.maxSize / (1024 * 1024)}MB limit`,
    };
  }
  
  // Check file type
  if (!limits.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${limits.extensions.join(', ')}`,
    };
  }
  
  return { valid: true };
}

// Upload file to storage
export async function uploadFile(
  bucket: string,
  fileName: string,
  file: File | Buffer,
  options?: { contentType?: string; cacheControl?: string }
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: options?.contentType,
      cacheControl: options?.cacheControl || '3600',
      upsert: true,
    });
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  return data;
}

// Delete file from storage
export async function deleteFile(bucket: string, fileName: string) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([fileName]);
  
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
  
  return true;
}

// Get signed URL for private files
export async function getSignedUrl(bucket: string, fileName: string, expiresIn = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(fileName, expiresIn);
  
  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }
  
  return data.signedUrl;
}