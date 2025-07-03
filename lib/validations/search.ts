import { z } from 'zod';
import { 
  uuidSchema, 
  positiveIntegerSchema, 
  experienceLevelSchema,
  remotePreferenceSchema,
  availabilitySchema,
  tagCategorySchema
} from './common';

// Advanced search filters schema
export const advancedSearchFiltersSchema = z.object({
  // Text search
  query: z.string().max(500, 'Query must be less than 500 characters').optional(),
  
  // Tag filters
  requiredTags: z.array(uuidSchema).max(10, 'Maximum 10 required tags allowed').optional(),
  optionalTags: z.array(uuidSchema).max(10, 'Maximum 10 optional tags allowed').optional(),
  excludedTags: z.array(uuidSchema).max(5, 'Maximum 5 excluded tags allowed').optional(),
  
  // Experience filters
  experienceLevels: z.array(experienceLevelSchema).optional(),
  minYearsExperience: z.number().min(0, 'Years of experience must be positive').max(50, 'Years of experience must be less than 50').optional(),
  maxYearsExperience: z.number().min(0, 'Years of experience must be positive').max(50, 'Years of experience must be less than 50').optional(),
  
  // Location filters
  locations: z.array(z.string().max(100)).max(10, 'Maximum 10 locations allowed').optional(),
  remotePreferences: z.array(remotePreferenceSchema).optional(),
  
  // Availability filters
  availabilities: z.array(availabilitySchema).optional(),
  
  // Salary filters
  salaryMin: z.number().min(0, 'Minimum salary must be positive').optional(),
  salaryMax: z.number().min(0, 'Maximum salary must be positive').optional(),
  salaryCurrency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  
  // Profile filters
  includeAnonymized: z.boolean().default(true),
  profileCompletedOnly: z.boolean().default(false),
  lastActiveWithin: z.enum(['week', 'month', 'quarter', 'year']).optional(),
  
  // Education filters
  degrees: z.array(z.string().max(100)).max(5, 'Maximum 5 degrees allowed').optional(),
  institutions: z.array(z.string().max(100)).max(5, 'Maximum 5 institutions allowed').optional(),
  minGpa: z.number().min(0, 'GPA must be positive').max(4.0, 'GPA must be 4.0 or less').optional(),
  
  // Portfolio filters
  hasPortfolio: z.boolean().optional(),
  hasGithub: z.boolean().optional(),
  hasLinkedin: z.boolean().optional(),
  
  // Sorting and pagination
  sortBy: z.enum(['relevance', 'salary', 'experience', 'updated', 'alphabetical']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: positiveIntegerSchema.default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(50, 'Limit must be at most 50').default(10),
}).refine(data => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'Minimum salary must be less than or equal to maximum salary',
  path: ['salaryMax'],
}).refine(data => {
  if (data.minYearsExperience && data.maxYearsExperience) {
    return data.minYearsExperience <= data.maxYearsExperience;
  }
  return true;
}, {
  message: 'Minimum years of experience must be less than or equal to maximum',
  path: ['maxYearsExperience'],
});

// Quick search schema (simplified for basic searches)
export const quickSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query must be less than 100 characters'),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  remotePreference: remotePreferenceSchema.optional(),
  experienceLevel: experienceLevelSchema.optional(),
  salaryMin: z.number().min(0, 'Minimum salary must be positive').optional(),
  limit: z.number().min(1).max(20).default(10),
});

// Search suggestion schema
export const searchSuggestionSchema = z.object({
  type: z.enum(['tag', 'company', 'location', 'title']),
  value: z.string().min(1, 'Suggestion value is required').max(100, 'Value must be less than 100 characters'),
  count: positiveIntegerSchema.optional(),
  category: tagCategorySchema.optional(),
});

// Saved search schema
export const savedSearchSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Search name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  filters: advancedSearchFiltersSchema,
  isActive: z.boolean().default(true),
  alertsEnabled: z.boolean().default(false),
  alertFrequency: z.enum(['immediate', 'daily', 'weekly']).default('weekly'),
  lastExecuted: z.string().datetime().optional(),
  resultCount: positiveIntegerSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create saved search schema
