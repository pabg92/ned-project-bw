import { z } from 'zod';
import { 
  uuidSchema, 
  dateSchema, 
  urlSchema, 
  salarySchema, 
  currencySchema,
  experienceLevelSchema,
  remotePreferenceSchema,
  availabilitySchema,
  proficiencySchema,
  positiveIntegerSchema
} from './common';

// Candidate profile schema
export const candidateProfileSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Job title is required').max(100, 'Title must be less than 100 characters').optional(),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(2000, 'Summary must be less than 2000 characters').optional(),
  experience: experienceLevelSchema.optional(),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters').optional(),
  remotePreference: remotePreferenceSchema.optional(),
  salaryMin: salarySchema,
  salaryMax: salarySchema,
  salaryCurrency: currencySchema,
  availability: availabilitySchema.optional(),
  isAnonymized: z.boolean().default(true),
  isActive: z.boolean().default(true),
  profileCompleted: z.boolean().default(false),
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  portfolioUrl: urlSchema,
  resumeUrl: urlSchema,
  privateMetadata: z.record(z.any()).optional(),
  publicMetadata: z.record(z.any()).optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
}).refine(data => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'Minimum salary must be less than or equal to maximum salary',
  path: ['salaryMax'],
});

// Create candidate profile schema
export const createCandidateProfileSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100, 'Title must be less than 100 characters'),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(2000, 'Summary must be less than 2000 characters'),
  experience: experienceLevelSchema,
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
  remotePreference: remotePreferenceSchema,
  salaryMin: salarySchema.optional(),
  salaryMax: salarySchema.optional(),
  salaryCurrency: currencySchema.default('USD'),
  availability: availabilitySchema,
  isAnonymized: z.boolean().default(true),
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  portfolioUrl: urlSchema,
  tags: z.array(uuidSchema).max(20, 'Maximum 20 tags allowed').optional(),
}).refine(data => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'Minimum salary must be less than or equal to maximum salary',
  path: ['salaryMax'],
});

// Update candidate profile schema  
export const updateCandidateProfileSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100, 'Title must be less than 100 characters').optional(),
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(2000, 'Summary must be less than 2000 characters').optional(),
  experience: experienceLevelSchema.optional(),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters').optional(),
  remotePreference: remotePreferenceSchema.optional(),
  salaryMin: salarySchema.optional(),
  salaryMax: salarySchema.optional(),
  salaryCurrency: currencySchema.optional(),
  availability: availabilitySchema.optional(),
  isAnonymized: z.boolean().optional(),
  linkedinUrl: urlSchema.optional(),
  githubUrl: urlSchema.optional(),
  portfolioUrl: urlSchema.optional(),
  tags: z.array(uuidSchema).max(20, 'Maximum 20 tags allowed').optional(),
}).refine(data => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'Minimum salary must be less than or equal to maximum salary',
  path: ['salaryMax'],
});

// Work experience schema
export const workExperienceSchema = z.object({
  id: uuidSchema,
  candidateId: uuidSchema,
  company: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  title: z.string().min(1, 'Job title is required').max(100, 'Job title must be less than 100 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  isCurrent: z.boolean().default(false),
  isRemote: z.boolean().default(false),
  order: positiveIntegerSchema.default(0),
  createdAt: dateSchema,
}).refine(data => {
  if (data.endDate && !data.isCurrent) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
}).refine(data => {
  if (data.isCurrent && data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'Current position cannot have an end date',
  path: ['endDate'],
});

// Create work experience schema
export const createWorkExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  title: z.string().min(1, 'Job title is required').max(100, 'Job title must be less than 100 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date').optional(),
  isCurrent: z.boolean().default(false),
  isRemote: z.boolean().default(false),
  order: positiveIntegerSchema.default(0),
}).refine(data => {
  if (data.endDate && !data.isCurrent) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
}).refine(data => {
  if (data.isCurrent && data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'Current position cannot have an end date',
  path: ['endDate'],
});

// Update work experience schema
export const updateWorkExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters').optional(),
  title: z.string().min(1, 'Job title is required').max(100, 'Job title must be less than 100 characters').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  isCurrent: z.boolean().optional(),
  isRemote: z.boolean().optional(),
  order: positiveIntegerSchema.optional(),
}).refine(data => {
  if (data.endDate && data.startDate && !data.isCurrent) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
}).refine(data => {
  if (data.isCurrent && data.endDate) {
    return false;
  }
  return true;
}, {
  message: 'Current position cannot have an end date',
  path: ['endDate'],
});

