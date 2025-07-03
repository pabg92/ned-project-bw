import { jest } from '@jest/globals';
import { 
  getCurrentUser, 
  getCurrentUserRole, 
  requireAuth, 
  requireRole, 
  requireAdmin, 
  requireCompany, 
  requireCandidate,
  hasPermission,
  requirePermission,
  isAuthenticated,
  getUserId,
  updateUserMetadata
} from '../../../src/lib/auth/utils';
import { UserRole, AdminPermission } from '../../../src/lib/types/auth';

// Mock Clerk functions
const mockAuth = jest.fn();
const mockCurrentUser = jest.fn();
const mockClerkClient = {
  users: {
    getUser: jest.fn(),
    updateUserMetadata: jest.fn(),
  },
};

jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

jest.mock('@clerk/backend', () => ({
  clerkClient: mockClerkClient,
}));

describe('Authentication Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
        unsafeMetadata: {
          role: 'candidate',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(result).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
        metadata: {
          role: 'candidate',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
      });
    });

    it('should return null when not authenticated', async () => {
      mockCurrentUser.mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return default metadata when user has no metadata', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: null,
        lastName: null,
        imageUrl: null,
        unsafeMetadata: null,
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(result?.metadata).toEqual({
        role: 'candidate',
        isActive: true,
        createdAt: expect.any(String),
      });
    });

    it('should handle errors gracefully', async () => {
      mockCurrentUser.mockRejectedValue(new Error('API Error'));

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('getCurrentUserRole', () => {
    it('should return user role when authenticated', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        unsafeMetadata: { role: 'admin' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await getCurrentUserRole();

      expect(result).toBe('admin');
    });

    it('should return null when not authenticated', async () => {
      mockCurrentUser.mockResolvedValue(null);

      const result = await getCurrentUserRole();

      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        unsafeMetadata: { role: 'candidate' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await requireAuth();

      expect(result.id).toBe('user_123');
    });

    it('should throw error when not authenticated', async () => {
      mockCurrentUser.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });
  });

  describe('requireRole', () => {
    it('should return user when role is allowed', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        unsafeMetadata: { role: 'admin' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await requireRole(['admin', 'company']);

      expect(result.id).toBe('user_123');
    });

    it('should throw error when role is not allowed', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        unsafeMetadata: { role: 'candidate' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      await expect(requireRole(['admin', 'company'])).rejects.toThrow(
        'Access denied. Required roles: admin, company'
      );
    });
  });

  describe('Role-specific require functions', () => {
    it('requireAdmin should accept admin role', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'admin@example.com' }],
        unsafeMetadata: { role: 'admin' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await requireAdmin();

      expect(result.id).toBe('user_123');
    });

    it('requireCompany should accept company role', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'company@example.com' }],
        unsafeMetadata: { role: 'company' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await requireCompany();

      expect(result.id).toBe('user_123');
    });

    it('requireCandidate should accept candidate role', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'candidate@example.com' }],
        unsafeMetadata: { role: 'candidate' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await requireCandidate();

      expect(result.id).toBe('user_123');
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      expect(hasPermission('admin', 'manage_candidates')).toBe(true);
      expect(hasPermission('admin', 'view_analytics')).toBe(true);
    });

    it('should return false for non-admin roles', () => {
      expect(hasPermission('candidate', 'manage_candidates')).toBe(false);
      expect(hasPermission('company', 'view_analytics')).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('should return user when permission is granted', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'admin@example.com' }],
        unsafeMetadata: { role: 'admin' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await requirePermission('manage_candidates');

      expect(result.id).toBe('user_123');
    });

    it('should throw error when permission is denied', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'candidate@example.com' }],
        unsafeMetadata: { role: 'candidate' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      await expect(requirePermission('manage_candidates')).rejects.toThrow(
        'Access denied. Required permission: manage_candidates'
      );
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user exists', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        unsafeMetadata: { role: 'candidate' },
      };

      mockCurrentUser.mockResolvedValue(mockUser);

      const result = await isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockCurrentUser.mockResolvedValue(null);

      const result = await isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('should return user ID when authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const result = await getUserId();

      expect(result).toBe('user_123');
    });

    it('should return null when not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const result = await getUserId();

      expect(result).toBeNull();
    });
  });

  describe('updateUserMetadata', () => {
    it('should update user metadata successfully', async () => {
      const mockUser = {
        id: 'user_123',
        unsafeMetadata: { role: 'candidate', isActive: true },
      };

      mockClerkClient.users.getUser.mockResolvedValue(mockUser);
      mockClerkClient.users.updateUserMetadata.mockResolvedValue({});

      const newMetadata = { isActive: false };

      await updateUserMetadata('user_123', newMetadata);

      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        'user_123',
        {
          unsafeMetadata: {
            role: 'candidate',
            isActive: false,
          },
        }
      );
    });

    it('should handle errors when updating metadata', async () => {
      mockClerkClient.users.getUser.mockRejectedValue(new Error('User not found'));

      await expect(updateUserMetadata('user_123', {})).rejects.toThrow();
    });
  });
});