import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin-check';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { processProfileOnApproval } from '@/lib/services/admin-profile-processor';

// Validation schema for query parameters
const getCandidatesQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  search: z.string().optional(),
  experience: z.enum(['junior', 'mid', 'senior', 'lead', 'executive']).optional(),
  location: z.string().optional(),
  remotePreference: z.enum(['remote', 'hybrid', 'onsite', 'flexible']).optional(),
  availability: z.enum(['immediately', '2weeks', '1month', '3months']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'approved', 'rejected']).optional(),
  verification: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'title', 'experience', 'location']).optional().default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeInactive: z.string().optional().transform(val => val === 'true'),
});

// Create candidate schema
const createCandidateSchema = z.object({
  // User fields
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // Candidate profile fields
  title: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  experience: z.enum(['junior', 'mid', 'senior', 'lead', 'executive']).optional(),
  location: z.string().max(200).optional(),
  remotePreference: z.enum(['remote', 'hybrid', 'onsite', 'flexible']).optional(),
  availability: z.enum(['immediately', '2weeks', '1month', '3months']).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryCurrency: z.string().default('USD'),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  isAnonymized: z.boolean().default(true),
  adminNotes: z.string().max(50000).optional(), // Increased to handle JSON data
  processImmediately: z.boolean().optional(), // Flag to trigger immediate processing
});

type GetCandidatesQuery = z.infer<typeof getCandidatesQuerySchema>;

