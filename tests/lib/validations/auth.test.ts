import { describe, it, expect } from '@jest/globals';
import {
  userRoleSchema,
  adminPermissionSchema,
  userSchema,
  userMetadataSchema,
  candidateMetadataSchema,
  adminMetadataSchema,
  companyMetadataSchema,
  authUserSchema,
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateUserProfileSchema,
  sessionSchema,
  jwtPayloadSchema,
  apiKeySchema,
  clerkWebhookSchema,
} from '../../../src/lib/validations/auth';

describe('Auth Validation Schemas', () => {
  describe('userRoleSchema', () => {
    it('should validate user roles', () => {
      const validRoles = ['candidate', 'company', 'admin'];
      
      validRoles.forEach(role => {
        expect(() => userRoleSchema.parse(role)).not.toThrow();
      });
    });

    it('should reject invalid roles', () => {
      const invalidRoles = ['user', 'manager', 'guest', ''];
      
      invalidRoles.forEach(role => {
        expect(() => userRoleSchema.parse(role)).toThrow();
      });
    });
  });

  describe('adminPermissionSchema', () => {
    it('should validate admin permissions', () => {
      const validPermissions = [
        'manage_candidates',
        'manage_companies',
        'manage_payments',
        'view_analytics',
        'manage_system',
        'export_data'
      ];
      
      validPermissions.forEach(permission => {
        expect(() => adminPermissionSchema.parse(permission)).not.toThrow();
      });
    });

    it('should reject invalid permissions', () => {
      const invalidPermissions = ['invalid_permission', 'admin', ''];
      
      invalidPermissions.forEach(permission => {
        expect(() => adminPermissionSchema.parse(permission)).toThrow();
      });
    });
  });

  describe('userSchema', () => {
    it('should validate complete user data', () => {
      const validUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/avatar.jpg',
        role: 'candidate',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        lastLogin: '2023-01-01T00:00:00Z',
      };

      expect(() => userSchema.parse(validUser)).not.toThrow();
    });

    it('should validate user with minimal required fields', () => {
      const minimalUser = {
        id: 'user_123',
        email: 'test@example.com',
        role: 'candidate',
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(() => userSchema.parse(minimalUser)).not.toThrow();
    });

    it('should reject user with invalid email', () => {
      const invalidUser = {
        id: 'user_123',
        email: 'invalid-email',
        role: 'candidate',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(() => userSchema.parse(invalidUser)).toThrow();
    });

    it('should reject user with missing required fields', () => {
      const incompleteUser = {
        email: 'test@example.com',
        role: 'candidate',
      };

      expect(() => userSchema.parse(incompleteUser)).toThrow();
    });
  });

  describe('userMetadataSchema', () => {
    describe('candidateMetadataSchema', () => {
      it('should validate candidate metadata', () => {
        const validMetadata = {
          role: 'candidate',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          profileCompleted: true,
          isAnonymized: false,
          skills: ['JavaScript', 'React'],
          experience: 'mid',
          location: 'New York',
        };

        expect(() => candidateMetadataSchema.parse(validMetadata)).not.toThrow();
      });

      it('should use default values for optional fields', () => {
        const metadata = {
          role: 'candidate',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        };

        const result = candidateMetadataSchema.parse(metadata);
        expect(result.profileCompleted).toBe(false);
        expect(result.isAnonymized).toBe(true);
      });
    });

    describe('adminMetadataSchema', () => {
      it('should validate admin metadata', () => {
        const validMetadata = {
          role: 'admin',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          permissions: ['manage_candidates', 'view_analytics'],
          department: 'Engineering',
        };

        expect(() => adminMetadataSchema.parse(validMetadata)).not.toThrow();
      });

      it('should require permissions for admin', () => {
        const invalidMetadata = {
          role: 'admin',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        };

        expect(() => adminMetadataSchema.parse(invalidMetadata)).toThrow();
      });
    });

    describe('companyMetadataSchema', () => {
      it('should validate company metadata', () => {
        const validMetadata = {
          role: 'company',
          companyId: '123e4567-e89b-12d3-a456-426614174000',
          companyName: 'Tech Corp',
          tier: 'premium',
          searchQuota: 100,
          searchesUsed: 25,
          subscriptionStatus: 'active',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        };

        expect(() => companyMetadataSchema.parse(validMetadata)).not.toThrow();
      });

      it('should require companyId for company metadata', () => {
        const invalidMetadata = {
          role: 'company',
          companyName: 'Tech Corp',
          tier: 'premium',
          searchQuota: 100,
          searchesUsed: 25,
          subscriptionStatus: 'active',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        };

        expect(() => companyMetadataSchema.parse(invalidMetadata)).toThrow();
      });
    });
  });

  describe('authUserSchema', () => {
    it('should validate auth user with candidate metadata', () => {
      const validAuthUser = {
        id: 'user_123',
        email: 'candidate@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        metadata: {
          role: 'candidate',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          profileCompleted: true,
          isAnonymized: false,
        },
      };

      expect(() => authUserSchema.parse(validAuthUser)).not.toThrow();
    });

    it('should validate auth user with company metadata', () => {
      const validAuthUser = {
        id: 'user_123',
        email: 'company@example.com',
        metadata: {
          role: 'company',
          companyId: '123e4567-e89b-12d3-a456-426614174000',
          companyName: 'Tech Corp',
          tier: 'premium',
          searchQuota: 100,
          searchesUsed: 25,
          subscriptionStatus: 'active',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      expect(() => authUserSchema.parse(validAuthUser)).not.toThrow();
    });
  });

  describe('authentication schemas', () => {
    describe('signInSchema', () => {
      it('should validate sign-in data', () => {
        const validSignIn = {
          email: 'user@example.com',
          password: 'Password123',
          rememberMe: true,
        };

        expect(() => signInSchema.parse(validSignIn)).not.toThrow();
      });

      it('should use default value for rememberMe', () => {
        const signIn = {
          email: 'user@example.com',
          password: 'Password123',
        };

        const result = signInSchema.parse(signIn);
        expect(result.rememberMe).toBe(false);
      });

      it('should reject invalid email', () => {
        const invalidSignIn = {
          email: 'invalid-email',
          password: 'Password123',
        };

        expect(() => signInSchema.parse(invalidSignIn)).toThrow();
      });
    });

    describe('signUpSchema', () => {
      it('should validate sign-up data for candidate', () => {
        const validSignUp = {
          email: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'candidate',
          acceptTerms: true,
        };

        expect(() => signUpSchema.parse(validSignUp)).not.toThrow();
      });

      it('should validate sign-up data for company with company name', () => {
        const validSignUp = {
          email: 'company@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'company',
          companyName: 'Tech Corp',
          acceptTerms: true,
        };

        expect(() => signUpSchema.parse(validSignUp)).not.toThrow();
      });

      it('should reject sign-up without accepting terms', () => {
        const invalidSignUp = {
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'candidate',
          acceptTerms: false,
        };

        expect(() => signUpSchema.parse(invalidSignUp)).toThrow();
      });
    });

    describe('resetPasswordSchema', () => {
      it('should validate password reset data', () => {
        const validReset = {
          token: 'reset-token-123',
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        };

        expect(() => resetPasswordSchema.parse(validReset)).not.toThrow();
      });

      it('should reject mismatched passwords', () => {
        const invalidReset = {
          token: 'reset-token-123',
          password: 'NewPassword123',
          confirmPassword: 'DifferentPassword123',
        };

        expect(() => resetPasswordSchema.parse(invalidReset)).toThrow();
      });
    });

    describe('changePasswordSchema', () => {
      it('should validate password change data', () => {
        const validChange = {
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        };

        expect(() => changePasswordSchema.parse(validChange)).not.toThrow();
      });

      it('should reject mismatched new passwords', () => {
        const invalidChange = {
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword123',
          confirmPassword: 'DifferentPassword123',
        };

        expect(() => changePasswordSchema.parse(invalidChange)).toThrow();
      });
    });
  });

  describe('sessionSchema', () => {
    it('should validate session data', () => {
      const validSession = {
        userId: 'user_123',
        sessionId: 'session_456',
        role: 'candidate',
        permissions: ['manage_candidates'],
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        expiresAt: '2023-12-31T23:59:59Z',
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => sessionSchema.parse(validSession)).not.toThrow();
    });

    it('should validate minimal session data', () => {
      const minimalSession = {
        userId: 'user_123',
        sessionId: 'session_456',
        role: 'candidate',
        expiresAt: '2023-12-31T23:59:59Z',
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => sessionSchema.parse(minimalSession)).not.toThrow();
    });
  });

  describe('jwtPayloadSchema', () => {
    it('should validate JWT payload', () => {
      const validPayload = {
        sub: 'user_123',
        email: 'user@example.com',
        role: 'candidate',
        permissions: ['manage_candidates'],
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        iat: 1672531200,
        exp: 1672617600,
      };

      expect(() => jwtPayloadSchema.parse(validPayload)).not.toThrow();
    });

    it('should validate minimal JWT payload', () => {
      const minimalPayload = {
        sub: 'user_123',
        email: 'user@example.com',
        role: 'candidate',
        iat: 1672531200,
        exp: 1672617600,
      };

      expect(() => jwtPayloadSchema.parse(minimalPayload)).not.toThrow();
    });
  });

  describe('apiKeySchema', () => {
    it('should validate API key data', () => {
      const validApiKey = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Integration API Key',
        key: 'sk_test_123456789012345678901234567890',
        permissions: ['manage_candidates', 'view_analytics'],
        isActive: true,
        expiresAt: '2024-12-31T23:59:59Z',
        lastUsed: '2023-06-01T12:00:00Z',
        createdBy: 'admin_123',
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => apiKeySchema.parse(validApiKey)).not.toThrow();
    });

    it('should reject API key with short key', () => {
      const invalidApiKey = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Short Key',
        key: 'short_key',
        permissions: ['manage_candidates'],
        createdBy: 'admin_123',
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => apiKeySchema.parse(invalidApiKey)).toThrow();
    });
  });

  describe('clerkWebhookSchema', () => {
    it('should validate Clerk webhook events', () => {
      const validWebhook = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'user@example.com' }],
        },
        object: 'event',
        timestamp: 1672531200,
      };

      expect(() => clerkWebhookSchema.parse(validWebhook)).not.toThrow();
    });

    it('should validate different webhook event types', () => {
      const eventTypes = [
        'user.created',
        'user.updated',
        'user.deleted',
        'session.created',
        'session.ended',
        'session.removed',
        'session.revoked'
      ];

      eventTypes.forEach(type => {
        const webhook = {
          type,
          data: { id: 'test_123' },
          object: 'event',
          timestamp: 1672531200,
        };

        expect(() => clerkWebhookSchema.parse(webhook)).not.toThrow();
      });
    });

    it('should reject invalid webhook event types', () => {
      const invalidWebhook = {
        type: 'invalid.event',
        data: { id: 'test_123' },
        object: 'event',
        timestamp: 1672531200,
      };

      expect(() => clerkWebhookSchema.parse(invalidWebhook)).toThrow();
    });
  });
});