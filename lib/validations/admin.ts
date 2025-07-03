import { z } from 'zod';
import { 
  uuidSchema, 
  dateSchema, 
  positiveIntegerSchema,
  paginationSchema,
  emailSchema
} from './common';
import { adminPermissionSchema } from './auth';

// Data ingestion log schema
export const dataIngestionLogSchema = z.object({
  id: uuidSchema,
  source: z.enum(['champions_ecosystem', 'manual', 'api'], {
    errorMap: () => ({ message: 'Source must be one of: champions_ecosystem, manual, api' })
  }),
  type: z.enum(['candidate', 'company', 'tag'], {
    errorMap: () => ({ message: 'Type must be one of: candidate, company, tag' })
  }),
  status: z.enum(['pending', 'success', 'failed'], {
    errorMap: () => ({ message: 'Status must be one of: pending, success, failed' })
  }),
  recordsProcessed: positiveIntegerSchema,
  recordsSuccess: positiveIntegerSchema,
  recordsFailed: positiveIntegerSchema,
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: dateSchema,
  completedAt: dateSchema.optional(),
});

// Create data ingestion log schema
export const createDataIngestionLogSchema = z.object({
  source: z.enum(['champions_ecosystem', 'manual', 'api']),
  type: z.enum(['candidate', 'company', 'tag']),
  metadata: z.record(z.any()).optional(),
});

// Update data ingestion log schema
export const updateDataIngestionLogSchema = z.object({
  status: z.enum(['pending', 'success', 'failed']),
  recordsProcessed: positiveIntegerSchema.optional(),
  recordsSuccess: positiveIntegerSchema.optional(),
  recordsFailed: positiveIntegerSchema.optional(),
  errorMessage: z.string().optional(),
  completedAt: dateSchema.optional(),
});

// Admin enrichment data schema
export const adminEnrichmentSchema = z.object({
  candidateId: uuidSchema,
  enrichmentType: z.enum(['profile_verification', 'skill_assessment', 'background_check', 'portfolio_review'], {
    errorMap: () => ({ message: 'Enrichment type must be one of: profile_verification, skill_assessment, background_check, portfolio_review' })
  }),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed'], {
    errorMap: () => ({ message: 'Status must be one of: pending, in_progress, completed, failed' })
  }),
  data: z.record(z.any()),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  enrichedBy: z.string().min(1, 'Enriched by user ID is required'),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Create admin enrichment schema
export const createAdminEnrichmentSchema = z.object({
  candidateId: uuidSchema,
  enrichmentType: z.enum(['profile_verification', 'skill_assessment', 'background_check', 'portfolio_review']),
  data: z.record(z.any()),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

// Update admin enrichment schema
export const updateAdminEnrichmentSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  data: z.record(z.any()).optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

// Notification schema
export const notificationSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['profile_viewed', 'payment_received', 'admin_alert', 'system_update', 'subscription_update'], {
    errorMap: () => ({ message: 'Notification type must be valid' })
  }),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  createdAt: dateSchema,
});

// Create notification schema
export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['profile_viewed', 'payment_received', 'admin_alert', 'system_update', 'subscription_update']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  data: z.record(z.any()).optional(),
});

// Bulk notification schema
export const bulkNotificationSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, 'At least one user ID is required').max(1000, 'Maximum 1000 users allowed'),
  type: z.enum(['profile_viewed', 'payment_received', 'admin_alert', 'system_update', 'subscription_update']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  data: z.record(z.any()).optional(),
});

// Admin analytics schema
export const adminAnalyticsSchema = z.object({
  metric: z.enum([
    'total_users',
    'active_users', 
    'total_companies',
    'active_companies',
    'total_candidates',
    'verified_candidates',
    'total_searches',
    'total_profile_views',
    'revenue',
    'subscription_growth'
  ]),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
});

// System configuration schema
export const systemConfigSchema = z.object({
  key: z.string().min(1, 'Configuration key is required').max(100, 'Key must be less than 100 characters'),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.any())]),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  isPublic: z.boolean().default(false),
  category: z.enum(['general', 'billing', 'search', 'notifications', 'security']).default('general'),
});

// Update system configuration schema
export const updateSystemConfigSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.any())]),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// User management schemas
export const adminUserManagementSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  action: z.enum(['activate', 'deactivate', 'suspend', 'delete', 'verify', 'unverify']),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  notifyUser: z.boolean().default(true),
});

// Company management schemas
export const adminCompanyManagementSchema = z.object({
  companyId: uuidSchema,
  action: z.enum(['approve', 'reject', 'suspend', 'activate', 'upgrade_tier', 'downgrade_tier']),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  newTier: z.enum(['basic', 'premium', 'enterprise']).optional(),
  notifyCompany: z.boolean().default(true),
});

