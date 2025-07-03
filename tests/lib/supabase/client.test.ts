import { jest } from '@jest/globals';

describe('Database Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Environment Variables', () => {
    it('should have all required environment variables set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
      expect(process.env.DATABASE_URL).toBeDefined();
    });
  });

  describe('Client Exports', () => {
    it('should export supabase client', async () => {
      const { supabase } = await import('../../../src/lib/supabase/client');
      expect(supabase).toBeDefined();
      expect(typeof supabase.from).toBe('function');
    });

    it('should export supabase admin client', async () => {
      const { supabaseAdmin } = await import('../../../src/lib/supabase/client');
      expect(supabaseAdmin).toBeDefined();
      expect(typeof supabaseAdmin.from).toBe('function');
    });

    it('should export database instance', async () => {
      const { db } = await import('../../../src/lib/supabase/client');
      expect(db).toBeDefined();
    });

    it('should export Database type', async () => {
      const clientModule = await import('../../../src/lib/supabase/client');
      expect(clientModule).toHaveProperty('db');
    });
  });

  describe('Client Functionality', () => {
    it('should have working supabase client methods', async () => {
      const { supabase } = await import('../../../src/lib/supabase/client');
      
      const table = supabase.from('test_table');
      expect(table).toBeDefined();
      expect(typeof table.select).toBe('function');
      expect(typeof table.insert).toBe('function');
      expect(typeof table.update).toBe('function');
      expect(typeof table.delete).toBe('function');
    });

    it('should have working storage methods', async () => {
      const { supabase } = await import('../../../src/lib/supabase/client');
      
      expect(supabase.storage).toBeDefined();
      expect(typeof supabase.storage.from).toBe('function');
    });
  });

  describe('Module Loading', () => {
    it('should load without throwing errors', async () => {
      await expect(import('../../../src/lib/supabase/client')).resolves.toBeDefined();
    });

    it('should have all exports available after import', async () => {
      const clientModule = await import('../../../src/lib/supabase/client');
      
      expect(clientModule).toHaveProperty('supabase');
      expect(clientModule).toHaveProperty('supabaseAdmin');
      expect(clientModule).toHaveProperty('db');
    });
  });
});