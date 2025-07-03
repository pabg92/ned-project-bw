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
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock validation middleware - we'll use this to extract the actual handler
let actualHandler: any = null;
jest.mock('@/lib/validations/middleware', () => ({
  withValidation: jest.fn((schemas, handler) => {
    actualHandler = handler;
    return async (request: any) => {
      let body = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      return handler({ body }, request);
    };
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

// Import the POST handler after mocks are set up
import { POST } from '@/app/api/v1/candidates/register/route';

describe('/api/v1/candidates/register', () => {
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

  const validCandidateData = {
    title: 'Senior Frontend Developer',
    summary: 'Experienced React developer with 5+ years of experience in building scalable web applications.',
    experience: 'senior',
    location: 'San Francisco, CA',
    remotePreference: 'hybrid',
    salaryMin: 120000,
    salaryMax: 180000,
    salaryCurrency: 'USD',
    availability: 'immediately',
    isAnonymized: true,
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    portfolioUrl: 'https://johndoe.dev',
    tags: ['react-tag-id', 'javascript-tag-id'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default database query chain mocking
    const createChainMock = (finalValue = []) => {
      const methods = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(finalValue),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(finalValue),
        set: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(finalValue),
      };
      return methods;
    };

    mockDb.select.mockImplementation(() => createChainMock());
    mockDb.insert.mockImplementation(() => createChainMock());
    mockDb.update.mockImplementation(() => createChainMock());
  });

  describe('POST /api/v1/candidates/register', () => {
    it('should create a new candidate profile successfully', async () => {
      // Mock authenticated user
      mockAuth.mockReturnValue({ userId: mockUserId });

      // Mock user lookup
      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      // Mock no existing profile
      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      // Mock profile creation
      const createdProfile = {
        id: 'profile_123',
        userId: mockUserId,
        ...validCandidateData,
        salaryMin: validCandidateData.salaryMin.toString(),
        salaryMax: validCandidateData.salaryMax.toString(),
        profileCompleted: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([createdProfile]),
      };
      mockDb.insert.mockReturnValue(insertChain);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/v1/candidates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCandidateData),
      });

      // Execute
      const response = await POST(request);
      expect(response).toBeDefined();
      
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Profile created successfully');
      expect(responseData.data.id).toBe('profile_123');
      expect(responseData.data.title).toBe(validCandidateData.title);
      expect(responseData.data.profileCompletion.isCompleted).toBe(true);
    });

    it('should update existing candidate profile', async () => {
      // Mock authenticated user
      mockAuth.mockReturnValue({ userId: mockUserId });

      // Mock user lookup
      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      // Mock existing profile
      const existingProfile = {
        id: 'profile_123',
        userId: mockUserId,
        title: 'Junior Developer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingProfile]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      // Mock profile update
      const updatedProfile = {
        ...existingProfile,
        ...validCandidateData,
        salaryMin: validCandidateData.salaryMin.toString(),
        salaryMax: validCandidateData.salaryMax.toString(),
        profileCompleted: true,
        updatedAt: new Date(),
      };

      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedProfile]),
      };
      mockDb.update.mockReturnValue(updateChain);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/v1/candidates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCandidateData),
      });

      // Execute
      const response = await POST(request);
      expect(response).toBeDefined();
      
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Profile updated successfully');
      expect(responseData.data.title).toBe(validCandidateData.title);
    });

    it('should reject unauthenticated requests', async () => {
      // Mock no authentication
      mockAuth.mockReturnValue({ userId: null });

      // Create request
      const request = new NextRequest('http://localhost:3000/api/v1/candidates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCandidateData),
      });

      // Execute
      const response = await POST(request);
      expect(response).toBeDefined();
      
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(401);
      expect(responseData.error).toBe('AUTHENTICATION_ERROR');
      expect(responseData.message).toBe('Authentication required');
    });

    it('should reject non-candidate users', async () => {
      // Mock authenticated user with wrong role
      mockAuth.mockReturnValue({ userId: mockUserId });

      // Mock user lookup with company role - this should return empty array since the user doesn't match the criteria
      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]), // No user found that matches candidate role criteria
      };
      mockDb.select.mockReturnValue(userChain);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/v1/candidates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCandidateData),
      });

      // Execute
      const response = await POST(request);
      expect(response).toBeDefined();
      
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(403);
      expect(responseData.error).toBe('AUTHORIZATION_ERROR');
      expect(responseData.message).toBe('User not found or not authorized as candidate');
    });

    it('should handle database errors gracefully', async () => {
      // Mock authenticated user
      mockAuth.mockReturnValue({ userId: mockUserId });

      // Mock user lookup
      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      // Mock database error on profile lookup
      const errorChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      mockDb.select.mockReturnValueOnce(errorChain);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/v1/candidates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCandidateData),
      });

      // Execute
      const response = await POST(request);
      expect(response).toBeDefined();
      
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(responseData.error).toBe('INTERNAL_SERVER_ERROR');
      expect(responseData.message).toBe('Internal server error during registration');
    });

    it('should calculate profile completion correctly', async () => {
      // Mock authenticated user
      mockAuth.mockReturnValue({ userId: mockUserId });

      // Mock user lookup
      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDb.select.mockReturnValueOnce(userChain);

      // Mock no existing profile
      const profileChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValueOnce(profileChain);

      // Incomplete profile data (missing some required fields)
      const incompleteData = {
        title: 'Developer',
        summary: 'A developer',
        experience: 'mid',
        // Missing location, remotePreference, availability
      };

      // Mock profile creation
      const createdProfile = {
        id: 'profile_123',
        userId: mockUserId,
        ...incompleteData,
        profileCompleted: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([createdProfile]),
      };
      mockDb.insert.mockReturnValue(insertChain);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/v1/candidates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      // Execute
      const response = await POST(request);
      expect(response).toBeDefined();
      
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(201);
      expect(responseData.data.profileCompletion.isCompleted).toBe(false);
      expect(responseData.data.profileCompletion.requiredCompleted).toBeLessThan(6);
      expect(responseData.data.profileCompletion.missingRequired).toContain('location');
      expect(responseData.data.profileCompletion.missingRequired).toContain('remotePreference');
      expect(responseData.data.profileCompletion.missingRequired).toContain('availability');
    });
  });
});