export const createSavedSearchSchema = z.object({
  name: z.string().min(1, 'Search name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  filters: advancedSearchFiltersSchema,
  alertsEnabled: z.boolean().default(false),
  alertFrequency: z.enum(['immediate', 'daily', 'weekly']).default('weekly'),
});

// Update saved search schema
export const updateSavedSearchSchema = createSavedSearchSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Search analytics schema
export const searchAnalyticsSchema = z.object({
  searchId: uuidSchema.optional(),
  userId: z.string().min(1, 'User ID is required'),
  companyId: uuidSchema,
  query: z.string().max(500, 'Query must be less than 500 characters'),
  filters: z.record(z.any()),
  resultsCount: positiveIntegerSchema,
  resultsViewed: positiveIntegerSchema.default(0),
  profilesClicked: positiveIntegerSchema.default(0),
  timeSpent: z.number().min(0, 'Time spent must be positive').optional(), // in seconds
  deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional(),
  userAgent: z.string().optional(),
  createdAt: z.string().datetime(),
});

// Search result schema
export const searchResultSchema = z.object({
  candidateId: uuidSchema,
  score: z.number().min(0, 'Score must be positive').max(1, 'Score must be at most 1'),
  matchedTags: z.array(z.object({
    tagId: uuidSchema,
    tagName: z.string(),
    proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    yearsExperience: z.number().min(0).max(50).optional(),
  })).optional(),
  highlights: z.object({
    title: z.array(z.string()).optional(),
    summary: z.array(z.string()).optional(),
    experience: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  preview: z.object({
    title: z.string().optional(),
    location: z.string().optional(),
    experience: experienceLevelSchema.optional(),
    remotePreference: remotePreferenceSchema.optional(),
    availability: availabilitySchema.optional(),
    topSkills: z.array(z.string()).max(5).optional(),
    salaryRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
    }).optional(),
  }),
});

// Search response schema
export const searchResponseSchema = z.object({
  results: z.array(searchResultSchema),
  total: positiveIntegerSchema,
  page: positiveIntegerSchema,
  limit: positiveIntegerSchema,
  totalPages: positiveIntegerSchema,
  facets: z.object({
    experience: z.array(z.object({
      value: experienceLevelSchema,
      count: positiveIntegerSchema,
    })).optional(),
    location: z.array(z.object({
      value: z.string(),
      count: positiveIntegerSchema,
    })).optional(),
    remotePreference: z.array(z.object({
      value: remotePreferenceSchema,
      count: positiveIntegerSchema,
    })).optional(),
    availability: z.array(z.object({
      value: availabilitySchema,
      count: positiveIntegerSchema,
    })).optional(),
    tags: z.array(z.object({
      tagId: uuidSchema,
      tagName: z.string(),
      count: positiveIntegerSchema,
    })).optional(),
    salaryRanges: z.array(z.object({
      range: z.string(),
      count: positiveIntegerSchema,
    })).optional(),
  }).optional(),
  searchTime: z.number().min(0, 'Search time must be positive'), // in milliseconds
  searchId: uuidSchema,
});

// Search export schema
export const searchExportSchema = z.object({
  searchId: uuidSchema,
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  includePrivateData: z.boolean().default(false),
  fields: z.array(z.enum([
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
    'contact', // Only if includePrivateData is true
    'salary',
  ])).optional(),
});

// Search alert schema
export const searchAlertSchema = z.object({
  id: uuidSchema,
  savedSearchId: uuidSchema,
  userId: z.string().min(1, 'User ID is required'),
  newResultsCount: positiveIntegerSchema,
  alertType: z.enum(['immediate', 'daily', 'weekly']),
  sentAt: z.string().datetime().optional(),
  isRead: z.boolean().default(false),
  resultSample: z.array(searchResultSchema).max(5).optional(),
  createdAt: z.string().datetime(),
});

// Type exports
export type AdvancedSearchFiltersSchema = z.infer<typeof advancedSearchFiltersSchema>;
export type QuickSearchSchema = z.infer<typeof quickSearchSchema>;
export type SearchSuggestionSchema = z.infer<typeof searchSuggestionSchema>;
export type SavedSearchSchema = z.infer<typeof savedSearchSchema>;
export type CreateSavedSearchSchema = z.infer<typeof createSavedSearchSchema>;
export type UpdateSavedSearchSchema = z.infer<typeof updateSavedSearchSchema>;
export type SearchAnalyticsSchema = z.infer<typeof searchAnalyticsSchema>;
export type SearchResultSchema = z.infer<typeof searchResultSchema>;
export type SearchResponseSchema = z.infer<typeof searchResponseSchema>;
export type SearchExportSchema = z.infer<typeof searchExportSchema>;
export type SearchAlertSchema = z.infer<typeof searchAlertSchema>;