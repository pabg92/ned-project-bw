import { describe, it, expect } from '@jest/globals';
import {
  candidateProfileSchema,
  createCandidateProfileSchema,
  updateCandidateProfileSchema,
  workExperienceSchema,
  createWorkExperienceSchema,
  updateWorkExperienceSchema,
  educationSchema,
  createEducationSchema,
  updateEducationSchema,
  tagSchema,
  createTagSchema,
  candidateTagSchema,
  createCandidateTagSchema,
  bulkTagAssignmentSchema,
  candidateSearchFiltersSchema,
  candidateFileUploadSchema,
  profileVisibilitySchema,
} from '../../../src/lib/validations/candidate';

describe('Candidate Validation Schemas', () => {
  describe('candidateProfileSchema', () => {
    it('should validate complete candidate profile', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123',
        title: 'Senior Software Engineer',
        summary: 'Experienced developer with 5+ years in React and Node.js',
        experience: 'senior',
        location: 'San Francisco, CA',
        remotePreference: 'hybrid',
        salaryMin: 120000,
        salaryMax: 150000,
        salaryCurrency: 'USD',
        availability: '1month',
        isAnonymized: true,
        isActive: true,
        profileCompleted: true,
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        githubUrl: 'https://github.com/johndoe',
        portfolioUrl: 'https://johndoe.dev',
        resumeUrl: 'https://example.com/resume.pdf',
        privateMetadata: { realName: 'John Doe' },
        publicMetadata: { skills: ['React', 'Node.js'] },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(() => candidateProfileSchema.parse(validProfile)).not.toThrow();
    });

    it('should validate profile with minimal required fields', () => {
      const minimalProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123',
        salaryCurrency: 'USD',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(() => candidateProfileSchema.parse(minimalProfile)).not.toThrow();
    });

    it('should reject profile with invalid salary range', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123',
        salaryMin: 150000,
        salaryMax: 120000, // Max less than min
        salaryCurrency: 'USD',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(() => candidateProfileSchema.parse(invalidProfile)).toThrow();
    });

    it('should reject profile with invalid experience level', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user_123',
        experience: 'expert', // Not a valid experience level
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      expect(() => candidateProfileSchema.parse(invalidProfile)).toThrow();
    });
  });

  describe('createCandidateProfileSchema', () => {
    it('should validate create profile data', () => {
      const validCreateData = {
        title: 'Frontend Developer',
        summary: 'Passionate about creating beautiful user interfaces',
        experience: 'mid',
        location: 'Remote',
        remotePreference: 'remote',
        salaryMin: 80000,
        salaryMax: 100000,
        salaryCurrency: 'USD',
        availability: 'immediately',
        isAnonymized: false,
        linkedinUrl: 'https://linkedin.com/in/janedoe',
        githubUrl: 'https://github.com/janedoe',
        portfolioUrl: 'https://janedoe.com',
        tags: ['123e4567-e89b-12d3-a456-426614174000'],
      };

      expect(() => createCandidateProfileSchema.parse(validCreateData)).not.toThrow();
    });

    it('should use default currency when not provided', () => {
      const createData = {
        title: 'Developer',
        summary: 'A great developer',
        experience: 'junior',
        location: 'New York',
        remotePreference: 'onsite',
        availability: '2weeks',
      };

      const result = createCandidateProfileSchema.parse(createData);
      expect(result.salaryCurrency).toBe('USD');
    });

    it('should reject too many tags', () => {
      const invalidCreateData = {
        title: 'Developer',
        summary: 'A great developer',
        experience: 'junior',
        location: 'New York',
        remotePreference: 'onsite',
        availability: '2weeks',
        tags: Array(25).fill('123e4567-e89b-12d3-a456-426614174000'), // Too many tags
      };

      expect(() => createCandidateProfileSchema.parse(invalidCreateData)).toThrow();
    });

    it('should reject summary that is too short', () => {
      const invalidCreateData = {
        title: 'Developer',
        summary: 'Short', // Too short
        experience: 'junior',
        location: 'New York',
        remotePreference: 'onsite',
        availability: '2weeks',
      };

      expect(() => createCandidateProfileSchema.parse(invalidCreateData)).toThrow();
    });
  });

  describe('workExperienceSchema', () => {
    it('should validate work experience', () => {
      const validExperience = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        company: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Developed web applications using React and Node.js',
        location: 'San Francisco, CA',
        startDate: '2020-01-01T00:00:00Z',
        endDate: '2023-01-01T00:00:00Z',
        isCurrent: false,
        isRemote: true,
        order: 1,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => workExperienceSchema.parse(validExperience)).not.toThrow();
    });

    it('should validate current position without end date', () => {
      const currentPosition = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        company: 'Current Corp',
        title: 'Senior Engineer',
        startDate: '2023-01-01T00:00:00Z',
        isCurrent: true,
        isRemote: false,
        order: 0,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => workExperienceSchema.parse(currentPosition)).not.toThrow();
    });

    it('should reject current position with end date', () => {
      const invalidExperience = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        company: 'Tech Corp',
        title: 'Engineer',
        startDate: '2020-01-01T00:00:00Z',
        endDate: '2023-01-01T00:00:00Z', // Should not have end date if current
        isCurrent: true,
        order: 0,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => workExperienceSchema.parse(invalidExperience)).toThrow();
    });

    it('should reject experience with end date before start date', () => {
      const invalidExperience = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        company: 'Tech Corp',
        title: 'Engineer',
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2020-01-01T00:00:00Z', // End before start
        isCurrent: false,
        order: 0,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => workExperienceSchema.parse(invalidExperience)).toThrow();
    });
  });

  describe('createWorkExperienceSchema', () => {
    it('should validate create work experience data', () => {
      const validCreateData = {
        company: 'New Tech Corp',
        title: 'Junior Developer',
        description: 'Learning and growing as a developer',
        location: 'Remote',
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z',
        isCurrent: false,
        isRemote: true,
        order: 1,
      };

      expect(() => createWorkExperienceSchema.parse(validCreateData)).not.toThrow();
    });

    it('should use default values', () => {
      const minimalData = {
        company: 'Tech Corp',
        title: 'Developer',
        startDate: '2023-01-01T00:00:00Z',
      };

      const result = createWorkExperienceSchema.parse(minimalData);
      expect(result.isCurrent).toBe(false);
      expect(result.isRemote).toBe(false);
      expect(result.order).toBe(0);
    });
  });

  describe('educationSchema', () => {
    it('should validate education record', () => {
      const validEducation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        gpa: 3.8,
        startDate: '2016-09-01T00:00:00Z',
        endDate: '2020-06-01T00:00:00Z',
        description: 'Focused on software engineering and algorithms',
        order: 1,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => educationSchema.parse(validEducation)).not.toThrow();
    });

    it('should validate education without GPA', () => {
      const educationWithoutGPA = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        institution: 'Local College',
        degree: 'Associate Degree',
        startDate: '2014-09-01T00:00:00Z',
        endDate: '2016-06-01T00:00:00Z',
        order: 0,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => educationSchema.parse(educationWithoutGPA)).not.toThrow();
    });

    it('should reject education with invalid GPA', () => {
      const invalidEducation = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        institution: 'University',
        degree: 'Degree',
        gpa: 5.0, // Invalid GPA > 4.0
        startDate: '2016-09-01T00:00:00Z',
        order: 0,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => educationSchema.parse(invalidEducation)).toThrow();
    });
  });

  describe('tagSchema', () => {
    it('should validate tag data', () => {
      const validTag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'React',
        category: 'skill',
        description: 'A JavaScript library for building user interfaces',
        color: '#61DAFB',
        isVerified: true,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => tagSchema.parse(validTag)).not.toThrow();
    });

    it('should use default color when not provided', () => {
      const tag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'JavaScript',
        category: 'skill',
        createdAt: '2023-01-01T00:00:00Z',
      };

      const result = tagSchema.parse(tag);
      expect(result.color).toBe('#3B82F6');
    });

    it('should reject tag with invalid color', () => {
      const invalidTag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'React',
        category: 'skill',
        color: 'invalid-color',
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => tagSchema.parse(invalidTag)).toThrow();
    });
  });

  describe('candidateTagSchema', () => {
    it('should validate candidate tag relationship', () => {
      const validCandidateTag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        tagId: '789e0123-e89b-12d3-a456-426614174000',
        proficiency: 'advanced',
        yearsExperience: 5,
        isEndorsed: true,
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => candidateTagSchema.parse(validCandidateTag)).not.toThrow();
    });

    it('should validate minimal candidate tag', () => {
      const minimalCandidateTag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        tagId: '789e0123-e89b-12d3-a456-426614174000',
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => candidateTagSchema.parse(minimalCandidateTag)).not.toThrow();
    });

    it('should reject invalid years of experience', () => {
      const invalidCandidateTag = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        candidateId: '456e7890-e89b-12d3-a456-426614174000',
        tagId: '789e0123-e89b-12d3-a456-426614174000',
        yearsExperience: 100, // Too high
        createdAt: '2023-01-01T00:00:00Z',
      };

      expect(() => candidateTagSchema.parse(invalidCandidateTag)).toThrow();
    });
  });

  describe('bulkTagAssignmentSchema', () => {
    it('should validate bulk tag assignment', () => {
      const validBulkAssignment = {
        tags: [
          {
            tagId: '123e4567-e89b-12d3-a456-426614174000',
            proficiency: 'advanced',
            yearsExperience: 5,
          },
          {
            tagId: '456e7890-e89b-12d3-a456-426614174000',
            proficiency: 'intermediate',
            yearsExperience: 3,
          },
        ],
      };

      expect(() => bulkTagAssignmentSchema.parse(validBulkAssignment)).not.toThrow();
    });

    it('should reject empty tag list', () => {
      const invalidBulkAssignment = {
        tags: [],
      };

      expect(() => bulkTagAssignmentSchema.parse(invalidBulkAssignment)).toThrow();
    });

    it('should reject too many tags', () => {
      const invalidBulkAssignment = {
        tags: Array(25).fill({
          tagId: '123e4567-e89b-12d3-a456-426614174000',
          proficiency: 'beginner',
        }),
      };

      expect(() => bulkTagAssignmentSchema.parse(invalidBulkAssignment)).toThrow();
    });
  });

  describe('candidateSearchFiltersSchema', () => {
    it('should validate search filters', () => {
      const validFilters = {
        tags: ['123e4567-e89b-12d3-a456-426614174000'],
        experience: ['junior', 'mid'],
        location: ['San Francisco', 'Remote'],
        remotePreference: ['remote', 'hybrid'],
        availability: ['immediately', '2weeks'],
        salaryMin: 80000,
        salaryMax: 120000,
        isAnonymized: true,
        isActive: true,
      };

      expect(() => candidateSearchFiltersSchema.parse(validFilters)).not.toThrow();
    });

    it('should validate minimal filters', () => {
      const minimalFilters = {};

      expect(() => candidateSearchFiltersSchema.parse(minimalFilters)).not.toThrow();
    });

    it('should reject invalid salary range', () => {
      const invalidFilters = {
        salaryMin: 120000,
        salaryMax: 80000, // Max less than min
      };

      expect(() => candidateSearchFiltersSchema.parse(invalidFilters)).toThrow();
    });

    it('should reject too many tag filters', () => {
      const invalidFilters = {
        tags: Array(15).fill('123e4567-e89b-12d3-a456-426614174000'), // Too many
      };

      expect(() => candidateSearchFiltersSchema.parse(invalidFilters)).toThrow();
    });
  });

  describe('candidateFileUploadSchema', () => {
    it('should validate PDF file upload', () => {
      const validFileUpload = {
        type: 'resume',
        filename: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024, // 2MB
      };

      expect(() => candidateFileUploadSchema.parse(validFileUpload)).not.toThrow();
    });

    it('should validate DOCX file upload', () => {
      const validFileUpload = {
        type: 'cover_letter',
        filename: 'cover_letter.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1024 * 1024, // 1MB
      };

      expect(() => candidateFileUploadSchema.parse(validFileUpload)).not.toThrow();
    });

    it('should reject unsupported file types', () => {
      const invalidFileUpload = {
        type: 'resume',
        filename: 'resume.jpg',
        mimetype: 'image/jpeg', // Not allowed
        size: 1024 * 1024,
      };

      expect(() => candidateFileUploadSchema.parse(invalidFileUpload)).toThrow();
    });

    it('should reject files that are too large', () => {
      const invalidFileUpload = {
        type: 'resume',
        filename: 'large_resume.pdf',
        mimetype: 'application/pdf',
        size: 10 * 1024 * 1024, // 10MB - too large
      };

      expect(() => candidateFileUploadSchema.parse(invalidFileUpload)).toThrow();
    });
  });

  describe('profileVisibilitySchema', () => {
    it('should validate profile visibility settings', () => {
      const validVisibility = {
        isAnonymized: false,
        isActive: true,
        showSalary: false,
        showLocation: true,
        showExperience: true,
        showContact: false,
      };

      expect(() => profileVisibilitySchema.parse(validVisibility)).not.toThrow();
    });

    it('should use default values', () => {
      const minimalVisibility = {
        isAnonymized: true,
        isActive: true,
      };

      const result = profileVisibilitySchema.parse(minimalVisibility);
      expect(result.showSalary).toBe(true);
      expect(result.showLocation).toBe(true);
      expect(result.showExperience).toBe(true);
      expect(result.showContact).toBe(false);
    });
  });
});