// Education schema
export const educationSchema = z.object({
  id: uuidSchema,
  candidateId: uuidSchema,
  institution: z.string().min(1, 'Institution name is required').max(100, 'Institution name must be less than 100 characters'),
  degree: z.string().min(1, 'Degree is required').max(100, 'Degree must be less than 100 characters'),
  field: z.string().max(100, 'Field of study must be less than 100 characters').optional(),
  gpa: z.number().min(0, 'GPA must be positive').max(4.0, 'GPA must be 4.0 or less').optional(),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  order: positiveIntegerSchema.default(0),
  createdAt: dateSchema,
}).refine(data => {
  if (data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
});

// Create education schema
export const createEducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required').max(100, 'Institution name must be less than 100 characters'),
  degree: z.string().min(1, 'Degree is required').max(100, 'Degree must be less than 100 characters'),
  field: z.string().max(100, 'Field of study must be less than 100 characters').optional(),
  gpa: z.number().min(0, 'GPA must be positive').max(4.0, 'GPA must be 4.0 or less').optional(),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  order: positiveIntegerSchema.default(0),
}).refine(data => {
  if (data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
});

// Update education schema
export const updateEducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required').max(100, 'Institution name must be less than 100 characters').optional(),
  degree: z.string().min(1, 'Degree is required').max(100, 'Degree must be less than 100 characters').optional(),
  field: z.string().max(100, 'Field of study must be less than 100 characters').optional(),
  gpa: z.number().min(0, 'GPA must be positive').max(4.0, 'GPA must be 4.0 or less').optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  order: positiveIntegerSchema.optional(),
}).refine(data => {
  if (data.endDate && data.startDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
});

// Tag schema
export const tagSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'),
  category: z.enum(['skill', 'experience', 'industry', 'location']),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').default('#3B82F6'),
  isVerified: z.boolean().default(false),
  createdAt: dateSchema,
});

// Create tag schema
export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'),
  category: z.enum(['skill', 'experience', 'industry', 'location']),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').default('#3B82F6'),
});

// Candidate tag relationship schema
export const candidateTagSchema = z.object({
  id: uuidSchema,
  candidateId: uuidSchema,
  tagId: uuidSchema,
  proficiency: proficiencySchema.optional(),
  yearsExperience: z.number().min(0, 'Years of experience must be positive').max(50, 'Years of experience must be less than 50').optional(),
  isEndorsed: z.boolean().default(false),
  createdAt: dateSchema,
});

// Create candidate tag schema
export const createCandidateTagSchema = z.object({
  tagId: uuidSchema,
  proficiency: proficiencySchema.optional(),
  yearsExperience: z.number().min(0, 'Years of experience must be positive').max(50, 'Years of experience must be less than 50').optional(),
});

// Bulk tag assignment schema
export const bulkTagAssignmentSchema = z.object({
  tags: z.array(z.object({
    tagId: uuidSchema,
    proficiency: proficiencySchema.optional(),
    yearsExperience: z.number().min(0).max(50).optional(),
  })).min(1, 'At least one tag is required').max(20, 'Maximum 20 tags allowed'),
});

// Candidate search filters
export const candidateSearchFiltersSchema = z.object({
  tags: z.array(uuidSchema).max(10, 'Maximum 10 tag filters allowed').optional(),
  experience: z.array(experienceLevelSchema).optional(),
  location: z.array(z.string()).max(5, 'Maximum 5 location filters allowed').optional(),
  remotePreference: z.array(remotePreferenceSchema).optional(),
  availability: z.array(availabilitySchema).optional(),
  salaryMin: salarySchema,
  salaryMax: salarySchema,
  isAnonymized: z.boolean().optional(),
  isActive: z.boolean().default(true),
}).refine(data => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'Minimum salary must be less than or equal to maximum salary',
  path: ['salaryMax'],
});

// File upload for resume/portfolio
export const candidateFileUploadSchema = z.object({
  type: z.enum(['resume', 'portfolio', 'cover_letter']),
  filename: z.string().min(1, 'Filename is required'),
  mimetype: z.string().refine(type => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return allowedTypes.includes(type);
  }, 'File type not allowed. Please upload PDF, DOC, DOCX, or TXT files'),
  size: z.number().min(1, 'File size must be positive').max(5 * 1024 * 1024, 'File size must be less than 5MB'),
});

// Profile visibility settings
export const profileVisibilitySchema = z.object({
  isAnonymized: z.boolean(),
  isActive: z.boolean(),
  showSalary: z.boolean().default(true),
  showLocation: z.boolean().default(true),
  showExperience: z.boolean().default(true),
  showContact: z.boolean().default(false),
});

// Type exports
export type CandidateProfileSchema = z.infer<typeof candidateProfileSchema>;
export type CreateCandidateProfileSchema = z.infer<typeof createCandidateProfileSchema>;
export type UpdateCandidateProfileSchema = z.infer<typeof updateCandidateProfileSchema>;
export type WorkExperienceSchema = z.infer<typeof workExperienceSchema>;
export type CreateWorkExperienceSchema = z.infer<typeof createWorkExperienceSchema>;
export type UpdateWorkExperienceSchema = z.infer<typeof updateWorkExperienceSchema>;
export type EducationSchema = z.infer<typeof educationSchema>;
export type CreateEducationSchema = z.infer<typeof createEducationSchema>;
export type UpdateEducationSchema = z.infer<typeof updateEducationSchema>;
export type TagSchema = z.infer<typeof tagSchema>;
export type CreateTagSchema = z.infer<typeof createTagSchema>;
export type CandidateTagSchema = z.infer<typeof candidateTagSchema>;
export type CreateCandidateTagSchema = z.infer<typeof createCandidateTagSchema>;
export type BulkTagAssignmentSchema = z.infer<typeof bulkTagAssignmentSchema>;
export type CandidateSearchFiltersSchema = z.infer<typeof candidateSearchFiltersSchema>;
export type CandidateFileUploadSchema = z.infer<typeof candidateFileUploadSchema>;
export type ProfileVisibilitySchema = z.infer<typeof profileVisibilitySchema>;