import { jest } from '@jest/globals';
import {
  STORAGE_BUCKETS,
  UPLOAD_LIMITS,
  validateFile,
  generateFileName,
  getFileUrl,
  uploadFile,
  deleteFile,
  getSignedUrl,
  createStorageBuckets,
} from '../../../src/lib/supabase/storage';

// Mock Supabase admin client
const mockStorageOperations = {
  getBucket: jest.fn(),
  createBucket: jest.fn(),
  upload: jest.fn(),
  remove: jest.fn(),
  createSignedUrl: jest.fn(),
  getPublicUrl: jest.fn(),
};

const mockSupabaseAdmin = {
  storage: {
    from: jest.fn(() => mockStorageOperations),
    getBucket: jest.fn(),
    createBucket: jest.fn(),
  },
};

jest.mock('../../../src/lib/supabase/client', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

describe('Storage Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Storage Constants', () => {
    it('should have correct bucket names', () => {
      expect(STORAGE_BUCKETS.RESUMES).toBe('resumes');
      expect(STORAGE_BUCKETS.PROFILE_IMAGES).toBe('profile-images');
      expect(STORAGE_BUCKETS.COMPANY_LOGOS).toBe('company-logos');
      expect(STORAGE_BUCKETS.DOCUMENTS).toBe('documents');
    });

    it('should have correct upload limits', () => {
      expect(UPLOAD_LIMITS.RESUME.maxSize).toBe(5 * 1024 * 1024);
      expect(UPLOAD_LIMITS.IMAGE.maxSize).toBe(2 * 1024 * 1024);
      expect(UPLOAD_LIMITS.DOCUMENT.maxSize).toBe(10 * 1024 * 1024);
    });
  });

  describe('validateFile', () => {
    it('should validate file size correctly', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });

      const result = validateFile(largeFile, 'RESUME');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });

    it('should validate file type correctly', () => {
      const invalidFile = new File(['content'], 'file.txt', {
        type: 'text/plain',
      });

      const result = validateFile(invalidFile, 'RESUME');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('File type not allowed');
    });

    it('should accept valid files', () => {
      const validFile = new File(['content'], 'resume.pdf', {
        type: 'application/pdf',
      });

      const result = validateFile(validFile, 'RESUME');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate image files correctly', () => {
      const validImage = new File(['content'], 'avatar.jpg', {
        type: 'image/jpeg',
      });

      const result = validateFile(validImage, 'IMAGE');

      expect(result.valid).toBe(true);
    });

    it('should reject oversized images', () => {
      const largeImage = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const result = validateFile(largeImage, 'IMAGE');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds 2MB');
    });
  });

  describe('generateFileName', () => {
    it('should generate filename with user ID and timestamp', () => {
      const userId = 'user_123';
      const originalName = 'resume.pdf';
      const bucket = 'resumes';

      const fileName = generateFileName(userId, originalName, bucket);

      expect(fileName).toMatch(/^user_123\/\d+\.pdf$/);
    });

    it('should preserve file extension', () => {
      const fileName = generateFileName('user_123', 'document.docx', 'documents');

      expect(fileName).toMatch(/\.docx$/);
    });
  });

  describe('getFileUrl', () => {
    it('should return public URL for file', () => {
      const mockUrl = 'https://storage.supabase.co/bucket/file.pdf';
      mockStorageOperations.getPublicUrl.mockReturnValue({
        data: { publicUrl: mockUrl },
      });

      const url = getFileUrl('resumes', 'user_123/resume.pdf');

      expect(mockSupabaseAdmin.storage.from).toHaveBeenCalledWith('resumes');
      expect(mockStorageOperations.getPublicUrl).toHaveBeenCalledWith('user_123/resume.pdf');
      expect(url).toBe(mockUrl);
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockData = { path: 'user_123/file.pdf' };
      mockStorageOperations.upload.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const file = new File(['content'], 'file.pdf');
      const result = await uploadFile('resumes', 'user_123/file.pdf', file);

      expect(mockSupabaseAdmin.storage.from).toHaveBeenCalledWith('resumes');
      expect(mockStorageOperations.upload).toHaveBeenCalledWith(
        'user_123/file.pdf',
        file,
        {
          contentType: undefined,
          cacheControl: '3600',
          upsert: true,
        }
      );
      expect(result).toBe(mockData);
    });

    it('should handle upload errors', async () => {
      mockStorageOperations.upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });

      const file = new File(['content'], 'file.pdf');

      await expect(uploadFile('resumes', 'user_123/file.pdf', file)).rejects.toThrow(
        'Upload failed: Upload failed'
      );
    });

    it('should use custom options when provided', async () => {
      mockStorageOperations.upload.mockResolvedValue({
        data: { path: 'file.pdf' },
        error: null,
      });

      const file = new File(['content'], 'file.pdf');
      await uploadFile('resumes', 'file.pdf', file, {
        contentType: 'application/pdf',
        cacheControl: '7200',
      });

      expect(mockStorageOperations.upload).toHaveBeenCalledWith(
        'file.pdf',
        file,
        {
          contentType: 'application/pdf',
          cacheControl: '7200',
          upsert: true,
        }
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockStorageOperations.remove.mockResolvedValue({
        error: null,
      });

      const result = await deleteFile('resumes', 'user_123/file.pdf');

      expect(mockSupabaseAdmin.storage.from).toHaveBeenCalledWith('resumes');
      expect(mockStorageOperations.remove).toHaveBeenCalledWith(['user_123/file.pdf']);
      expect(result).toBe(true);
    });

    it('should handle delete errors', async () => {
      mockStorageOperations.remove.mockResolvedValue({
        error: { message: 'Delete failed' },
      });

      await expect(deleteFile('resumes', 'user_123/file.pdf')).rejects.toThrow(
        'Delete failed: Delete failed'
      );
    });
  });

  describe('getSignedUrl', () => {
    it('should create signed URL successfully', async () => {
      const mockSignedUrl = 'https://storage.supabase.co/signed-url';
      mockStorageOperations.createSignedUrl.mockResolvedValue({
        data: { signedUrl: mockSignedUrl },
        error: null,
      });

      const result = await getSignedUrl('resumes', 'user_123/file.pdf', 7200);

      expect(mockSupabaseAdmin.storage.from).toHaveBeenCalledWith('resumes');
      expect(mockStorageOperations.createSignedUrl).toHaveBeenCalledWith(
        'user_123/file.pdf',
        7200
      );
      expect(result).toBe(mockSignedUrl);
    });

    it('should use default expiration time', async () => {
      mockStorageOperations.createSignedUrl.mockResolvedValue({
        data: { signedUrl: 'signed-url' },
        error: null,
      });

      await getSignedUrl('resumes', 'user_123/file.pdf');

      expect(mockStorageOperations.createSignedUrl).toHaveBeenCalledWith(
        'user_123/file.pdf',
        3600
      );
    });

    it('should handle signed URL creation errors', async () => {
      mockStorageOperations.createSignedUrl.mockResolvedValue({
        data: null,
        error: { message: 'Signed URL failed' },
      });

      await expect(getSignedUrl('resumes', 'user_123/file.pdf')).rejects.toThrow(
        'Failed to create signed URL: Signed URL failed'
      );
    });
  });

  describe('createStorageBuckets', () => {
    it('should create all storage buckets', async () => {
      // Mock bucket doesn't exist
      mockSupabaseAdmin.storage.getBucket.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      });

      // Mock successful bucket creation
      mockSupabaseAdmin.storage.createBucket.mockResolvedValue({
        data: { name: 'test-bucket' },
        error: null,
      });

      await createStorageBuckets();

      expect(mockSupabaseAdmin.storage.createBucket).toHaveBeenCalledTimes(4);
      expect(mockSupabaseAdmin.storage.createBucket).toHaveBeenCalledWith('resumes', {
        public: false,
        allowedMimeTypes: expect.any(Array),
        fileSizeLimit: expect.any(Number),
      });
      expect(mockSupabaseAdmin.storage.createBucket).toHaveBeenCalledWith('profile-images', {
        public: true,
        allowedMimeTypes: expect.any(Array),
        fileSizeLimit: expect.any(Number),
      });
    });

    it('should skip creating existing buckets', async () => {
      // Mock bucket exists
      mockSupabaseAdmin.storage.getBucket.mockResolvedValue({
        data: { name: 'existing-bucket' },
        error: null,
      });

      await createStorageBuckets();

      expect(mockSupabaseAdmin.storage.createBucket).not.toHaveBeenCalled();
    });

    it('should handle bucket creation errors gracefully', async () => {
      mockSupabaseAdmin.storage.getBucket.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      });

      mockSupabaseAdmin.storage.createBucket.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' },
      });

      // Should not throw error
      await expect(createStorageBuckets()).resolves.not.toThrow();
    });
  });
});