import { z } from 'zod';
import { emailSchema, uuidSchema, dateSchema } from './common';

// User role schema
export const userRoleSchema = z.enum(['candidate', 'company', 'admin'], {
  errorMap: () => ({ message: 'User role must be one of: candidate, company, admin' })
});

// Admin permissions schema
export const adminPermissionSchema = z.enum([
  'manage_candidates',
  'manage_companies', 
  'manage_payments',
  'view_analytics',
  'manage_system',
  'export_data'
], {
  errorMap: () => ({ message: 'Invalid admin permission' })
});

// Base user schema
export const userSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  role: userRoleSchema,
  isActive: z.boolean().default(true),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  lastLogin: dateSchema.optional(),
});

// User metadata schemas
export const baseUserMetadataSchema = z.object({
  role: userRoleSchema,
  companyId: uuidSchema.optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  lastLogin: z.string().datetime().optional(),
});

export const candidateMetadataSchema = baseUserMetadataSchema.extend({
  role: z.literal('candidate'),
  profileCompleted: z.boolean().default(false),
  isAnonymized: z.boolean().default(true),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  location: z.string().optional(),
});

export const adminMetadataSchema = baseUserMetadataSchema.extend({
  role: z.literal('admin'),
  permissions: z.array(adminPermissionSchema),
  department: z.string().optional(),
});

export const companyMetadataSchema = baseUserMetadataSchema.extend({
  role: z.literal('company'),
  companyId: uuidSchema,
  companyName: z.string().min(1, 'Company name is required'),
  tier: z.enum(['basic', 'premium', 'enterprise']),
  searchQuota: z.number().min(0, 'Search quota must be positive'),
  searchesUsed: z.number().min(0, 'Searches used must be positive'),
  subscriptionStatus: z.enum(['active', 'inactive', 'trial']),
});

// Discriminated union for user metadata
export const userMetadataSchema = z.discriminatedUnion('role', [
  candidateMetadataSchema,
  adminMetadataSchema,
  companyMetadataSchema,
]);

// Auth user schema with metadata
export const authUserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: emailSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageUrl: z.string().url().optional(),
  metadata: userMetadataSchema,
});

// Authentication request schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export const signUpSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  role: userRoleSchema,
  companyName: z.string().min(1, 'Company name is required').optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Update profile schemas
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

// Role-based access control schemas
export const requireRoleSchema = z.object({
  allowedRoles: z.array(userRoleSchema),
  userRole: userRoleSchema,
}).refine(data => data.allowedRoles.includes(data.userRole), {
  message: 'Insufficient permissions',
});

export const requirePermissionSchema = z.object({
  requiredPermissions: z.array(adminPermissionSchema),
  userPermissions: z.array(adminPermissionSchema),
}).refine(data => data.requiredPermissions.every(perm => data.userPermissions.includes(perm)), {
  message: 'Missing required permissions',
});

// Session schemas
export const sessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  role: userRoleSchema,
  permissions: z.array(adminPermissionSchema).optional(),
  companyId: uuidSchema.optional(),
  expiresAt: dateSchema,
  createdAt: dateSchema,
});

// JWT payload schema
export const jwtPayloadSchema = z.object({
  sub: z.string().min(1, 'Subject is required'), // User ID
  email: emailSchema,
  role: userRoleSchema,
  permissions: z.array(adminPermissionSchema).optional(),
  companyId: uuidSchema.optional(),
  iat: z.number().min(0, 'Issued at must be positive'),
  exp: z.number().min(0, 'Expiration must be positive'),
});

// API key schema for admin/system access
export const apiKeySchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, 'API key name is required').max(100, 'Name must be less than 100 characters'),
  key: z.string().min(32, 'API key must be at least 32 characters'),
  permissions: z.array(adminPermissionSchema),
  isActive: z.boolean().default(true),
  expiresAt: dateSchema.optional(),
  lastUsed: dateSchema.optional(),
  createdBy: z.string().min(1, 'Creator ID is required'),
  createdAt: dateSchema,
});

// Webhook validation schemas
export const webhookEventSchema = z.object({
  type: z.string().min(1, 'Event type is required'),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
  id: z.string().min(1, 'Event ID is required'),
});

export const clerkWebhookSchema = z.object({
  type: z.enum([
    'user.created',
    'user.updated',
    'user.deleted',
    'session.created',
    'session.ended',
    'session.removed',
    'session.revoked'
  ]),
  data: z.record(z.any()),
  object: z.literal('event'),
  timestamp: z.number(),
});

// Type exports
export type UserRoleSchema = z.infer<typeof userRoleSchema>;
export type AdminPermissionSchema = z.infer<typeof adminPermissionSchema>;
export type UserSchema = z.infer<typeof userSchema>;
export type UserMetadataSchema = z.infer<typeof userMetadataSchema>;
export type CandidateMetadataSchema = z.infer<typeof candidateMetadataSchema>;
export type AdminMetadataSchema = z.infer<typeof adminMetadataSchema>;
export type CompanyMetadataSchema = z.infer<typeof companyMetadataSchema>;
export type AuthUserSchema = z.infer<typeof authUserSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type UpdateUserProfileSchema = z.infer<typeof updateUserProfileSchema>;
export type SessionSchema = z.infer<typeof sessionSchema>;
export type JwtPayloadSchema = z.infer<typeof jwtPayloadSchema>;
export type ApiKeySchema = z.infer<typeof apiKeySchema>;
export type WebhookEventSchema = z.infer<typeof webhookEventSchema>;
export type ClerkWebhookSchema = z.infer<typeof clerkWebhookSchema>;