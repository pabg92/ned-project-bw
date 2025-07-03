import { z } from 'zod';
import { 
  uuidSchema, 
  dateSchema, 
  urlSchema, 
  positiveIntegerSchema,
  companySizeSchema,
  companyTierSchema,
  subscriptionStatusSchema,
  currencySchema
} from './common';

// Company schema
export const companySchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  website: urlSchema,
  logo: urlSchema,
  size: companySizeSchema.optional(),
  industry: z.string().max(100, 'Industry must be less than 100 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  tier: companyTierSchema,
  searchQuota: positiveIntegerSchema,
  searchesUsed: positiveIntegerSchema,
  subscriptionStatus: subscriptionStatusSchema,
  stripeCustomerId: z.string().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Create company schema
export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  website: urlSchema,
  logo: urlSchema,
  size: companySizeSchema,
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry must be less than 100 characters'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
  tier: companyTierSchema.default('basic'),
});

// Update company schema
export const updateCompanySchema = createCompanySchema.partial();

// Company user relationship schema
export const companyUserSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1, 'User ID is required'),
  companyId: uuidSchema,
  role: z.enum(['owner', 'admin', 'member'], {
    errorMap: () => ({ message: 'Company role must be one of: owner, admin, member' })
  }),
  createdAt: dateSchema,
});

// Create company user schema
export const createCompanyUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['owner', 'admin', 'member']).default('member'),
});

// Company search parameters
export const companySearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(500, 'Query must be less than 500 characters'),
  tags: z.array(uuidSchema).max(10, 'Maximum 10 tags allowed').optional(),
  experience: z.array(z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])).optional(),
  location: z.array(z.string()).max(5, 'Maximum 5 locations allowed').optional(),
  remotePreference: z.array(z.enum(['remote', 'hybrid', 'onsite', 'flexible'])).optional(),
  availability: z.array(z.enum(['immediately', '2weeks', '1month', '3months'])).optional(),
  salaryMin: z.number().min(0, 'Minimum salary must be positive').optional(),
  salaryMax: z.number().min(0, 'Maximum salary must be positive').optional(),
  includeAnonymized: z.boolean().default(true),
  page: positiveIntegerSchema.default(1),
  limit: z.number().min(1).max(50).default(10),
  sortBy: z.enum(['relevance', 'salary', 'experience', 'updated']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine(data => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'Minimum salary must be less than or equal to maximum salary',
  path: ['salaryMax'],
});

// Profile view schema
export const profileViewSchema = z.object({
  id: uuidSchema,
  candidateId: uuidSchema,
  companyId: uuidSchema,
  viewedByUserId: z.string().min(1, 'Viewer user ID is required'),
  viewType: z.enum(['anonymous', 'purchased', 'admin'], {
    errorMap: () => ({ message: 'View type must be one of: anonymous, purchased, admin' })
  }),
  paymentId: z.string().optional(),
  paymentAmount: z.number().min(0, 'Payment amount must be positive').optional(),
  currency: currencySchema,
  createdAt: dateSchema,
});

// Create profile view schema
export const createProfileViewSchema = z.object({
  candidateId: uuidSchema,
  viewType: z.enum(['anonymous', 'purchased', 'admin']),
  paymentId: z.string().optional(),
  paymentAmount: z.number().min(0, 'Payment amount must be positive').optional(),
  currency: currencySchema.default('USD'),
}).refine(data => {
  if (data.viewType === 'purchased' && (!data.paymentId || !data.paymentAmount)) {
    return false;
  }
  return true;
}, {
  message: 'Payment ID and amount are required for purchased views',
  path: ['paymentId'],
});

// Search query log schema
export const searchQuerySchema = z.object({
  id: uuidSchema,
  companyId: uuidSchema,
  userId: z.string().min(1, 'User ID is required'),
  query: z.record(z.any()), // JSON search parameters
  resultsCount: positiveIntegerSchema,
  filtersTags: z.array(z.string()).optional(),
  createdAt: dateSchema,
});

// Create search query schema
export const createSearchQuerySchema = z.object({
  query: z.record(z.any()),
  resultsCount: positiveIntegerSchema,
  filtersTags: z.array(z.string()).optional(),
});

// Company subscription management
export const subscriptionUpdateSchema = z.object({
  tier: companyTierSchema,
  searchQuota: positiveIntegerSchema,
  subscriptionStatus: subscriptionStatusSchema,
  stripeCustomerId: z.string().optional(),
});

// Company analytics schemas
export const companyAnalyticsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
});

// Company team invitation
export const companyInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member']),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

// Company settings
export const companySettingsSchema = z.object({
  allowAnonymousViews: z.boolean().default(true),
  requireApprovalForPurchases: z.boolean().default(false),
  notificationPreferences: z.object({
    emailNotifications: z.boolean().default(true),
    profileViews: z.boolean().default(true),
    weeklyReports: z.boolean().default(true),
    billingUpdates: z.boolean().default(true),
  }),
  searchPreferences: z.object({
    defaultIncludeAnonymized: z.boolean().default(true),
    defaultSortBy: z.enum(['relevance', 'salary', 'experience', 'updated']).default('relevance'),
    saveSearchHistory: z.boolean().default(true),
  }),
});

// Company billing
export const billingInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().length(2, 'Country must be 2-letter code'),
  }),
  taxId: z.string().optional(),
});

// Payment processing
export const paymentIntentSchema = z.object({
  candidateId: uuidSchema,
  amount: z.number().min(1, 'Amount must be positive'),
  currency: currencySchema.default('USD'),
  metadata: z.record(z.string()).optional(),
});

// Usage tracking
export const usageTrackingSchema = z.object({
  action: z.enum(['search', 'view_profile', 'purchase_profile', 'export_data']),
  metadata: z.record(z.any()).optional(),
});

// Type exports
export type CompanySchema = z.infer<typeof companySchema>;
export type CreateCompanySchema = z.infer<typeof createCompanySchema>;
export type UpdateCompanySchema = z.infer<typeof updateCompanySchema>;
export type CompanyUserSchema = z.infer<typeof companyUserSchema>;
export type CreateCompanyUserSchema = z.infer<typeof createCompanyUserSchema>;
export type CompanySearchSchema = z.infer<typeof companySearchSchema>;
export type ProfileViewSchema = z.infer<typeof profileViewSchema>;
export type CreateProfileViewSchema = z.infer<typeof createProfileViewSchema>;
export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;
export type CreateSearchQuerySchema = z.infer<typeof createSearchQuerySchema>;
export type SubscriptionUpdateSchema = z.infer<typeof subscriptionUpdateSchema>;
export type CompanyAnalyticsSchema = z.infer<typeof companyAnalyticsSchema>;
export type CompanyInvitationSchema = z.infer<typeof companyInvitationSchema>;
export type CompanySettingsSchema = z.infer<typeof companySettingsSchema>;
export type BillingInfoSchema = z.infer<typeof billingInfoSchema>;
export type PaymentIntentSchema = z.infer<typeof paymentIntentSchema>;
export type UsageTrackingSchema = z.infer<typeof usageTrackingSchema>;