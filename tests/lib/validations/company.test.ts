import {
  companySchema,
  createCompanySchema,
  updateCompanySchema,
  companyUserSchema,
  createCompanyUserSchema,
  companySearchSchema,
  profileViewSchema,
  createProfileViewSchema,
  searchQuerySchema,
  createSearchQuerySchema,
  subscriptionUpdateSchema,
  companyAnalyticsSchema,
  companyInvitationSchema,
  companySettingsSchema,
  billingInfoSchema,
  paymentIntentSchema,
  usageTrackingSchema,
} from '../../../src/lib/validations/company';

describe('Company Validation Schemas', () => {
  describe('companySchema', () => {
    it('should validate complete company data', () => {
      const validCompany = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Tech Corp',
        description: 'A leading technology company',
        website: 'https://techcorp.com',
        logo: 'https://techcorp.com/logo.png',
        size: 'medium',
        industry: 'Technology',
        location: 'San Francisco, CA',
        tier: 'premium',
        searchQuota: 100,
        searchesUsed: 25,
        subscriptionStatus: 'active',
        stripeCustomerId: 'cus_123456789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = companySchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    it('should validate company with minimal required fields', () => {
      const minimalCompany = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Tech Corp',
        website: 'https://techcorp.com',
        logo: 'https://techcorp.com/logo.png',
        tier: 'basic',
        searchQuota: 10,
        searchesUsed: 0,
        subscriptionStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = companySchema.safeParse(minimalCompany);
      expect(result.success).toBe(true);
    });

    it('should reject company with invalid tier', () => {
      const invalidCompany = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Tech Corp',
        tier: 'invalid-tier',
        searchQuota: 10,
        searchesUsed: 0,
        subscriptionStatus: 'active',
      };

      const result = companySchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });
  });

  describe('createCompanySchema', () => {
    it('should validate create company data', () => {
      const validCreateData = {
        name: 'New Tech Corp',
        description: 'A startup technology company',
        website: 'https://newtechcorp.com',
        logo: 'https://newtechcorp.com/logo.png',
        size: 'small',
        industry: 'Software',
        location: 'Austin, TX',
        tier: 'basic',
      };

      const result = createCompanySchema.safeParse(validCreateData);
      expect(result.success).toBe(true);
    });

    it('should use default tier when not provided', () => {
      const createData = {
        name: 'New Tech Corp',
        website: 'https://newtechcorp.com',
        logo: 'https://newtechcorp.com/logo.png',
        size: 'small',
        industry: 'Software',
        location: 'Austin, TX',
      };

      const result = createCompanySchema.safeParse(createData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tier).toBe('basic');
      }
    });

    it('should reject company with empty name', () => {
      const invalidData = {
        name: '',
        website: 'https://example.com',
        logo: 'https://example.com/logo.png',
        size: 'small',
        industry: 'Software',
        location: 'Austin, TX',
      };

      const result = createCompanySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('companyUserSchema', () => {
    it('should validate company user relationship', () => {
      const validRelation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123456789',
        companyId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      const result = companyUserSchema.safeParse(validRelation);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidRelation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123456789',
        companyId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'invalid-role',
        createdAt: new Date().toISOString(),
      };

      const result = companyUserSchema.safeParse(invalidRelation);
      expect(result.success).toBe(false);
    });
  });

  describe('companySearchSchema', () => {
    it('should validate search parameters', () => {
      const validSearch = {
        query: 'javascript developer',
        tags: ['123e4567-e89b-12d3-a456-426614174000'],
        experience: ['mid', 'senior'],
        location: ['San Francisco', 'Austin'],
        remotePreference: ['remote', 'hybrid'],
        availability: ['immediately', '2weeks'],
        salaryMin: 80000,
        salaryMax: 120000,
        includeAnonymized: true,
        page: 1,
        limit: 10,
        sortBy: 'relevance',
        sortOrder: 'desc',
      };

      const result = companySearchSchema.safeParse(validSearch);
      expect(result.success).toBe(true);
    });

    it('should validate minimal search', () => {
      const minimalSearch = {
        query: 'react developer',
      };

      const result = companySearchSchema.safeParse(minimalSearch);
      expect(result.success).toBe(true);
    });

    it('should reject invalid salary range', () => {
      const invalidSearch = {
        query: 'developer',
        salaryMin: 120000,
        salaryMax: 80000,
      };

      const result = companySearchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });

    it('should reject too many tags', () => {
      const invalidSearch = {
        query: 'developer',
        tags: Array(15).fill('123e4567-e89b-12d3-a456-426614174000'),
      };

      const result = companySearchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });
  });

  describe('createProfileViewSchema', () => {
    it('should validate anonymous profile view', () => {
      const validView = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        viewType: 'anonymous',
        currency: 'USD',
      };

      const result = createProfileViewSchema.safeParse(validView);
      expect(result.success).toBe(true);
    });

    it('should validate purchased profile view', () => {
      const validView = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        viewType: 'purchased',
        paymentId: 'pi_123456789',
        paymentAmount: 25.00,
        currency: 'USD',
      };

      const result = createProfileViewSchema.safeParse(validView);
      expect(result.success).toBe(true);
    });

    it('should reject purchased view without payment details', () => {
      const invalidView = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        viewType: 'purchased',
        currency: 'USD',
      };

      const result = createProfileViewSchema.safeParse(invalidView);
      expect(result.success).toBe(false);
    });
  });

  describe('companyAnalyticsSchema', () => {
    it('should validate analytics parameters', () => {
      const validAnalytics = {
        period: 'month',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      const result = companyAnalyticsSchema.safeParse(validAnalytics);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const invalidAnalytics = {
        period: 'month',
        startDate: '2024-01-31T00:00:00.000Z',
        endDate: '2024-01-01T23:59:59.999Z',
      };

      const result = companyAnalyticsSchema.safeParse(invalidAnalytics);
      expect(result.success).toBe(false);
    });
  });

  describe('companyInvitationSchema', () => {
    it('should validate team invitation', () => {
      const validInvitation = {
        email: 'user@example.com',
        role: 'member',
        message: 'Join our team!',
      };

      const result = companyInvitationSchema.safeParse(validInvitation);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidInvitation = {
        email: 'not-an-email',
        role: 'member',
      };

      const result = companyInvitationSchema.safeParse(invalidInvitation);
      expect(result.success).toBe(false);
    });
  });

  describe('companySettingsSchema', () => {
    it('should validate settings with defaults', () => {
      const validSettings = {
        notificationPreferences: {},
        searchPreferences: {},
      };

      const result = companySettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.allowAnonymousViews).toBe(true);
        expect(result.data.notificationPreferences.emailNotifications).toBe(true);
        expect(result.data.searchPreferences.defaultSortBy).toBe('relevance');
      }
    });

    it('should validate custom settings', () => {
      const customSettings = {
        allowAnonymousViews: false,
        requireApprovalForPurchases: true,
        notificationPreferences: {
          emailNotifications: false,
          profileViews: true,
          weeklyReports: false,
          billingUpdates: true,
        },
        searchPreferences: {
          defaultIncludeAnonymized: false,
          defaultSortBy: 'salary',
          saveSearchHistory: false,
        },
      };

      const result = companySettingsSchema.safeParse(customSettings);
      expect(result.success).toBe(true);
    });
  });

  describe('billingInfoSchema', () => {
    it('should validate complete billing info', () => {
      const validBilling = {
        companyName: 'Tech Corp Inc.',
        email: 'billing@techcorp.com',
        address: {
          line1: '123 Main St',
          line2: 'Suite 100',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'US',
        },
        taxId: 'EIN-123456789',
      };

      const result = billingInfoSchema.safeParse(validBilling);
      expect(result.success).toBe(true);
    });

    it('should validate billing info without optional fields', () => {
      const minimalBilling = {
        companyName: 'Tech Corp Inc.',
        email: 'billing@techcorp.com',
        address: {
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'US',
        },
      };

      const result = billingInfoSchema.safeParse(minimalBilling);
      expect(result.success).toBe(true);
    });

    it('should reject invalid country code', () => {
      const invalidBilling = {
        companyName: 'Tech Corp Inc.',
        email: 'billing@techcorp.com',
        address: {
          line1: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA', // Should be 2-letter code
        },
      };

      const result = billingInfoSchema.safeParse(invalidBilling);
      expect(result.success).toBe(false);
    });
  });

  describe('paymentIntentSchema', () => {
    it('should validate payment intent', () => {
      const validPayment = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 2500, // $25.00 in cents
        currency: 'USD',
        metadata: {
          viewType: 'profile_purchase',
        },
      };

      const result = paymentIntentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('should use default currency', () => {
      const payment = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 2500,
      };

      const result = paymentIntentSchema.safeParse(payment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
      }
    });

    it('should reject zero amount', () => {
      const invalidPayment = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 0,
      };

      const result = paymentIntentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });
  });

  describe('usageTrackingSchema', () => {
    it('should validate usage tracking', () => {
      const validUsage = {
        action: 'search',
        metadata: {
          query: 'javascript developer',
          resultsCount: 25,
        },
      };

      const result = usageTrackingSchema.safeParse(validUsage);
      expect(result.success).toBe(true);
    });

    it('should validate without metadata', () => {
      const minimalUsage = {
        action: 'view_profile',
      };

      const result = usageTrackingSchema.safeParse(minimalUsage);
      expect(result.success).toBe(true);
    });

    it('should reject invalid action', () => {
      const invalidUsage = {
        action: 'invalid_action',
      };

      const result = usageTrackingSchema.safeParse(invalidUsage);
      expect(result.success).toBe(false);
    });
  });
});