// Data export schemas
export const dataExportSchema = z.object({
  type: z.enum(['users', 'companies', 'candidates', 'searches', 'payments', 'analytics']),
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  filters: z.record(z.any()).optional(),
  includeDeleted: z.boolean().default(false),
  dateRange: z.object({
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
  }).optional(),
});

// Audit log schema
export const auditLogSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1, 'User ID is required'),
  action: z.string().min(1, 'Action is required').max(100, 'Action must be less than 100 characters'),
  resource: z.string().min(1, 'Resource is required').max(100, 'Resource must be less than 100 characters'),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().ip('Invalid IP address').optional(),
  userAgent: z.string().optional(),
  createdAt: dateSchema,
});

// Create audit log schema
export const createAuditLogSchema = z.object({
  action: z.string().min(1, 'Action is required').max(100, 'Action must be less than 100 characters'),
  resource: z.string().min(1, 'Resource is required').max(100, 'Resource must be less than 100 characters'),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().ip('Invalid IP address').optional(),
  userAgent: z.string().optional(),
});

// Admin dashboard filters
export const adminDashboardFiltersSchema = z.object({
  dateRange: z.object({
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
  }),
  userType: z.array(z.enum(['candidate', 'company', 'admin'])).optional(),
  status: z.array(z.enum(['active', 'inactive', 'suspended'])).optional(),
  tier: z.array(z.enum(['basic', 'premium', 'enterprise'])).optional(),
}).extend(paginationSchema.shape);

// Manual data import schema
export const manualDataImportSchema = z.object({
  type: z.enum(['candidates', 'companies', 'tags']),
  data: z.array(z.record(z.any())).min(1, 'At least one record is required').max(1000, 'Maximum 1000 records allowed'),
  validateOnly: z.boolean().default(false),
  skipDuplicates: z.boolean().default(true),
});

// System health check schema
export const systemHealthCheckSchema = z.object({
  component: z.enum(['database', 'storage', 'email', 'payment', 'search', 'all']).default('all'),
  includeDetails: z.boolean().default(false),
});

// Feature flag schema
export const featureFlagSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, 'Feature flag name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  isEnabled: z.boolean().default(false),
  rolloutPercentage: z.number().min(0, 'Rollout percentage must be positive').max(100, 'Rollout percentage must be 100 or less').default(0),
  targetAudience: z.array(z.enum(['all', 'candidates', 'companies', 'admins'])).default(['all']),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Create feature flag schema
export const createFeatureFlagSchema = z.object({
  name: z.string().min(1, 'Feature flag name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  isEnabled: z.boolean().default(false),
  rolloutPercentage: z.number().min(0).max(100).default(0),
  targetAudience: z.array(z.enum(['all', 'candidates', 'companies', 'admins'])).default(['all']),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
});

// Update feature flag schema
export const updateFeatureFlagSchema = createFeatureFlagSchema.partial();

// Type exports
export type DataIngestionLogSchema = z.infer<typeof dataIngestionLogSchema>;
export type CreateDataIngestionLogSchema = z.infer<typeof createDataIngestionLogSchema>;
export type UpdateDataIngestionLogSchema = z.infer<typeof updateDataIngestionLogSchema>;
export type AdminEnrichmentSchema = z.infer<typeof adminEnrichmentSchema>;
export type CreateAdminEnrichmentSchema = z.infer<typeof createAdminEnrichmentSchema>;
export type UpdateAdminEnrichmentSchema = z.infer<typeof updateAdminEnrichmentSchema>;
export type NotificationSchema = z.infer<typeof notificationSchema>;
export type CreateNotificationSchema = z.infer<typeof createNotificationSchema>;
export type BulkNotificationSchema = z.infer<typeof bulkNotificationSchema>;
export type AdminAnalyticsSchema = z.infer<typeof adminAnalyticsSchema>;
export type SystemConfigSchema = z.infer<typeof systemConfigSchema>;
export type UpdateSystemConfigSchema = z.infer<typeof updateSystemConfigSchema>;
export type AdminUserManagementSchema = z.infer<typeof adminUserManagementSchema>;
export type AdminCompanyManagementSchema = z.infer<typeof adminCompanyManagementSchema>;
export type DataExportSchema = z.infer<typeof dataExportSchema>;
export type AuditLogSchema = z.infer<typeof auditLogSchema>;
export type CreateAuditLogSchema = z.infer<typeof createAuditLogSchema>;
export type AdminDashboardFiltersSchema = z.infer<typeof adminDashboardFiltersSchema>;
export type ManualDataImportSchema = z.infer<typeof manualDataImportSchema>;
export type SystemHealthCheckSchema = z.infer<typeof systemHealthCheckSchema>;
export type FeatureFlagSchema = z.infer<typeof featureFlagSchema>;
export type CreateFeatureFlagSchema = z.infer<typeof createFeatureFlagSchema>;
export type UpdateFeatureFlagSchema = z.infer<typeof updateFeatureFlagSchema>;