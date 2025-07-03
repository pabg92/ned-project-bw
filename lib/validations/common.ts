import { z } from 'zod';

// Common validation patterns used across schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format');

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
  .optional();

export const currencySchema = z
  .string()
  .length(3, 'Currency must be 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters')
  .default('USD');

export const salarySchema = z
  .number()
  .min(0, 'Salary must be positive')
  .max(10000000, 'Salary must be less than 10 million')
  .optional();

export const dateSchema = z
  .string()
  .datetime('Invalid date format')
  .or(z.date())
  .transform((val) => new Date(val));

export const positiveIntegerSchema = z
  .number()
  .int('Must be an integer')
  .min(0, 'Must be positive');

export const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format')
  .default('#3B82F6');

// Pagination schemas
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, 'Page must be at least 1')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100')),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Base metadata schemas
export const timestampSchema = z.object({
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});

// Success response schema
export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  data: z.any().optional(),
});

// API response wrapper
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }).optional(),
  });

// File upload schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimetype: z.string().min(1, 'MIME type is required'),
  size: z.number().min(1, 'File size must be positive').max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  buffer: z.instanceof(Buffer).optional(),
  url: urlSchema.optional(),
});

// Common enum schemas
export const experienceLevelSchema = z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'], {
  errorMap: () => ({ message: 'Experience level must be one of: entry, junior, mid, senior, lead, executive' })
});

export const remotePreferenceSchema = z.enum(['remote', 'hybrid', 'onsite', 'flexible'], {
  errorMap: () => ({ message: 'Remote preference must be one of: remote, hybrid, onsite, flexible' })
});

export const availabilitySchema = z.enum(['immediately', '2weeks', '1month', '3months'], {
  errorMap: () => ({ message: 'Availability must be one of: immediately, 2weeks, 1month, 3months' })
});

export const proficiencySchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
  errorMap: () => ({ message: 'Proficiency must be one of: beginner, intermediate, advanced, expert' })
});

export const tagCategorySchema = z.enum(['skill', 'experience', 'industry', 'location'], {
  errorMap: () => ({ message: 'Tag category must be one of: skill, experience, industry, location' })
});

export const companySizeSchema = z.enum(['startup', 'small', 'medium', 'large', 'enterprise'], {
  errorMap: () => ({ message: 'Company size must be one of: startup, small, medium, large, enterprise' })
});

export const companyTierSchema = z.enum(['basic', 'premium', 'enterprise'], {
  errorMap: () => ({ message: 'Company tier must be one of: basic, premium, enterprise' })
});

export const subscriptionStatusSchema = z.enum(['trial', 'active', 'inactive'], {
  errorMap: () => ({ message: 'Subscription status must be one of: trial, active, inactive' })
});

// Utility types
export type EmailSchema = z.infer<typeof emailSchema>;
export type PasswordSchema = z.infer<typeof passwordSchema>;
export type UuidSchema = z.infer<typeof uuidSchema>;
export type PaginationSchema = z.infer<typeof paginationSchema>;
export type ErrorResponseSchema = z.infer<typeof errorResponseSchema>;
export type SuccessResponseSchema = z.infer<typeof successResponseSchema>;
export type FileUploadSchema = z.infer<typeof fileUploadSchema>;
export type ExperienceLevelSchema = z.infer<typeof experienceLevelSchema>;
export type RemotePreferenceSchema = z.infer<typeof remotePreferenceSchema>;
export type AvailabilitySchema = z.infer<typeof availabilitySchema>;
export type ProficiencySchema = z.infer<typeof proficiencySchema>;
export type TagCategorySchema = z.infer<typeof tagCategorySchema>;
export type CompanySizeSchema = z.infer<typeof companySizeSchema>;
export type CompanyTierSchema = z.infer<typeof companyTierSchema>;
export type SubscriptionStatusSchema = z.infer<typeof subscriptionStatusSchema>;