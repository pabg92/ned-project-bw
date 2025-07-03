import {
  dataIngestionLogSchema,
  createDataIngestionLogSchema,
  updateDataIngestionLogSchema,
  adminEnrichmentSchema,
  createAdminEnrichmentSchema,
  updateAdminEnrichmentSchema,
  notificationSchema,
  createNotificationSchema,
  bulkNotificationSchema,
  adminAnalyticsSchema,
  systemConfigSchema,
  updateSystemConfigSchema,
  adminUserManagementSchema,
  adminCompanyManagementSchema,
  dataExportSchema,
  auditLogSchema,
  createAuditLogSchema,
  adminDashboardFiltersSchema,
  manualDataImportSchema,
  systemHealthCheckSchema,
  featureFlagSchema,
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
} from '../../../src/lib/validations/admin';

describe('Admin Validation Schemas', () => {
  describe('dataIngestionLogSchema', () => {
    it('should validate complete data ingestion log', () => {
      const validLog = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        source: 'champions_ecosystem',
        type: 'candidate',
        status: 'success',
        recordsProcessed: 100,
        recordsSuccess: 95,
        recordsFailed: 5,
        errorMessage: 'Some records had validation errors',
        metadata: { batchId: 'batch_123' },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      const result = dataIngestionLogSchema.safeParse(validLog);
      expect(result.success).toBe(true);
    });

    it('should validate log without optional fields', () => {
      const minimalLog = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        source: 'manual',
        type: 'company',
        status: 'pending',
        recordsProcessed: 0,
        recordsSuccess: 0,
        recordsFailed: 0,
        createdAt: new Date().toISOString(),
      };

      const result = dataIngestionLogSchema.safeParse(minimalLog);
      expect(result.success).toBe(true);
    });

    it('should reject invalid source', () => {
      const invalidLog = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        source: 'invalid_source',
        type: 'candidate',
        status: 'pending',
        recordsProcessed: 0,
        recordsSuccess: 0,
        recordsFailed: 0,
        createdAt: new Date().toISOString(),
      };

      const result = dataIngestionLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
    });
  });

  describe('adminEnrichmentSchema', () => {
    it('should validate admin enrichment data', () => {
      const validEnrichment = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        enrichmentType: 'profile_verification',
        status: 'completed',
        data: {
          verified: true,
          score: 95,
          checkedFields: ['email', 'linkedin', 'github'],
        },
        notes: 'Profile verification completed successfully',
        enrichedBy: 'admin_user_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = adminEnrichmentSchema.safeParse(validEnrichment);
      expect(result.success).toBe(true);
    });

    it('should reject invalid enrichment type', () => {
      const invalidEnrichment = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        enrichmentType: 'invalid_type',
        status: 'pending',
        data: {},
        enrichedBy: 'admin_user_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = adminEnrichmentSchema.safeParse(invalidEnrichment);
      expect(result.success).toBe(false);
    });

    it('should reject notes that are too long', () => {
      const invalidEnrichment = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        enrichmentType: 'skill_assessment',
        status: 'completed',
        data: { score: 85 },
        notes: 'A'.repeat(2001), // Too long
        enrichedBy: 'admin_user_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = adminEnrichmentSchema.safeParse(invalidEnrichment);
      expect(result.success).toBe(false);
    });
  });

  describe('notificationSchema', () => {
    it('should validate notification', () => {
      const validNotification = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123456789',
        type: 'profile_viewed',
        title: 'Your profile was viewed',
        message: 'A company has viewed your profile',
        data: { companyId: 'company_123', viewType: 'anonymous' },
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const result = notificationSchema.safeParse(validNotification);
      expect(result.success).toBe(true);
    });

    it('should use default isRead value', () => {
      const notification = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123456789',
        type: 'admin_alert',
        title: 'System Alert',
        message: 'System maintenance scheduled',
        createdAt: new Date().toISOString(),
      };

      const result = notificationSchema.safeParse(notification);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isRead).toBe(false);
      }
    });

    it('should reject notification with empty title', () => {
      const invalidNotification = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123456789',
        type: 'system_update',
        title: '',
        message: 'System has been updated',
        createdAt: new Date().toISOString(),
      };

      const result = notificationSchema.safeParse(invalidNotification);
      expect(result.success).toBe(false);
    });
  });

  describe('bulkNotificationSchema', () => {
    it('should validate bulk notification', () => {
      const validBulk = {
        userIds: ['user_1', 'user_2', 'user_3'],
        type: 'system_update',
        title: 'System Maintenance',
        message: 'System will be down for maintenance',
        data: { maintenanceWindow: '2024-01-15T02:00:00Z' },
      };

      const result = bulkNotificationSchema.safeParse(validBulk);
      expect(result.success).toBe(true);
    });

    it('should reject empty user list', () => {
      const invalidBulk = {
        userIds: [],
        type: 'system_update',
        title: 'Update',
        message: 'System updated',
      };

      const result = bulkNotificationSchema.safeParse(invalidBulk);
      expect(result.success).toBe(false);
    });

    it('should reject too many users', () => {
      const invalidBulk = {
        userIds: Array(1001).fill('user_id'),
        type: 'system_update',
        title: 'Update',
        message: 'System updated',
      };

      const result = bulkNotificationSchema.safeParse(invalidBulk);
      expect(result.success).toBe(false);
    });
  });

  describe('adminAnalyticsSchema', () => {
    it('should validate analytics parameters', () => {
      const validAnalytics = {
        metric: 'total_users',
        period: 'month',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        groupBy: 'day',
      };

      const result = adminAnalyticsSchema.safeParse(validAnalytics);
      expect(result.success).toBe(true);
    });

    it('should validate without groupBy', () => {
      const analytics = {
        metric: 'revenue',
        period: 'quarter',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-03-31T23:59:59.999Z',
      };

      const result = adminAnalyticsSchema.safeParse(analytics);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const invalidAnalytics = {
        metric: 'active_users',
        period: 'week',
        startDate: '2024-01-31T00:00:00.000Z',
        endDate: '2024-01-01T23:59:59.999Z',
      };

      const result = adminAnalyticsSchema.safeParse(invalidAnalytics);
      expect(result.success).toBe(false);
    });
  });

  describe('systemConfigSchema', () => {
    it('should validate string configuration', () => {
      const validConfig = {
        key: 'app_name',
        value: 'NED Platform',
        description: 'Application display name',
        isPublic: true,
        category: 'general',
      };

      const result = systemConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should validate number configuration', () => {
      const validConfig = {
        key: 'max_search_results',
        value: 50,
        description: 'Maximum search results per page',
        isPublic: false,
        category: 'search',
      };

      const result = systemConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should validate boolean configuration', () => {
      const validConfig = {
        key: 'maintenance_mode',
        value: false,
        category: 'general',
      };

      const result = systemConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const config = {
        key: 'feature_enabled',
        value: true,
      };

      const result = systemConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPublic).toBe(false);
        expect(result.data.category).toBe('general');
      }
    });
  });

  describe('adminUserManagementSchema', () => {
    it('should validate user management action', () => {
      const validAction = {
        userId: 'user_123456789',
        action: 'suspend',
        reason: 'Violation of terms of service',
        notifyUser: true,
      };

      const result = adminUserManagementSchema.safeParse(validAction);
      expect(result.success).toBe(true);
    });

    it('should use default notification setting', () => {
      const action = {
        userId: 'user_123456789',
        action: 'verify',
        reason: 'Manual verification completed',
      };

      const result = adminUserManagementSchema.safeParse(action);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notifyUser).toBe(true);
      }
    });

    it('should reject empty reason', () => {
      const invalidAction = {
        userId: 'user_123456789',
        action: 'deactivate',
        reason: '',
      };

      const result = adminUserManagementSchema.safeParse(invalidAction);
      expect(result.success).toBe(false);
    });
  });

  describe('featureFlagSchema', () => {
    it('should validate feature flag', () => {
      const validFlag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'new_search_algorithm',
        description: 'Enable the new AI-powered search algorithm',
        isEnabled: true,
        rolloutPercentage: 25,
        targetAudience: ['companies'],
        environment: 'production',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = featureFlagSchema.safeParse(validFlag);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const flag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'beta_feature',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = featureFlagSchema.safeParse(flag);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isEnabled).toBe(false);
        expect(result.data.rolloutPercentage).toBe(0);
        expect(result.data.targetAudience).toEqual(['all']);
        expect(result.data.environment).toBe('development');
      }
    });

    it('should reject invalid rollout percentage', () => {
      const invalidFlag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'test_feature',
        rolloutPercentage: 150, // Invalid: > 100
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = featureFlagSchema.safeParse(invalidFlag);
      expect(result.success).toBe(false);
    });
  });

  describe('manualDataImportSchema', () => {
    it('should validate data import', () => {
      const validImport = {
        type: 'candidates',
        data: [
          { name: 'John Doe', email: 'john@example.com' },
          { name: 'Jane Smith', email: 'jane@example.com' },
        ],
        validateOnly: false,
        skipDuplicates: true,
      };

      const result = manualDataImportSchema.safeParse(validImport);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const importData = {
        type: 'companies',
        data: [{ name: 'Tech Corp', website: 'https://techcorp.com' }],
      };

      const result = manualDataImportSchema.safeParse(importData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.validateOnly).toBe(false);
        expect(result.data.skipDuplicates).toBe(true);
      }
    });

    it('should reject empty data array', () => {
      const invalidImport = {
        type: 'tags',
        data: [],
      };

      const result = manualDataImportSchema.safeParse(invalidImport);
      expect(result.success).toBe(false);
    });

    it('should reject too many records', () => {
      const invalidImport = {
        type: 'candidates',
        data: Array(1001).fill({ name: 'Test' }),
      };

      const result = manualDataImportSchema.safeParse(invalidImport);
      expect(result.success).toBe(false);
    });
  });

  describe('systemHealthCheckSchema', () => {
    it('should validate health check parameters', () => {
      const validCheck = {
        component: 'database',
        includeDetails: true,
      };

      const result = systemHealthCheckSchema.safeParse(validCheck);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const check = {};

      const result = systemHealthCheckSchema.safeParse(check);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.component).toBe('all');
        expect(result.data.includeDetails).toBe(false);
      }
    });
  });

  describe('dataExportSchema', () => {
    it('should validate data export parameters', () => {
      const validExport = {
        type: 'analytics',
        format: 'xlsx',
        filters: { status: 'active' },
        includeDeleted: false,
        dateRange: {
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-31T23:59:59.999Z',
        },
      };

      const result = dataExportSchema.safeParse(validExport);
      expect(result.success).toBe(true);
    });

    it('should use default format', () => {
      const exportData = {
        type: 'users',
      };

      const result = dataExportSchema.safeParse(exportData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('csv');
        expect(result.data.includeDeleted).toBe(false);
      }
    });
  });

  describe('auditLogSchema', () => {
    it('should validate audit log entry', () => {
      const validLog = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'admin_123',
        action: 'user_suspended',
        resource: 'user',
        resourceId: 'user_456',
        details: { reason: 'Terms violation' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date().toISOString(),
      };

      const result = auditLogSchema.safeParse(validLog);
      expect(result.success).toBe(true);
    });

    it('should validate minimal audit log', () => {
      const minimalLog = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'admin_123',
        action: 'login',
        resource: 'auth',
        createdAt: new Date().toISOString(),
      };

      const result = auditLogSchema.safeParse(minimalLog);
      expect(result.success).toBe(true);
    });

    it('should reject invalid IP address', () => {
      const invalidLog = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'admin_123',
        action: 'login',
        resource: 'auth',
        ipAddress: 'not-an-ip',
        createdAt: new Date().toISOString(),
      };

      const result = auditLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
    });
  });
});