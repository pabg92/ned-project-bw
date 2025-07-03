import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockVerify = jest.fn();
const mockClerkClient = {
  users: {
    getUser: jest.fn(),
    updateUserMetadata: jest.fn(),
  },
};

jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: mockVerify,
  })),
}));

jest.mock('@clerk/backend', () => ({
  clerkClient: mockClerkClient,
}));

// Mock headers function for each test
const mockHeaders = jest.fn();
const mockGet = jest.fn();

jest.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Import after mocking
const { POST } = require('../../../../../src/app/api/webhooks/clerk/route');

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = 'test-webhook-secret';
    
    // Setup headers mock to return values based on header name
    mockGet.mockImplementation((headerName: string) => {
      switch (headerName) {
        case 'svix-id': return 'test-id';
        case 'svix-timestamp': return 'test-timestamp';
        case 'svix-signature': return 'test-signature';
        default: return null;
      }
    });
    
    mockHeaders.mockReturnValue({
      get: mockGet,
    });

    // Setup successful webhook verification by default
    mockVerify.mockImplementation(() => ({
      type: 'user.created',
      data: {
        id: 'user_123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
      },
    }));

    // Setup Clerk client mocks
    mockClerkClient.users.updateUserMetadata.mockResolvedValue({});
    mockClerkClient.users.getUser.mockResolvedValue({
      id: 'user_123',
      unsafeMetadata: {},
    });
  });

  describe('Webhook Verification', () => {
    it('should verify webhook signature successfully', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'John',
          last_name: 'Doe',
        },
      };

      // Don't override the mockVerify - it's already set up in beforeEach
      mockClerkClient.users.updateUserMetadata.mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockVerify).toHaveBeenCalled();
    });

    it('should return 400 for missing headers', async () => {
      // Mock missing headers
      jest.mocked(require('next/headers').headers).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid signature', async () => {
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should throw error when webhook secret is missing', async () => {
      delete process.env.CLERK_WEBHOOK_SECRET;

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      await expect(POST(request)).rejects.toThrow(
        'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
      );
    });
  });

  describe('User Created Event', () => {
    it('should handle user.created event successfully', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'John',
          last_name: 'Doe',
        },
      };

      mockVerify.mockReturnValue(mockEvent);
      mockClerkClient.users.updateUserMetadata.mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        'user_123',
        {
          publicMetadata: {},
          privateMetadata: {},
          unsafeMetadata: {
            role: 'candidate',
            isActive: true,
            createdAt: expect.any(String),
          },
        }
      );
    });

    it('should handle user.created with minimal data', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [],
        },
      };

      mockVerify.mockReturnValue(mockEvent);
      mockClerkClient.users.updateUserMetadata.mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalled();
    });

    it('should handle user creation metadata update errors', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
        },
      };

      mockVerify.mockReturnValue(mockEvent);
      mockClerkClient.users.updateUserMetadata.mockRejectedValue(new Error('Update failed'));

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('User Updated Event', () => {
    it('should handle user.updated event successfully', async () => {
      const mockEvent = {
        type: 'user.updated',
        data: {
          id: 'user_123',
        },
      };

      mockVerify.mockReturnValue(mockEvent);

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('User Deleted Event', () => {
    it('should handle user.deleted event successfully', async () => {
      const mockEvent = {
        type: 'user.deleted',
        data: {
          id: 'user_123',
        },
      };

      mockVerify.mockReturnValue(mockEvent);

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Session Created Event', () => {
    it('should handle session.created event successfully', async () => {
      const mockEvent = {
        type: 'session.created',
        data: {
          user_id: 'user_123',
        },
      };

      const mockUser = {
        id: 'user_123',
        unsafeMetadata: {
          role: 'candidate',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      mockVerify.mockReturnValue(mockEvent);
      mockClerkClient.users.getUser.mockResolvedValue(mockUser);
      mockClerkClient.users.updateUserMetadata.mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockClerkClient.users.getUser).toHaveBeenCalledWith('user_123');
      expect(mockClerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        'user_123',
        {
          unsafeMetadata: {
            role: 'candidate',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            lastLogin: expect.any(String),
          },
        }
      );
    });

    it('should handle session.created with missing user', async () => {
      const mockEvent = {
        type: 'session.created',
        data: {
          user_id: 'user_123',
        },
      };

      mockVerify.mockReturnValue(mockEvent);
      mockClerkClient.users.getUser.mockRejectedValue(new Error('User not found'));

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Unknown Event Types', () => {
    it('should handle unknown event types gracefully', async () => {
      const mockEvent = {
        type: 'unknown.event',
        data: {
          id: 'test_123',
        },
      };

      mockVerify.mockReturnValue(mockEvent);

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for processing errors', async () => {
      const mockEvent = {
        type: 'user.created',
        data: {
          id: 'user_123',
        },
      };

      mockVerify.mockReturnValue(mockEvent);
      mockClerkClient.users.updateUserMetadata.mockRejectedValue(new Error('Processing failed'));

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('should handle JSON parsing errors', async () => {
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid JSON');
      });

      const request = new NextRequest('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});