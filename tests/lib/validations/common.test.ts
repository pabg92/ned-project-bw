import { describe, it, expect } from '@jest/globals';
import {
  emailSchema,
  passwordSchema,
  uuidSchema,
  urlSchema,
  phoneSchema,
  currencySchema,
  salarySchema,
  dateSchema,
  positiveIntegerSchema,
  colorSchema,
  paginationSchema,
  experienceLevelSchema,
  remotePreferenceSchema,
  availabilitySchema,
  proficiencySchema,
  tagCategorySchema,
  companySizeSchema,
  companyTierSchema,
  subscriptionStatusSchema,
  fileUploadSchema,
  apiResponseSchema,
} from '../../../src/lib/validations/common';
import { z } from 'zod';

describe('Common Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example',
        'a'.repeat(250) + '@example.com', // Too long
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'Password123',
        'StrongP@ss1',
        'MySecure123',
        'ComplexPwd1!',
      ];

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'short',           // Too short
        'password',        // No uppercase or numbers
        'PASSWORD123',     // No lowercase
        'Password',        // No numbers
        'password123',     // No uppercase
        'a'.repeat(130),   // Too long
      ];

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });
  });

  describe('uuidSchema', () => {
    it('should validate correct UUIDs', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
      ];

      validUUIDs.forEach(uuid => {
        expect(() => uuidSchema.parse(uuid)).not.toThrow();
      });
    });

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        '',
        'not-a-uuid',
        '123',
        '123e4567-e89b-12d3-a456-42661417400', // Too short
        '123e4567-e89b-12d3-a456-4266141740000', // Too long
        'gggggggg-gggg-gggg-gggg-gggggggggggg', // Invalid characters
      ];

      invalidUUIDs.forEach(uuid => {
        expect(() => uuidSchema.parse(uuid)).toThrow();
      });
    });
  });

  describe('urlSchema', () => {
    it('should validate correct URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://test.org',
        'https://sub.domain.com/path?query=1',
        'ftp://files.example.com',
        '',
      ];

      validURLs.forEach(url => {
        expect(() => urlSchema.parse(url)).not.toThrow();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidURLs = [
        'not-a-url',
        'example.com',
        'http://',
        '://invalid',
      ];

      invalidURLs.forEach(url => {
        expect(() => urlSchema.parse(url)).toThrow();
      });
    });
  });

  describe('phoneSchema', () => {
    it('should validate phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '1234567890',
        '+44123456789',
        undefined,
      ];

      validPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).not.toThrow();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        'invalid-phone',
        '+',
        '123-456-7890',
        '+1234567890123456789', // Too long
      ];

      invalidPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).toThrow();
      });
    });
  });

  describe('currencySchema', () => {
    it('should validate currency codes', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];

      validCurrencies.forEach(currency => {
        const result = currencySchema.parse(currency);
        expect(result).toBe(currency);
      });
    });

    it('should use USD as default', () => {
      const result = currencySchema.parse(undefined);
      expect(result).toBe('USD');
    });

    it('should reject invalid currency codes', () => {
      const invalidCurrencies = [
        'us',        // Too short
        'USDD',      // Too long
        'usd',       // Lowercase
        '123',       // Numbers
        '',          // Empty
      ];

      invalidCurrencies.forEach(currency => {
        expect(() => currencySchema.parse(currency)).toThrow();
      });
    });
  });

  describe('salarySchema', () => {
    it('should validate salary amounts', () => {
      const validSalaries = [0, 50000, 100000.50, 9999999];

      validSalaries.forEach(salary => {
        expect(() => salarySchema.parse(salary)).not.toThrow();
      });
    });

    it('should reject invalid salary amounts', () => {
      const invalidSalaries = [-1000, 10000001]; // Negative or too high

      invalidSalaries.forEach(salary => {
        expect(() => salarySchema.parse(salary)).toThrow();
      });
    });
  });

  describe('dateSchema', () => {
    it('should validate and transform dates', () => {
      const validDates = [
        '2023-12-01T00:00:00Z',
        '2023-01-15T14:30:00.000Z',
        new Date('2023-06-01'),
      ];

      validDates.forEach(date => {
        const result = dateSchema.parse(date);
        expect(result).toBeInstanceOf(Date);
      });
    });

    it('should reject invalid dates', () => {
      const invalidDates = [
        'not-a-date',
        '2023-13-01', // Invalid month
        '2023-01-32', // Invalid day
        '',
      ];

      invalidDates.forEach(date => {
        expect(() => dateSchema.parse(date)).toThrow();
      });
    });
  });

  describe('positiveIntegerSchema', () => {
    it('should validate positive integers', () => {
      const validIntegers = [0, 1, 100, 1000000];

      validIntegers.forEach(int => {
        expect(() => positiveIntegerSchema.parse(int)).not.toThrow();
      });
    });

    it('should reject negative numbers and decimals', () => {
      const invalidIntegers = [-1, -100, 1.5, 2.7];

      invalidIntegers.forEach(int => {
        expect(() => positiveIntegerSchema.parse(int)).toThrow();
      });
    });
  });

  describe('colorSchema', () => {
    it('should validate hex colors', () => {
      const validColors = ['#FF0000', '#00ff00', '#0000FF', '#123', '#abc'];

      validColors.forEach(color => {
        expect(() => colorSchema.parse(color)).not.toThrow();
      });
    });

    it('should use default color', () => {
      const result = colorSchema.parse(undefined);
      expect(result).toBe('#3B82F6');
    });

    it('should reject invalid colors', () => {
      const invalidColors = [
        'red',        // Named color
        '#GGGGGG',    // Invalid hex
        '#12345',     // Wrong length
        'FF0000',     // Missing #
        '#',          // Just #
      ];

      invalidColors.forEach(color => {
        expect(() => colorSchema.parse(color)).toThrow();
      });
    });
  });

  describe('paginationSchema', () => {
    it('should validate pagination parameters', () => {
      const validPagination = [
        { page: '1', limit: '10' },
        { page: '2', limit: '25' },
        {},
        { sortBy: 'name', sortOrder: 'asc' },
      ];

      validPagination.forEach(pagination => {
        expect(() => paginationSchema.parse(pagination)).not.toThrow();
      });
    });

    it('should transform string values to numbers', () => {
      const result = paginationSchema.parse({ page: '5', limit: '20' });
      expect(result.page).toBe(5);
      expect(result.limit).toBe(20);
    });

    it('should use default values', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sortOrder).toBe('desc');
    });

    it('should reject invalid pagination values', () => {
      const invalidPagination = [
        { page: '0' },        // Page too low
        { limit: '0' },       // Limit too low
        { limit: '101' },     // Limit too high
        { sortOrder: 'invalid' }, // Invalid sort order
      ];

      invalidPagination.forEach(pagination => {
        expect(() => paginationSchema.parse(pagination)).toThrow();
      });
    });
  });

  describe('enum schemas', () => {
    describe('experienceLevelSchema', () => {
      it('should validate experience levels', () => {
        const validLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];
        
        validLevels.forEach(level => {
          expect(() => experienceLevelSchema.parse(level)).not.toThrow();
        });
      });

      it('should reject invalid experience levels', () => {
        const invalidLevels = ['beginner', 'expert', 'newbie', ''];
        
        invalidLevels.forEach(level => {
          expect(() => experienceLevelSchema.parse(level)).toThrow();
        });
      });
    });

    describe('remotePreferenceSchema', () => {
      it('should validate remote preferences', () => {
        const validPreferences = ['remote', 'hybrid', 'onsite', 'flexible'];
        
        validPreferences.forEach(pref => {
          expect(() => remotePreferenceSchema.parse(pref)).not.toThrow();
        });
      });
    });

    describe('availabilitySchema', () => {
      it('should validate availability options', () => {
        const validAvailability = ['immediately', '2weeks', '1month', '3months'];
        
        validAvailability.forEach(avail => {
          expect(() => availabilitySchema.parse(avail)).not.toThrow();
        });
      });
    });

    describe('proficiencySchema', () => {
      it('should validate proficiency levels', () => {
        const validProficiency = ['beginner', 'intermediate', 'advanced', 'expert'];
        
        validProficiency.forEach(prof => {
          expect(() => proficiencySchema.parse(prof)).not.toThrow();
        });
      });
    });
  });

  describe('fileUploadSchema', () => {
    it('should validate file upload data', () => {
      const validFile = {
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('test content'),
      };

      expect(() => fileUploadSchema.parse(validFile)).not.toThrow();
    });

    it('should reject files that are too large', () => {
      const largeFile = {
        filename: 'large.pdf',
        mimetype: 'application/pdf',
        size: 15 * 1024 * 1024, // 15MB
      };

      expect(() => fileUploadSchema.parse(largeFile)).toThrow();
    });

    it('should reject empty filenames', () => {
      const invalidFile = {
        filename: '',
        mimetype: 'application/pdf',
        size: 1024,
      };

      expect(() => fileUploadSchema.parse(invalidFile)).toThrow();
    });
  });

  describe('apiResponseSchema', () => {
    it('should validate API response structure', () => {
      const dataSchema = z.object({ id: z.string(), name: z.string() });
      const responseSchema = apiResponseSchema(dataSchema);

      const validResponse = {
        success: true,
        data: { id: '123', name: 'Test' },
        message: 'Success',
      };

      expect(() => responseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate error response', () => {
      const dataSchema = z.object({ id: z.string() });
      const responseSchema = apiResponseSchema(dataSchema);

      const errorResponse = {
        success: false,
        error: 'Validation failed',
        message: 'Invalid input data',
      };

      expect(() => responseSchema.parse(errorResponse)).not.toThrow();
    });

    it('should validate response with pagination', () => {
      const dataSchema = z.array(z.object({ id: z.string() }));
      const responseSchema = apiResponseSchema(dataSchema);

      const paginatedResponse = {
        success: true,
        data: [{ id: '1' }, { id: '2' }],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      expect(() => responseSchema.parse(paginatedResponse)).not.toThrow();
    });
  });
});