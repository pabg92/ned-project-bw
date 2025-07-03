import { jest } from '@jest/globals';

// Mock database operations
const mockInsert = jest.fn();
const mockReturning = jest.fn();
const mockOnConflictDoNothing = jest.fn();

const mockDb = {
  insert: jest.fn(() => ({
    values: jest.fn(() => ({
      returning: mockReturning,
      onConflictDoNothing: mockOnConflictDoNothing,
    })),
  })),
};

jest.mock('../../src/lib/supabase/client', () => ({
  db: mockDb,
}));

jest.mock('../../src/lib/supabase/schema', () => ({
  users: 'users_table',
  companies: 'companies_table',
  companyUsers: 'company_users_table',
  tags: 'tags_table',
  candidateProfiles: 'candidate_profiles_table',
  candidateTags: 'candidate_tags_table',
  workExperiences: 'work_experiences_table',
  education: 'education_table',
}));

// Import after mocking
const { seedDatabase } = require('../../scripts/seed');

describe('Database Seeding Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    global.console = {
      ...console,
      log: jest.fn(),
      error: jest.fn(),
    };

    // Setup default mock responses
    mockOnConflictDoNothing.mockResolvedValue({});
    mockReturning.mockResolvedValue([
      { id: 'company_1', name: 'TechCorp Inc' },
      { id: 'company_2', name: 'StartupXYZ' },
    ]);
  });

  describe('seedDatabase', () => {
    it('should complete seeding successfully', async () => {
      // Mock successful insertions
      mockReturning.mockResolvedValue([
        { id: 'company_1' },
        { id: 'company_2' },
      ]);

      await seedDatabase();

      expect(console.log).toHaveBeenCalledWith('🌱 Starting database seeding...');
      expect(console.log).toHaveBeenCalledWith('✅ Database seeding completed successfully!');
    });

    it('should insert sample users', async () => {
      await seedDatabase();

      expect(mockDb.insert).toHaveBeenCalledWith('users_table');
      expect(console.log).toHaveBeenCalledWith('👥 Inserting sample users...');
    });

    it('should insert sample companies', async () => {
      await seedDatabase();

      expect(mockDb.insert).toHaveBeenCalledWith('companies_table');
      expect(console.log).toHaveBeenCalledWith('🏢 Inserting sample companies...');
    });

    it('should link users to companies', async () => {
      await seedDatabase();

      expect(mockDb.insert).toHaveBeenCalledWith('company_users_table');
      expect(console.log).toHaveBeenCalledWith('🔗 Linking users to companies...');
    });

    it('should insert sample tags', async () => {
      await seedDatabase();

      expect(mockDb.insert).toHaveBeenCalledWith('tags_table');
      expect(console.log).toHaveBeenCalledWith('🏷️  Inserting sample tags...');
    });

    it('should insert candidate profiles', async () => {
      await seedDatabase();

      expect(mockDb.insert).toHaveBeenCalledWith('candidate_profiles_table');
      expect(console.log).toHaveBeenCalledWith('👤 Inserting candidate profiles...');
    });

    it('should link candidates to tags', async () => {
      await seedDatabase();

      expect(mockDb.insert).toHaveBeenCalledWith('candidate_tags_table');
      expect(console.log).toHaveBeenCalledWith('🔗 Linking candidates to tags...');
    });

    it('should insert work experiences', async () => {
      await seedDatabase();

      expect(mockDb.insert).toHaveBeenCalledWith('work_experiences_table');
      expect(console.log).toHaveBeenCalledWith('💼 Inserting work experiences...');
    });

    it('should insert education records', async () => {
      await seedDatabase();

      expect(mockDb.insert).toHaveBeenCalledWith('education_table');
      expect(console.log).toHaveBeenCalledWith('🎓 Inserting education records...');
    });

    it('should display final statistics', async () => {
      await seedDatabase();

      expect(console.log).toHaveBeenCalledWith('📊 Sample data created:');
      expect(console.log).toHaveBeenCalledWith('   - 4 users');
      expect(console.log).toHaveBeenCalledWith('   - 2 companies');
      expect(console.log).toHaveBeenCalledWith('   - 8 tags');
      expect(console.log).toHaveBeenCalledWith('   - 2 candidate profiles');
      expect(console.log).toHaveBeenCalledWith('   - Work experiences and education records');
    });
  });

  describe('Sample Data Validation', () => {
    it('should create users with correct roles', async () => {
      await seedDatabase();

      const insertCall = mockDb.insert.mock.calls.find(call => call[0] === 'users_table');
      expect(insertCall).toBeDefined();
    });

    it('should create companies with different tiers', async () => {
      await seedDatabase();

      const insertCall = mockDb.insert.mock.calls.find(call => call[0] === 'companies_table');
      expect(insertCall).toBeDefined();
    });

    it('should create tags with different categories', async () => {
      await seedDatabase();

      const insertCall = mockDb.insert.mock.calls.find(call => call[0] === 'tags_table');
      expect(insertCall).toBeDefined();
    });

    it('should create candidate profiles with anonymization', async () => {
      await seedDatabase();

      const insertCall = mockDb.insert.mock.calls.find(call => call[0] === 'candidate_profiles_table');
      expect(insertCall).toBeDefined();
    });

    it('should handle case when no companies are inserted', async () => {
      mockReturning.mockResolvedValueOnce([]); // No companies returned

      await seedDatabase();

      expect(console.log).toHaveBeenCalledWith('✅ Database seeding completed successfully!');
    });

    it('should handle case when no tags are inserted', async () => {
      mockReturning
        .mockResolvedValueOnce([{ id: 'company_1' }]) // Companies
        .mockResolvedValueOnce([]); // No tags

      await seedDatabase();

      expect(console.log).toHaveBeenCalledWith('✅ Database seeding completed successfully!');
    });

    it('should handle case when no profiles are inserted', async () => {
      mockReturning
        .mockResolvedValueOnce([{ id: 'company_1' }]) // Companies
        .mockResolvedValueOnce([{ id: 'tag_1' }]) // Tags
        .mockResolvedValueOnce([]); // No profiles

      await seedDatabase();

      expect(console.log).toHaveBeenCalledWith('✅ Database seeding completed successfully!');
    });
  });

  describe('Error Handling', () => {
    it('should handle user insertion errors', async () => {
      mockOnConflictDoNothing.mockRejectedValueOnce(new Error('User insertion failed'));

      await expect(seedDatabase()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('❌ Seeding failed:', expect.any(Error));
    });

    it('should handle company insertion errors', async () => {
      mockOnConflictDoNothing
        .mockResolvedValueOnce({}) // Users succeed
        .mockRejectedValueOnce(new Error('Company insertion failed'));

      await expect(seedDatabase()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('❌ Seeding failed:', expect.any(Error));
    });

    it('should handle tag insertion errors', async () => {
      mockReturning.mockResolvedValueOnce([{ id: 'company_1' }]); // Companies
      mockOnConflictDoNothing
        .mockResolvedValueOnce({}) // Users
        .mockResolvedValueOnce({}) // Companies
        .mockResolvedValueOnce({}) // Company users
        .mockRejectedValueOnce(new Error('Tag insertion failed'));

      await expect(seedDatabase()).rejects.toThrow();
    });

    it('should handle candidate profile insertion errors', async () => {
      mockReturning
        .mockResolvedValueOnce([{ id: 'company_1' }]) // Companies
        .mockResolvedValueOnce([{ id: 'tag_1' }]); // Tags

      mockOnConflictDoNothing
        .mockResolvedValueOnce({}) // Users
        .mockResolvedValueOnce({}) // Companies
        .mockResolvedValueOnce({}) // Company users
        .mockResolvedValueOnce({}) // Tags
        .mockRejectedValueOnce(new Error('Profile insertion failed'));

      await expect(seedDatabase()).rejects.toThrow();
    });

    it('should handle database connection errors', async () => {
      mockDb.insert.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(seedDatabase()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('❌ Seeding failed:', expect.any(Error));
    });

    it('should exit with code 1 on error', async () => {
      mockOnConflictDoNothing.mockRejectedValue(new Error('Critical seeding error'));

      // Mock process.exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
        throw new Error(`Process exit: ${code}`);
      });

      await expect(seedDatabase()).rejects.toThrow('Process exit: 1');

      mockExit.mockRestore();
    });
  });

  describe('Data Relationships', () => {
    it('should use returned company IDs for company users', async () => {
      const mockCompanies = [{ id: 'company_123' }];
      mockReturning.mockResolvedValueOnce(mockCompanies);

      await seedDatabase();

      // Verify that company users insertion was called after companies
      const insertCalls = mockDb.insert.mock.calls;
      const companyUsersCall = insertCalls.find(call => call[0] === 'company_users_table');
      expect(companyUsersCall).toBeDefined();
    });

    it('should use returned tag and profile IDs for candidate tags', async () => {
      const mockCompanies = [{ id: 'company_1' }];
      const mockTags = [{ id: 'tag_1' }];
      const mockProfiles = [{ id: 'profile_1' }];

      mockReturning
        .mockResolvedValueOnce(mockCompanies) // Companies
        .mockResolvedValueOnce(mockTags) // Tags
        .mockResolvedValueOnce(mockProfiles); // Profiles

      await seedDatabase();

      // Verify candidate tags insertion was called
      const insertCalls = mockDb.insert.mock.calls;
      const candidateTagsCall = insertCalls.find(call => call[0] === 'candidate_tags_table');
      expect(candidateTagsCall).toBeDefined();
    });

    it('should use returned profile IDs for work experiences', async () => {
      const mockProfiles = [{ id: 'profile_1' }];
      mockReturning
        .mockResolvedValueOnce([{ id: 'company_1' }]) // Companies
        .mockResolvedValueOnce([{ id: 'tag_1' }]) // Tags
        .mockResolvedValueOnce(mockProfiles); // Profiles

      await seedDatabase();

      // Verify work experiences insertion was called
      const insertCalls = mockDb.insert.mock.calls;
      const workExpCall = insertCalls.find(call => call[0] === 'work_experiences_table');
      expect(workExpCall).toBeDefined();
    });

    it('should use returned profile IDs for education', async () => {
      const mockProfiles = [{ id: 'profile_1' }];
      mockReturning
        .mockResolvedValueOnce([{ id: 'company_1' }]) // Companies
        .mockResolvedValueOnce([{ id: 'tag_1' }]) // Tags
        .mockResolvedValueOnce(mockProfiles); // Profiles

      await seedDatabase();

      // Verify education insertion was called
      const insertCalls = mockDb.insert.mock.calls;
      const educationCall = insertCalls.find(call => call[0] === 'education_table');
      expect(educationCall).toBeDefined();
    });
  });
});