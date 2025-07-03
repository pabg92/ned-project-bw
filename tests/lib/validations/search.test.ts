import {
  advancedSearchFiltersSchema,
  quickSearchSchema,
  searchSuggestionSchema,
  savedSearchSchema,
  createSavedSearchSchema,
  updateSavedSearchSchema,
  searchAnalyticsSchema,
  searchResultSchema,
  searchResponseSchema,
  searchExportSchema,
  searchAlertSchema,
} from '../../../src/lib/validations/search';

describe('Search Validation Schemas', () => {
  describe('advancedSearchFiltersSchema', () => {
    it('should validate complete advanced search filters', () => {
      const validFilters = {
        query: 'full stack developer',
        requiredTags: ['123e4567-e89b-12d3-a456-426614174000'],
        optionalTags: ['123e4567-e89b-12d3-a456-426614174001'],
        excludedTags: ['123e4567-e89b-12d3-a456-426614174002'],
        experienceLevels: ['mid', 'senior'],
        minYearsExperience: 3,
        maxYearsExperience: 10,
        locations: ['San Francisco', 'New York'],
        remotePreferences: ['remote', 'hybrid'],
        availabilities: ['immediately', '2weeks'],
        salaryMin: 80000,
        salaryMax: 150000,
        salaryCurrency: 'USD',
        includeAnonymized: true,
        profileCompletedOnly: false,
        lastActiveWithin: 'month',
        degrees: ['Bachelor', 'Master'],
        institutions: ['Stanford', 'MIT'],
        minGpa: 3.5,
        hasPortfolio: true,
        hasGithub: true,
        hasLinkedin: false,
        sortBy: 'relevance',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      };

      const result = advancedSearchFiltersSchema.safeParse(validFilters);
      expect(result.success).toBe(true);
    });

    it('should validate minimal search filters', () => {
      const minimalFilters = {};

      const result = advancedSearchFiltersSchema.safeParse(minimalFilters);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.salaryCurrency).toBe('USD');
        expect(result.data.includeAnonymized).toBe(true);
        expect(result.data.sortBy).toBe('relevance');
        expect(result.data.sortOrder).toBe('desc');
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should reject invalid salary range', () => {
      const invalidFilters = {
        salaryMin: 120000,
        salaryMax: 80000,
      };

      const result = advancedSearchFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it('should reject invalid years experience range', () => {
      const invalidFilters = {
        minYearsExperience: 10,
        maxYearsExperience: 5,
      };

      const result = advancedSearchFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it('should reject too many tags', () => {
      const invalidFilters = {
        requiredTags: Array(15).fill('123e4567-e89b-12d3-a456-426614174000'),
      };

      const result = advancedSearchFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });

    it('should reject limit out of range', () => {
      const invalidFilters = {
        limit: 100, // Max is 50
      };

      const result = advancedSearchFiltersSchema.safeParse(invalidFilters);
      expect(result.success).toBe(false);
    });
  });

  describe('quickSearchSchema', () => {
    it('should validate quick search', () => {
      const validSearch = {
        query: 'react developer',
        location: 'Austin, TX',
        remotePreference: 'hybrid',
        experienceLevel: 'mid',
        salaryMin: 70000,
        limit: 5,
      };

      const result = quickSearchSchema.safeParse(validSearch);
      expect(result.success).toBe(true);
    });

    it('should validate minimal quick search', () => {
      const minimalSearch = {
        query: 'python',
      };

      const result = quickSearchSchema.safeParse(minimalSearch);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
      }
    });

    it('should reject empty query', () => {
      const invalidSearch = {
        query: '',
      };

      const result = quickSearchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });

    it('should reject query that is too long', () => {
      const invalidSearch = {
        query: 'A'.repeat(101),
      };

      const result = quickSearchSchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });
  });

  describe('searchSuggestionSchema', () => {
    it('should validate search suggestion', () => {
      const validSuggestion = {
        type: 'tag',
        value: 'JavaScript',
        count: 1245,
        category: 'skill',
      };

      const result = searchSuggestionSchema.safeParse(validSuggestion);
      expect(result.success).toBe(true);
    });

    it('should validate suggestion without optional fields', () => {
      const minimalSuggestion = {
        type: 'company',
        value: 'Google',
      };

      const result = searchSuggestionSchema.safeParse(minimalSuggestion);
      expect(result.success).toBe(true);
    });

    it('should reject invalid suggestion type', () => {
      const invalidSuggestion = {
        type: 'invalid_type',
        value: 'test',
      };

      const result = searchSuggestionSchema.safeParse(invalidSuggestion);
      expect(result.success).toBe(false);
    });
  });

  describe('savedSearchSchema', () => {
    it('should validate saved search', () => {
      const validSavedSearch = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123456789',
        name: 'Senior React Developers',
        description: 'Looking for senior React developers in SF Bay Area',
        filters: {
          query: 'react developer',
          experienceLevels: ['senior'],
          locations: ['San Francisco'],
          salaryMin: 120000,
        },
        isActive: true,
        alertsEnabled: true,
        alertFrequency: 'weekly',
        lastExecuted: new Date().toISOString(),
        resultCount: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = savedSearchSchema.safeParse(validSavedSearch);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const savedSearch = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123456789',
        name: 'My Search',
        filters: { query: 'developer' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = savedSearchSchema.safeParse(savedSearch);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
        expect(result.data.alertsEnabled).toBe(false);
        expect(result.data.alertFrequency).toBe('weekly');
      }
    });

    it('should reject empty name', () => {
      const invalidSavedSearch = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123456789',
        name: '',
        filters: { query: 'developer' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = savedSearchSchema.safeParse(invalidSavedSearch);
      expect(result.success).toBe(false);
    });
  });

  describe('createSavedSearchSchema', () => {
    it('should validate create saved search', () => {
      const validCreate = {
        name: 'Frontend Engineers',
        description: 'Frontend engineers with React experience',
        filters: {
          query: 'frontend react',
          experienceLevels: ['mid', 'senior'],
        },
        alertsEnabled: true,
        alertFrequency: 'daily',
      };

      const result = createSavedSearchSchema.safeParse(validCreate);
      expect(result.success).toBe(true);
    });

    it('should use default alert settings', () => {
      const create = {
        name: 'Backend Developers',
        filters: { query: 'backend python' },
      };

      const result = createSavedSearchSchema.safeParse(create);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.alertsEnabled).toBe(false);
        expect(result.data.alertFrequency).toBe('weekly');
      }
    });
  });

  describe('searchAnalyticsSchema', () => {
    it('should validate search analytics', () => {
      const validAnalytics = {
        userId: 'user_123456789',
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        query: 'react developer san francisco',
        filters: { experienceLevel: 'senior' },
        resultsCount: 42,
        resultsViewed: 10,
        profilesClicked: 3,
        timeSpent: 125, // seconds
        deviceType: 'desktop',
        userAgent: 'Mozilla/5.0 (Chrome)',
        createdAt: new Date().toISOString(),
      };

      const result = searchAnalyticsSchema.safeParse(validAnalytics);
      expect(result.success).toBe(true);
    });

    it('should validate minimal analytics', () => {
      const minimalAnalytics = {
        userId: 'user_123456789',
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        query: 'developer',
        filters: {},
        resultsCount: 100,
        createdAt: new Date().toISOString(),
      };

      const result = searchAnalyticsSchema.safeParse(minimalAnalytics);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.resultsViewed).toBe(0);
        expect(result.data.profilesClicked).toBe(0);
      }
    });

    it('should reject negative time spent', () => {
      const invalidAnalytics = {
        userId: 'user_123456789',
        companyId: '123e4567-e89b-12d3-a456-426614174000',
        query: 'developer',
        filters: {},
        resultsCount: 10,
        timeSpent: -5,
        createdAt: new Date().toISOString(),
      };

      const result = searchAnalyticsSchema.safeParse(invalidAnalytics);
      expect(result.success).toBe(false);
    });
  });

  describe('searchResultSchema', () => {
    it('should validate complete search result', () => {
      const validResult = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        score: 0.85,
        matchedTags: [
          {
            tagId: '123e4567-e89b-12d3-a456-426614174001',
            tagName: 'React',
            proficiency: 'advanced',
            yearsExperience: 5,
          },
        ],
        highlights: {
          title: ['Senior <em>React</em> Developer'],
          summary: ['Experienced with <em>React</em> and TypeScript'],
          experience: ['5 years of <em>React</em> development'],
          tags: ['<em>React</em>', 'TypeScript'],
        },
        preview: {
          title: 'Senior React Developer',
          location: 'San Francisco, CA',
          experience: 'senior',
          remotePreference: 'hybrid',
          availability: 'immediately',
          topSkills: ['React', 'TypeScript', 'Node.js'],
          salaryRange: {
            min: 120000,
            max: 160000,
            currency: 'USD',
          },
        },
      };

      const result = searchResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should validate minimal search result', () => {
      const minimalResult = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        score: 0.5,
        preview: {},
      };

      const result = searchResultSchema.safeParse(minimalResult);
      expect(result.success).toBe(true);
    });

    it('should reject invalid score', () => {
      const invalidResult = {
        candidateId: '123e4567-e89b-12d3-a456-426614174000',
        score: 1.5, // Score must be <= 1
        preview: {},
      };

      const result = searchResultSchema.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });
  });

  describe('searchResponseSchema', () => {
    it('should validate search response', () => {
      const validResponse = {
        results: [
          {
            candidateId: '123e4567-e89b-12d3-a456-426614174000',
            score: 0.9,
            preview: { title: 'Senior Developer' },
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        facets: {
          experience: [
            { value: 'senior', count: 45 },
            { value: 'mid', count: 35 },
          ],
          location: [
            { value: 'San Francisco', count: 25 },
            { value: 'New York', count: 20 },
          ],
          tags: [
            {
              tagId: '123e4567-e89b-12d3-a456-426614174001',
              tagName: 'React',
              count: 60,
            },
          ],
        },
        searchTime: 145, // milliseconds
        searchId: '123e4567-e89b-12d3-a456-426614174002',
      };

      const result = searchResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response without facets', () => {
      const response = {
        results: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        searchTime: 50,
        searchId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = searchResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should reject negative search time', () => {
      const invalidResponse = {
        results: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        searchTime: -10,
        searchId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = searchResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('searchExportSchema', () => {
    it('should validate search export', () => {
      const validExport = {
        searchId: '123e4567-e89b-12d3-a456-426614174000',
        format: 'xlsx',
        includePrivateData: true,
        fields: ['id', 'title', 'experience', 'contact'],
      };

      const result = searchExportSchema.safeParse(validExport);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const exportData = {
        searchId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = searchExportSchema.safeParse(exportData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('csv');
        expect(result.data.includePrivateData).toBe(false);
      }
    });

    it('should validate with all available fields', () => {
      const exportData = {
        searchId: '123e4567-e89b-12d3-a456-426614174000',
        format: 'json',
        fields: [
          'id',
          'title',
          'summary',
          'experience',
          'location',
          'remotePreference',
          'availability',
          'tags',
          'education',
          'workExperience',
          'salary',
        ],
      };

      const result = searchExportSchema.safeParse(exportData);
      expect(result.success).toBe(true);
    });
  });

  describe('searchAlertSchema', () => {
    it('should validate search alert', () => {
      const validAlert = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        savedSearchId: '123e4567-e89b-12d3-a456-426614174001',
        userId: 'user_123456789',
        newResultsCount: 5,
        alertType: 'weekly',
        sentAt: new Date().toISOString(),
        isRead: true,
        resultSample: [
          {
            candidateId: '123e4567-e89b-12d3-a456-426614174002',
            score: 0.8,
            preview: { title: 'Frontend Developer' },
          },
        ],
        createdAt: new Date().toISOString(),
      };

      const result = searchAlertSchema.safeParse(validAlert);
      expect(result.success).toBe(true);
    });

    it('should validate minimal alert', () => {
      const minimalAlert = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        savedSearchId: '123e4567-e89b-12d3-a456-426614174001',
        userId: 'user_123456789',
        newResultsCount: 2,
        alertType: 'immediate',
        createdAt: new Date().toISOString(),
      };

      const result = searchAlertSchema.safeParse(minimalAlert);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isRead).toBe(false);
      }
    });

    it('should reject too many result samples', () => {
      const invalidAlert = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        savedSearchId: '123e4567-e89b-12d3-a456-426614174001',
        userId: 'user_123456789',
        newResultsCount: 10,
        alertType: 'daily',
        resultSample: Array(10).fill({
          candidateId: '123e4567-e89b-12d3-a456-426614174002',
          score: 0.5,
          preview: {},
        }),
        createdAt: new Date().toISOString(),
      };

      const result = searchAlertSchema.safeParse(invalidAlert);
      expect(result.success).toBe(false);
    });
  });
});