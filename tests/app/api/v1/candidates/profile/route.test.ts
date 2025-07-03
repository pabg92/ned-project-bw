import { NextRequest } from 'next/server';
import { db } from '@/lib/supabase/client';
import { candidateProfiles, users, candidateTags, tags, workExperiences, education } from '@/lib/supabase/schema';

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
import { GET, PUT } from '@/app/api/v1/candidates/profile/route';

describe('/api/v1/candidates/profile', () => {
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
    userId: mockUserId,
    title: 'Senior Frontend Developer',
    summary: 'Experienced React developer with 5+ years of experience.',
    experience: 'senior',
    location: 'San Francisco, CA',
    remotePreference: 'hybrid',
    salaryMin: '120000',
    salaryMax: '180000',
    salaryCurrency: 'USD',
    availability: 'immediately',
    isAnonymized: true,
    isActive: true,
    profileCompleted: true,
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    portfolioUrl: 'https://johndoe.dev',
    resumeUrl: 'https://resume.com/johndoe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTags = [
    {
      id: 'ct_1',
      tagId: 'tag_1',
      tagName: 'React',
      category: 'skill',
      proficiency: 'advanced',
      yearsExperience: 5,
      isEndorsed: true,
    },
    {
      id: 'ct_2',
      tagId: 'tag_2',
      tagName: 'JavaScript',
      category: 'skill',
      proficiency: 'expert',
      yearsExperience: 7,
      isEndorsed: false,
    },
  ];

  const mockExperiences = [
    {
      id: 'exp_1',
      candidateId: 'profile_123',
      company: 'Tech Corp',
      title: 'Senior Developer',
      description: 'Led frontend development team',
      location: 'San Francisco, CA',
      startDate: new Date('2022-01-01'),
      endDate: null,
      isCurrent: true,
      isRemote: true,
      order: 0,
      createdAt: new Date(),
    },
  ];

  const mockEducation = [
    {
      id: 'edu_1',
      candidateId: 'profile_123',
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      gpa: '3.8',
      startDate: new Date('2015-09-01'),
      endDate: new Date('2019-06-01'),
      description: 'Graduated with honors',
      order: 0,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    const createChainMock = (finalValue = []) => {
      const methods = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(finalValue),
        innerJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(finalValue),
        set: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(finalValue),
      };
      return methods;
    };

    mockDb.select.mockImplementation(() => createChainMock());
    mockDb.update.mockImplementation(() => createChainMock());
  });

  describe('GET /api/v1/candidates/profile', () => {
    it('should retrieve candidate profile with related data successfully', async () => {
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

      jest.spyOn(Promise, 'all').mockResolvedValue([mockTags, mockExperiences, mockEducation]);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Profile retrieved successfully');
      expect(responseData.data.id).toBe(mockProfile.id);
      expect(responseData.data.title).toBe(mockProfile.title);
      expect(responseData.data.tags).toHaveLength(2);
      expect(responseData.data.workExperiences).toHaveLength(1);
      expect(responseData.data.education).toHaveLength(1);
      expect(responseData.data.profileCompletion).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('AUTHENTICATION_ERROR');
      expect(responseData.message).toBe('Authentication required');
    });

    it('should reject non-candidate users', async () => {
      mockAuth.mockReturnValue({ userId: mockUserId });

      const userChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]), // No user matches candidate criteria
      };
      mockDb.select.mockReturnValue(userChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error).toBe('AUTHORIZATION_ERROR');
      expect(responseData.message).toBe('User not found or not authorized as candidate');
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

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile', {
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

  describe('PUT /api/v1/candidates/profile', () => {
    const updateData = {
      title: 'Lead Frontend Developer',
      summary: 'Updated summary with more experience.',
      location: 'Austin, TX',
      salaryMin: 140000,
      salaryMax: 200000,
    };

    it('should update candidate profile successfully', async () => {
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
        ...mockProfile,
        ...updateData,
        salaryMin: updateData.salaryMin.toString(),
        salaryMax: updateData.salaryMax.toString(),
        updatedAt: new Date(),
      };

      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedProfile]),
      };
      mockDb.update.mockReturnValue(updateChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Profile updated successfully');
      expect(responseData.data.title).toBe(updateData.title);
      expect(responseData.data.location).toBe(updateData.location);
      expect(responseData.data.salaryMin).toBe(updateData.salaryMin);
    });

    it('should handle partial updates correctly', async () => {
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

      const partialUpdate = { title: 'Staff Frontend Developer' };

      const updatedProfile = {
        ...mockProfile,
        title: partialUpdate.title,
        updatedAt: new Date(),
      };

      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedProfile]),
      };
      mockDb.update.mockReturnValue(updateChain);

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialUpdate),
      });

      const response = await PUT(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data.title).toBe(partialUpdate.title);
      expect(responseData.data.summary).toBe(mockProfile.summary);
      expect(responseData.data.location).toBe(mockProfile.location);
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

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile', {
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

      const request = new NextRequest('http://localhost:3000/api/v1/candidates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      expect(response).toBeDefined();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('INTERNAL_SERVER_ERROR');
      expect(responseData.message).toBe('Internal server error during profile update');
    });
  });
});