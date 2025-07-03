import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Import the GET function from the health route
const { GET } = require('../../../../src/app/api/health/route');

describe('Health Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 with healthy status', async () => {
      const request = new NextRequest('http://localhost/api/health');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'NED Backend API',
        version: '1.0.0',
      });
    });

    it('should return current timestamp', async () => {
      const beforeTime = new Date();
      
      const request = new NextRequest('http://localhost/api/health');
      const response = await GET(request);
      
      const afterTime = new Date();
      const data = await response.json();

      const responseTime = new Date(data.timestamp);
      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should have correct response headers', async () => {
      const request = new NextRequest('http://localhost/api/health');
      const response = await GET(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should handle request method correctly', async () => {
      const request = new NextRequest('http://localhost/api/health', {
        method: 'GET',
      });
      
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should be idempotent', async () => {
      const request1 = new NextRequest('http://localhost/api/health');
      const request2 = new NextRequest('http://localhost/api/health');

      const response1 = await GET(request1);
      const response2 = await GET(request2);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.status).toBe(data2.status);
      expect(data1.service).toBe(data2.service);
      expect(data1.version).toBe(data2.version);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn().mockImplementation(() => {
        throw new Error('JSON stringify failed');
      });

      try {
        const request = new NextRequest('http://localhost/api/health');
        const response = await GET(request);

        // Should still return a response even if JSON processing fails
        expect(response).toBeDefined();
      } finally {
        // Restore original JSON.stringify
        JSON.stringify = originalStringify;
      }
    });

    it('should handle invalid request gracefully', async () => {
      // Test that GET function works even with edge cases
      const request = new NextRequest('http://localhost/api/health?invalid=param');

      // Should not throw an error
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Response Format', () => {
    it('should return JSON response', async () => {
      const request = new NextRequest('http://localhost/api/health');
      const response = await GET(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should have all required fields', async () => {
      const request = new NextRequest('http://localhost/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('service');
      expect(data).toHaveProperty('version');
    });

    it('should have correct data types', async () => {
      const request = new NextRequest('http://localhost/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(typeof data.status).toBe('string');
      expect(typeof data.timestamp).toBe('string');
      expect(typeof data.service).toBe('string');
      expect(typeof data.version).toBe('string');
    });

    it('should return valid ISO timestamp', async () => {
      const request = new NextRequest('http://localhost/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(() => new Date(data.timestamp)).not.toThrow();
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });
});