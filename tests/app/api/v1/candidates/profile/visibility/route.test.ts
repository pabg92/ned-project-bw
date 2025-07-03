import { NextRequest } from 'next/server';
import { db } from '@/lib/supabase/client';
import { candidateProfiles, users } from '@/lib/supabase/schema';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock database
jest.mock('@/lib/supabase/client', () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock validation middleware
jest.mock('@/lib/validations/middleware', () => ({
  withValidation: jest.fn((schemas, handler) => async (request: any) => {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    return handler({ body }, request);
  }),
  createErrorResponse: (message: string, status: number, errors?: any) => {
    return new Response(JSON.stringify({
      error: status === 401 ? 'AUTHENTICATION_ERROR' : status === 403 ? 'AUTHORIZATION_ERROR' : status === 404 ? 'NOT_FOUND' : status === 500 ? 'INTERNAL_SERVER_ERROR' : 'VALIDATION_ERROR',
      message,
      details: errors ? { validationErrors: errors } : undefined,
      timestamp: new Date().toISOString(),
    }), { status });
  },
  createSuccessResponse: (data: any, message?: string, status: number = 200) => {
    return new Response(JSON.stringify({
      success: true,
      data,
      message,
    }), { status });
  },
}));

const mockAuth = require('@clerk/nextjs/server').auth as jest.Mock;
const mockDb = db as jest.Mocked<typeof db>;

// Import after mocks
import { GET, PUT, POST } from '@/app/api/v1/candidates/profile/visibility/route';

describe('/api/v1/candidates/profile/visibility', () => {
  const mockUserId = 'user_123456789';
  const mockUser = {
    id: mockUserId,
    email: 'candidate@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'candidate',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfile = {
    id: 'profile_123',
    isAnonymized: true,
    isActive: true,
    publicMetadata: {
      showSalary: true,
      showLocation: true,
      showExperience: true,
      showContact: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    const createChainMock = (finalValue = []) => {
      const methods = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(finalValue),
        set: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(finalValue),
      };
      return methods;
    };

    mockDb.select.mockImplementation(() => createChainMock());
    mockDb.update.mockImplementation(() => createChainMock());
  });

  describe('GET /api/v1/candidates/profile/visibility', () => {
    it('should retrieve visibility settings successfully', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockProfile]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Visibility settings retrieved successfully');
      expect(responseData.data.isAnonymized).toBe(true);
      expect(responseData.data.isActive).toBe(true);
      expect(responseData.data.showSalary).toBe(true);
      expect(responseData.data.showLocation).toBe(true);
      expect(responseData.data.showExperience).toBe(true);
      expect(responseData.data.showContact).toBe(false);
    });

    it('should use default values when metadata is missing', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const profileWithoutMetadata = {
        id: 'profile_123',
        isAnonymized: false,
        isActive: true,
        publicMetadata: null,
      };

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([profileWithoutMetadata]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.isAnonymized).toBe(false);
      expect(responseData.data.showSalary).toBe(true); // Default
      expect(responseData.data.showLocation).toBe(true); // Default
      expect(responseData.data.showExperience).toBe(true); // Default
      expect(responseData.data.showContact).toBe(false); // Default
    });

    it('should reject unauthenticated requests', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('AUTHENTICATION_ERROR');
      expect(responseData.message).toBe('Authentication required');
    });

    it('should return 404 when profile not found', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('NOT_FOUND');
      expect(responseData.message).toBe('Candidate profile not found');
    });
  });

  describe('PUT /api/v1/candidates/profile/visibility', () => {
    const updateData = {
      isAnonymized: false,
      isActive: true,
      showSalary: false,
      showLocation: true,
      showExperience: true,
      showContact: true,
    };

    it('should update visibility settings successfully', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockProfile]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      const updatedProfile = {
        id: 'profile_123',
        isAnonymized: updateData.isAnonymized,
        isActive: updateData.isActive,
        publicMetadata: {
          showSalary: updateData.showSalary,
          showLocation: updateData.showLocation,
          showExperience: updateData.showExperience,
          showContact: updateData.showContact,
          visibilityUpdatedAt: expect.any(String),
        },
        updatedAt: new Date(),
      };

      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedProfile]),
      };
      mockDb.update.mockReturnValue(updateChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Visibility settings updated successfully');
      expect(responseData.data.isAnonymized).toBe(updateData.isAnonymized);
      expect(responseData.data.showSalary).toBe(updateData.showSalary);
      expect(responseData.data.showContact).toBe(updateData.showContact);
    });

    it('should return 404 when profile not found for update', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('NOT_FOUND');
      expect(responseData.message).toBe('Candidate profile not found. Please create a profile first.');
    });
  });

  describe('POST /api/v1/candidates/profile/visibility/toggle-anonymity', () => {
    it('should toggle anonymity from true to false', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const anonymousProfile = {
        id: 'profile_123',
        isAnonymized: true,
      };

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([anonymousProfile]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      const updatedProfile = {
        id: 'profile_123',
        isAnonymized: false,
        updatedAt: new Date(),
      };

      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedProfile]),
      };
      mockDb.update.mockReturnValue(updateChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility/toggle-anonymity', {
        method: 'POST',
      });

      const response = await POST(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Profile de-anonymized successfully');
      expect(responseData.data.isAnonymized).toBe(false);
      expect(responseData.data.previousState).toBe(true);
    });

    it('should toggle anonymity from false to true', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const namedProfile = {
        id: 'profile_123',
        isAnonymized: false,
      };

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([namedProfile]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      const updatedProfile = {
        id: 'profile_123',
        isAnonymized: true,
        updatedAt: new Date(),
      };

      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedProfile]),
      };
      mockDb.update.mockReturnValue(updateChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility/toggle-anonymity', {
        method: 'POST',
      });

      const response = await POST(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Profile anonymized successfully');
      expect(responseData.data.isAnonymized).toBe(true);
      expect(responseData.data.previousState).toBe(false);
    });

    it('should reject unauthenticated requests', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility/toggle-anonymity', {
        method: 'POST',
      });

      const response = await POST(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('AUTHENTICATION_ERROR');
      expect(responseData.message).toBe('Authentication required');
    });

    it('should return 404 when profile not found', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility/toggle-anonymity', {
        method: 'POST',
      });

      const response = await POST(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('NOT_FOUND');
      expect(responseData.message).toBe('Candidate profile not found');
    });

    it('should handle database errors gracefully', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      const errorChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      mockDb.select.mockReturnValueOnce(errorChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile/visibility/toggle-anonymity', {
        method: 'POST',
      });

      const response = await POST(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('INTERNAL_SERVER_ERROR');
      expect(responseData.message).toBe('Internal server error during anonymity toggle');
    });
  });
});