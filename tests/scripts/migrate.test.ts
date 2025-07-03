import { jest } from '@jest/globals';
import { readFileSync } from 'fs';

// Mock dependencies
const mockSupabaseAdmin = {
  from: jest.fn(() => ({
    select: jest.fn(),
  })),
  rpc: jest.fn(),
};

const mockCreateStorageBuckets = jest.fn();

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

jest.mock('../../src/lib/supabase/client', () => ({
  supabaseAdmin: mockSupabaseAdmin,
  db: {
    $client: { query: jest.fn() },
  },
}));

jest.mock('../../src/lib/supabase/storage', () => ({
  createStorageBuckets: mockCreateStorageBuckets,
}));

// Import functions after mocking
const {
  runSQLFile,
  validateEnvironment,
  setupDatabase,
} = require('../../scripts/migrate');

describe('Migration Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

    // Mock console methods
    global.console = {
      ...console,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  });

  describe('validateEnvironment', () => {
    it('should pass validation with all required environment variables', () => {
      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      expect(() => validateEnvironment()).toThrow();
      expect(process.exit).toBeDefined();
    });

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => validateEnvironment()).toThrow();
    });

    it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => validateEnvironment()).toThrow();
    });

    it('should throw error when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;

      expect(() => validateEnvironment()).toThrow();
    });

    it('should identify multiple missing variables', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.DATABASE_URL;

      expect(() => validateEnvironment()).toThrow();
    });
  });

  describe('runSQLFile', () => {
    beforeEach(() => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      });
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });
    });

    it('should read and execute SQL file successfully', async () => {
      const mockSQL = `
        CREATE TABLE test_table (id SERIAL PRIMARY KEY);
        INSERT INTO test_table DEFAULT VALUES;
        -- This is a comment
        SELECT * FROM test_table;
      `;

      (readFileSync as jest.Mock).mockReturnValue(mockSQL);

      await runSQLFile('/path/to/test.sql', 'Test SQL');

      expect(readFileSync).toHaveBeenCalledWith('/path/to/test.sql', 'utf-8');
      expect(console.log).toHaveBeenCalledWith('🔄 Running Test SQL...');
      expect(console.log).toHaveBeenCalledWith('✅ Test SQL completed: 3 successful, 0 warnings');
    });

    it('should filter out empty statements and comments', async () => {
      const mockSQL = `
        CREATE TABLE test_table (id SERIAL PRIMARY KEY);
        -- This is a comment
        
        INSERT INTO test_table DEFAULT VALUES;
        ;
      `;

      (readFileSync as jest.Mock).mockReturnValue(mockSQL);

      await runSQLFile('/path/to/test.sql', 'Test SQL');

      // Should only execute non-empty, non-comment statements
      expect(console.log).toHaveBeenCalledWith('✅ Test SQL completed: 2 successful, 0 warnings');
    });

    it('should handle SQL execution errors gracefully', async () => {
      const mockSQL = 'CREATE TABLE test_table (id SERIAL PRIMARY KEY);';

      (readFileSync as jest.Mock).mockReturnValue(mockSQL);
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: { message: 'Table already exists' } });

      await runSQLFile('/path/to/test.sql', 'Test SQL');

      expect(console.warn).toHaveBeenCalledWith('⚠️  Warning in Test SQL: Table already exists');
      expect(console.log).toHaveBeenCalledWith('✅ Test SQL completed: 0 successful, 1 warnings');
    });

    it('should handle file read errors', async () => {
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(runSQLFile('/path/to/nonexistent.sql', 'Test SQL')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('❌ Error running Test SQL:', expect.any(Error));
    });

    it('should handle multiple statements with mixed results', async () => {
      const mockSQL = `
        CREATE TABLE test1 (id SERIAL);
        CREATE TABLE test2 (id SERIAL);
        INVALID SQL STATEMENT;
      `;

      (readFileSync as jest.Mock).mockReturnValue(mockSQL);
      
      // Mock different responses for different statements
      mockSupabaseAdmin.rpc
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: { message: 'Syntax error' } });

      await runSQLFile('/path/to/test.sql', 'Test SQL');

      expect(console.log).toHaveBeenCalledWith('✅ Test SQL completed: 2 successful, 1 warnings');
    });
  });

  describe('setupDatabase', () => {
    beforeEach(() => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      });
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });
      mockCreateStorageBuckets.mockResolvedValue(undefined);
      (readFileSync as jest.Mock).mockReturnValue('CREATE TABLE test (id SERIAL);');
    });

    it('should complete full database setup successfully', async () => {
      await setupDatabase();

      expect(console.log).toHaveBeenCalledWith('🚀 Starting NED Backend Database Migration');
      expect(console.log).toHaveBeenCalledWith('✅ Database connection successful');
      expect(mockCreateStorageBuckets).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('🎉 Database migration completed successfully!');
    });

    it('should handle database connection test', async () => {
      await setupDatabase();

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('_migration_temp');
      expect(console.log).toHaveBeenCalledWith('✅ Database connection successful');
    });

    it('should handle database connection failure', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Connection failed' } 
        }),
      });

      await setupDatabase();

      expect(console.error).toHaveBeenCalledWith('❌ Database connection failed:', expect.any(Object));
    });

    it('should run RLS policies before indexes', async () => {
      const consoleLogs: string[] = [];
      (console.log as jest.Mock).mockImplementation((msg) => {
        consoleLogs.push(msg);
      });

      await setupDatabase();

      const rlsIndex = consoleLogs.findIndex(log => log.includes('Row Level Security Policies'));
      const indexesIndex = consoleLogs.findIndex(log => log.includes('Performance Indexes'));

      expect(rlsIndex).toBeLessThan(indexesIndex);
    });

    it('should set up storage buckets after SQL files', async () => {
      const consoleLogs: string[] = [];
      (console.log as jest.Mock).mockImplementation((msg) => {
        consoleLogs.push(msg);
      });

      await setupDatabase();

      const indexesIndex = consoleLogs.findIndex(log => log.includes('Performance Indexes'));
      const storageIndex = consoleLogs.findIndex(log => log.includes('Setting up storage buckets'));

      expect(indexesIndex).toBeLessThan(storageIndex);
    });

    it('should handle storage bucket setup errors gracefully', async () => {
      mockCreateStorageBuckets.mockRejectedValue(new Error('Storage setup failed'));

      await setupDatabase();

      expect(console.log).toHaveBeenCalledWith('⚠️  Drizzle connection test skipped (may require actual database)');
    });

    it('should test Drizzle connection', async () => {
      await setupDatabase();

      expect(console.log).toHaveBeenCalledWith('✅ Drizzle ORM connection ready');
    });

    it('should provide next steps after successful setup', async () => {
      await setupDatabase();

      expect(console.log).toHaveBeenCalledWith('📋 Next steps:');
      expect(console.log).toHaveBeenCalledWith('1. Verify your environment variables are set correctly');
      expect(console.log).toHaveBeenCalledWith('2. Test the application with sample data');
      expect(console.log).toHaveBeenCalledWith('3. Configure Clerk webhooks to point to your API');
      expect(console.log).toHaveBeenCalledWith('4. Set up Stripe webhooks for payment processing');
    });

    it('should handle migration errors and exit with code 1', async () => {
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Critical migration error');
      });

      // Mock process.exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
        throw new Error(`Process exit: ${code}`);
      });

      await expect(setupDatabase()).rejects.toThrow('Process exit: 1');
      expect(console.error).toHaveBeenCalledWith('❌ Migration failed:', expect.any(Error));

      mockExit.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing SQL files gracefully', async () => {
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      await expect(runSQLFile('/nonexistent/file.sql', 'Missing File')).rejects.toThrow();
    });

    it('should handle empty SQL files', async () => {
      (readFileSync as jest.Mock).mockReturnValue('');

      await runSQLFile('/path/to/empty.sql', 'Empty SQL');

      expect(console.log).toHaveBeenCalledWith('✅ Empty SQL completed: 0 successful, 0 warnings');
    });

    it('should handle SQL files with only comments', async () => {
      (readFileSync as jest.Mock).mockReturnValue(`
        -- This is just a comment
        /* Another comment */
        -- More comments
      `);

      await runSQLFile('/path/to/comments.sql', 'Comments Only');

      expect(console.log).toHaveBeenCalledWith('✅ Comments Only completed: 0 successful, 0 warnings');
    });
  });
});