/**
 * GET /api/admin/candidates
 * Get all candidate profiles with admin-level access and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // In dev mode or test mode, skip admin authentication but still allow Supabase access
    const isDevMode = process.env.DEV_MODE === 'true';
    const isTestMode = process.env.TEST_MODE === 'true';
    
    if (!isDevMode && !isTestMode) {
      await requireAdmin();
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams: GetCandidatesQuery = getCandidatesQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      search: searchParams.get('search') || undefined,
      experience: searchParams.get('experience') || undefined,
      location: searchParams.get('location') || undefined,
      remotePreference: searchParams.get('remotePreference') || undefined,
      availability: searchParams.get('availability') || undefined,
      status: searchParams.get('status') || undefined,
      verification: searchParams.get('verification') || undefined,
      sortBy: searchParams.get('sortBy') || 'updated_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      includeInactive: searchParams.get('includeInactive') || 'false',
    });

    const { 
      page, 
      limit, 
      search, 
      experience, 
      location, 
      remotePreference, 
      availability, 
      status, 
      verification,
      sortBy, 
      sortOrder,
      includeInactive
    } = queryParams;

    // Variables for results
    let totalCandidates = 0;
    let candidatesData: any[] = [];
    let enhancedCandidates: any[] = [];

    // Only use mock data if we're in dev mode AND don't have Supabase configured
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_URL;
    const useMockData = isDevMode && !hasSupabase;

    if (useMockData) {
      // Mock data for dev mode when no database is available
      console.log('Dev mode without Supabase: Returning mock candidate data');
      
      totalCandidates = 3;
      const mockCandidates = [
        {
          id: 'mock-candidate-1',
          userId: 'mock-user-1',
          title: 'Senior Software Engineer',
          summary: 'Experienced full-stack developer with expertise in React, Node.js, and cloud technologies...',
          experience: 'senior',
          location: 'London, UK',
          remotePreference: 'hybrid',
          availability: '1month',
          isActive: true,
          profileCompleted: true,
          isAnonymized: false,
          salaryMin: '80000',
          salaryMax: '120000',
          salaryCurrency: 'GBP',
          linkedinUrl: 'https://linkedin.com/in/mockuser1',
          githubUrl: 'https://github.com/mockuser1',
          portfolioUrl: 'https://mockuser1.dev',
          resumeUrl: null,
          privateMetadata: { verificationStatus: 'verified', backgroundCheckStatus: 'completed' },
          publicMetadata: {},
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-06-01'),
          userEmail: 'john.doe@example.com',
          userFirstName: 'John',
          userLastName: 'Doe',
          userImageUrl: null,
          userIsActive: true,
          userCreatedAt: new Date('2024-01-15'),
          userLastLogin: new Date('2024-06-01'),
        },
        {
          id: 'mock-candidate-2',
          userId: 'mock-user-2',
          title: 'Product Manager',
          summary: 'Strategic product leader with 8+ years experience in fintech and SaaS products...',
          experience: 'senior',
          location: 'Manchester, UK',
          remotePreference: 'remote',
          availability: 'immediately',
          isActive: true,
          profileCompleted: false,
          isAnonymized: true,
          salaryMin: '70000',
          salaryMax: '100000',
          salaryCurrency: 'GBP',
          linkedinUrl: 'https://linkedin.com/in/mockuser2',
          githubUrl: null,
          portfolioUrl: null,
          resumeUrl: 'https://example.com/resume2.pdf',
          privateMetadata: { verificationStatus: 'pending', backgroundCheckStatus: 'not_required' },
          publicMetadata: {},
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-05-15'),
          userEmail: 'jane.smith@example.com',
          userFirstName: 'Jane',
          userLastName: 'Smith',
          userImageUrl: null,
          userIsActive: true,
          userCreatedAt: new Date('2024-02-10'),
          userLastLogin: new Date('2024-05-15'),
        },
        {
          id: 'mock-candidate-3',
          userId: 'mock-user-3',
          title: 'UX Designer',
          summary: 'Creative UX/UI designer specializing in mobile and web applications...',
          experience: 'mid',
          location: 'Edinburgh, UK',
          remotePreference: 'flexible',
          availability: '2weeks',
          isActive: true,
          profileCompleted: true,
          isAnonymized: false,
          salaryMin: '45000',
          salaryMax: '65000',
          salaryCurrency: 'GBP',
          linkedinUrl: null,
          githubUrl: null,
          portfolioUrl: 'https://mockdesigner.portfolio.com',
          resumeUrl: null,
          privateMetadata: { verificationStatus: 'unverified', backgroundCheckStatus: 'not_required' },
          publicMetadata: {},
          createdAt: new Date('2024-03-20'),
          updatedAt: new Date('2024-05-28'),
          userEmail: 'alex.designer@example.com',
          userFirstName: 'Alex',
          userLastName: 'Designer',
          userImageUrl: null,
          userIsActive: true,
          userCreatedAt: new Date('2024-03-20'),
          userLastLogin: new Date('2024-05-28'),
        },
      ];

      // Apply simple filtering for demo
      candidatesData = mockCandidates.filter(candidate => {
        if (search) {
          const searchLower = search.toLowerCase();
          return candidate.title.toLowerCase().includes(searchLower) ||
                 candidate.summary.toLowerCase().includes(searchLower) ||
                 candidate.location.toLowerCase().includes(searchLower) ||
                 candidate.userFirstName.toLowerCase().includes(searchLower) ||
                 candidate.userLastName.toLowerCase().includes(searchLower) ||
                 candidate.userEmail.toLowerCase().includes(searchLower);
        }
        return true;
      });

      if (experience) {
        candidatesData = candidatesData.filter(candidate => candidate.experience === experience);
      }

      totalCandidates = candidatesData.length;

      // Apply pagination
      const offset = (page - 1) * limit;
      candidatesData = candidatesData.slice(offset, offset + limit);

      // Mock enhanced candidates
      enhancedCandidates = candidatesData.map((candidate) => ({
        id: candidate.id,
        user: {
          id: candidate.userId,
          email: candidate.userEmail,
          firstName: candidate.userFirstName,
          lastName: candidate.userLastName,
          imageUrl: candidate.userImageUrl,
          isActive: candidate.userIsActive,
          createdAt: candidate.userCreatedAt,
          lastLogin: candidate.userLastLogin,
        },
        profile: {
          title: candidate.title,
          summary: candidate.summary ? candidate.summary.substring(0, 200) + '...' : null,
          experience: candidate.experience,
          location: candidate.location,
          remotePreference: candidate.remotePreference,
          availability: candidate.availability,
          salary: {
            min: candidate.salaryMin ? parseFloat(candidate.salaryMin) : null,
            max: candidate.salaryMax ? parseFloat(candidate.salaryMax) : null,
            currency: candidate.salaryCurrency,
          },
          documents: {
            hasResume: !!candidate.resumeUrl,
            hasPortfolio: !!candidate.portfolioUrl,
            hasLinkedIn: !!candidate.linkedinUrl,
            hasGitHub: !!candidate.githubUrl,
          },
        },
        status: {
          isActive: candidate.isActive,
          profileCompleted: candidate.profileCompleted,
          isAnonymized: candidate.isAnonymized,
          profileCompletion: Math.floor(Math.random() * 40) + 60, // Mock 60-100%
        },
        counts: {
          skills: Math.floor(Math.random() * 10) + 3, // Mock 3-12 skills
          experience: Math.floor(Math.random() * 3) + 1, // Mock 1-3 experiences
          education: Math.floor(Math.random() * 2) + 1, // Mock 1-2 education entries
        },
        adminData: {
          verificationStatus: candidate.privateMetadata?.verificationStatus || 'unverified',
          backgroundCheckStatus: candidate.privateMetadata?.backgroundCheckStatus || 'not_required',
          skillAssessmentScore: Math.floor(Math.random() * 30) + 70, // Mock 70-100
          hasAdminNotes: Math.random() > 0.5,
          lastUpdatedBy: 'admin-dev',
          lastUpdatedAt: new Date().toISOString(),
        },
        timestamps: {
          createdAt: candidate.createdAt,
          updatedAt: candidate.updatedAt,
        },
      }));
    } else {
      // Real database queries using Supabase
      // Build query for candidates with users
      // We need to specify which foreign key relationship to use
      let query = supabaseAdmin
        .from('candidate_profiles')
        .select(`
          *,
          users!candidate_profiles_user_id_fkey(
            id,
            email,
            first_name,
            last_name,
            image_url,
            is_active,
            created_at,
            last_login
          )
        `, { count: 'exact' });

      // Apply filters
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,location.ilike.%${search}%`);
      }
      
      if (experience) {
        query = query.eq('experience', experience);
      }
      
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      
      if (remotePreference) {
        query = query.eq('remote_preference', remotePreference);
      }
      
      if (availability) {
        query = query.eq('availability', availability);
      }
      
      if (status === 'active') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      }
      
      if (verification) {
        query = query.eq('private_metadata->>verificationStatus', verification);
      }

      // Apply sorting
      const sortField = {
        created_at: 'created_at',
        updated_at: 'updated_at',
        title: 'title',
        experience: 'experience',
        location: 'location',
      }[sortBy] || 'updated_at';
      
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data: fetchedCandidates, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      candidatesData = fetchedCandidates || [];
      totalCandidates = count || 0;

      console.log('Fetched candidates:', {
        dataLength: candidatesData.length,
        totalCount: totalCandidates,
        page,
        limit
      });

      // Enhance candidates with additional data
      enhancedCandidates = await Promise.all(
        (candidatesData || []).map(async (candidate) => {
          // Get counts for related data
          const { count: skillsCount } = await supabaseAdmin
            .from('candidate_tags')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_id', candidate.id);

          const { count: experienceCount } = await supabaseAdmin
            .from('work_experiences')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_id', candidate.id);

          const { count: educationCount } = await supabaseAdmin
            .from('education')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_id', candidate.id);

          const user = candidate.users;
          
          // Calculate profile completion
          const profileCompletion = calculateProfileCompletion({
            ...candidate,
            skillsCount: skillsCount || 0,
            experienceCount: experienceCount || 0,
            educationCount: educationCount || 0,
          });

          return {
            id: candidate.id,
            user: {
              id: candidate.user_id,
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              imageUrl: user.image_url,
              isActive: user.is_active,
              createdAt: user.created_at,
              lastLogin: user.last_login,
            },
            profile: {
              title: candidate.title,
              summary: candidate.summary ? candidate.summary.substring(0, 200) + '...' : null,
              experience: candidate.experience,
              location: candidate.location,
              remotePreference: candidate.remote_preference,
              availability: candidate.availability,
              salary: {
                min: candidate.salary_min ? parseFloat(candidate.salary_min) : null,
                max: candidate.salary_max ? parseFloat(candidate.salary_max) : null,
                currency: candidate.salary_currency,
              },
              documents: {
                hasResume: !!candidate.resume_url,
                hasPortfolio: !!candidate.portfolio_url,
                hasLinkedIn: !!candidate.linkedin_url,
                hasGitHub: !!candidate.github_url,
              },
            },
            status: {
              isActive: candidate.is_active,
              profileCompleted: candidate.profile_completed,
              isAnonymized: candidate.is_anonymized,
              profileCompletion,
            },
            counts: {
              skills: skillsCount || 0,
              experience: experienceCount || 0,
              education: educationCount || 0,
            },
            adminData: {
              verificationStatus: candidate.private_metadata?.verificationStatus || 'unverified',
              backgroundCheckStatus: candidate.private_metadata?.backgroundCheckStatus || 'not_required',
              skillAssessmentScore: candidate.private_metadata?.skillAssessmentScore,
              hasAdminNotes: !!candidate.private_metadata?.adminNotes,
              lastUpdatedBy: candidate.private_metadata?.lastUpdatedBy,
              lastUpdatedAt: candidate.private_metadata?.lastUpdatedAt,
            },
            timestamps: {
              createdAt: candidate.created_at,
              updatedAt: candidate.updated_at,
            },
          };
        })
      );
    }

    const totalPages = Math.ceil(totalCandidates / limit);

    return createSuccessResponse({
      candidates: enhancedCandidates,
      pagination: {
        page,
        limit,
        totalCandidates,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
        experience,
        location,
        remotePreference,
        availability,
        status,
        verification,
        sortBy,
        sortOrder,
        includeInactive,
      },
      summary: {
        totalShown: enhancedCandidates.length,
        totalCandidates,
        activeFilters: Object.entries({ search, experience, location, remotePreference, availability, status, verification })
          .filter(([_, value]) => value !== undefined).length,
      },
    }, `Retrieved ${enhancedCandidates.length} candidates`);

  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }

    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid query parameters', 400, error.errors);
    }

    console.error('Admin candidates list error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    return createErrorResponse('Failed to retrieve candidates', 500);
  }
}

/**
 * POST /api/admin/candidates
 * Create a new candidate profile (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // In dev mode or test mode, skip admin authentication but still allow Supabase access
    const isDevMode = process.env.DEV_MODE === 'true';
    const isTestMode = process.env.TEST_MODE === 'true';
    let adminUser: any = null;
    
    if (!isDevMode && !isTestMode) {
      adminUser = await requireAdmin();
    } else {
      // Mock admin user for dev/test mode
      adminUser = { id: isDevMode ? 'dev-admin' : 'test-admin', email: isDevMode ? 'admin@dev.com' : 'admin@test.com' };
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCandidateSchema.parse(body);

    const {
      userId,
      email,
      firstName,
      lastName,
      salaryMin,
      salaryMax,
      adminNotes,
      ...profileData
    } = validatedData;

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      // Set the admin user ID in the session for the audit trigger
      // This is needed for the database trigger to work properly
      if (adminUser && adminUser.id) {
        try {
          await supabaseAdmin.rpc('set_config', {
            setting: 'app.current_user_id',
            value: adminUser.id
          });
        } catch (e) {
          console.warn('Could not set session config for audit logging:', e);
        }
      }
      
      // Create user with provided details
      const { data: newUser, error: userCreateError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email,
          first_name: firstName || null,
          last_name: lastName || null,
          role: 'candidate',
          is_active: true,
        })
        .select()
        .single();
      
      if (userCreateError) {
        console.error('Failed to create user:', userCreateError);
        if (userCreateError.code === '23505') { // Unique constraint violation
          return createErrorResponse('A user with this email already exists', 409);
        }
        if (userCreateError.code === '23502' && userCreateError.message?.includes('admin_id')) {
          // This is the audit log trigger issue - try without triggers
          console.warn('Audit log trigger issue, attempting direct insert without audit');
          // For now, we'll just skip the audit log in dev mode
          if (isDevMode || isTestMode) {
            // In dev/test mode, ignore audit log failures
          } else {
            return createErrorResponse('Failed to create user due to audit log configuration', 500);
          }
        } else {
          return createErrorResponse('Failed to create user', 500);
        }
      }
    } else if (existingUser.role !== 'candidate') {
      return createErrorResponse('User must have candidate role', 400);
    }

    // Check if candidate profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      return createErrorResponse('Candidate profile already exists for this user', 409);
    }

    // Prepare private metadata
    const privateMetadata = {
      verificationStatus: 'unverified',
      backgroundCheckStatus: 'not_required',
      ...(adminNotes && { adminNotes }),
      createdBy: adminUser.id,
      createdAt: new Date().toISOString(),
    };

    // Convert camelCase to snake_case for database columns
    const dbProfileData = {
      user_id: userId,
      title: profileData.title,
      summary: profileData.summary,
      experience: profileData.experience,
      location: profileData.location,
      remote_preference: profileData.remotePreference,
      availability: profileData.availability,
      salary_min: salaryMin?.toString(),
      salary_max: salaryMax?.toString(),
      salary_currency: profileData.salaryCurrency,
      linkedin_url: profileData.linkedinUrl,
      github_url: profileData.githubUrl,
      portfolio_url: profileData.portfolioUrl,
      resume_url: profileData.resumeUrl,
      is_active: profileData.isActive,
      is_anonymized: profileData.isAnonymized,
      private_metadata: privateMetadata,
      public_metadata: {},
    };

    // Create candidate profile in database
    const { data: newCandidate, error: insertError } = await supabaseAdmin
      .from('candidate_profiles')
      .insert(dbProfileData)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return createErrorResponse('Failed to create candidate profile', 500);
    }

    // Process profile immediately if flag is set (for admin-created profiles)
    if (validatedData.processImmediately) {
      try {
        console.log('Processing profile immediately for:', newCandidate.id);
        const processingResult = await processProfileOnApproval(newCandidate.id, adminUser.id);
        
        if (processingResult.success) {
          console.log('Profile processed successfully:', newCandidate.id);
          
          // Update profile to active and completed
          await supabaseAdmin
            .from('candidate_profiles')
            .update({
              is_active: true,
              profile_completed: true,
              private_metadata: {
                ...newCandidate.private_metadata,
                approvalStatus: 'approved',
                approvedBy: adminUser.id,
                approvedAt: new Date().toISOString(),
              }
            })
            .eq('id', newCandidate.id);
        } else {
          console.error('Failed to process profile:', processingResult.error);
          // Continue anyway - profile is created but needs manual processing
        }
      } catch (processError) {
        console.error('Error processing profile:', processError);
        // Don't fail the creation - just log the error
      }
    }

    // Log admin action (skip in dev mode to avoid further DB issues)
    if (!isDevMode && !isTestMode) {
      try {
        await logAdminAction(adminUser.id, 'candidate_create', newCandidate.id, {
          userId,
          createdFields: Object.keys(validatedData),
          processedImmediately: validatedData.processImmediately || false,
        });
      } catch (logError) {
        console.warn('Failed to log admin action:', logError);
        // Don't fail the request if logging fails
      }
    }

    return createSuccessResponse({
      candidateId: newCandidate.id,
      userId: newCandidate.user_id,
      adminData: {
        verificationStatus: validatedData.processImmediately ? 'verified' : 'unverified',
        createdBy: adminUser.id,
        processedImmediately: validatedData.processImmediately || false,
      },
    }, isDevMode ? 'Candidate profile created successfully (dev mode)' : isTestMode ? 'Candidate profile created successfully (test mode)' : 'Candidate profile created successfully', 201);

  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('Access denied')) {
      return createErrorResponse(error.message, error.message.includes('Authentication') ? 401 : 403);
    }

    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return createErrorResponse('Invalid request data', 400, error.errors);
    }

    console.error('Admin candidate creation error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    return createErrorResponse(error.message || 'Failed to create candidate profile', 500);
  }
}

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(profile: any): number {
  let completedFields = 0;
  let totalFields = 0;

  // Required fields (60% weight)
  const requiredFields = [
    'title', 'summary', 'experience', 'location', 'remotePreference', 'availability'
  ];
  
  requiredFields.forEach(field => {
    totalFields += 10; // Each required field worth 10 points
    if (profile[field]) {
      completedFields += 10;
    }
  });

  // Optional fields (25% weight)
  const optionalFields = [
    'salaryMin', 'salaryMax', 'linkedinUrl', 'githubUrl', 'portfolioUrl'
  ];
  
  optionalFields.forEach(field => {
    totalFields += 5; // Each optional field worth 5 points
    if (profile[field]) {
      completedFields += 5;
    }
  });

  // Bonus content (15% weight)
  totalFields += 15; // 15 points for bonus content
  
  if (profile.skillsCount > 0) {
    completedFields += 5; // Skills present
  }
  if (profile.experienceCount > 0) {
    completedFields += 5; // Work experience present
  }
  if (profile.educationCount > 0) {
    completedFields += 5; // Education present
  }

  return Math.round((completedFields / totalFields) * 100);
}

/**
 * Log admin action for audit trail
 */
async function logAdminAction(
  adminUserId: string,
  action: string,
  targetId: string,
  metadata: any
) {
  try {
    console.log('Admin action logged:', {
      adminUserId,
      action,
      targetId,
      metadata,
      timestamp: new Date().toISOString(),
    });
    
    // Future: Store in audit log table or send to monitoring service
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't fail the request if logging fails
  }
}