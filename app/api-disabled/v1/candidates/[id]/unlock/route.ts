import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/supabase/client';
import { 
  candidateProfiles, 
  candidateTags,
  tags,
  workExperiences,
  education,
  companies,
  companyUsers,
  profileViews,
  users
} from '@/lib/supabase/schema';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';

/**
 * GET /api/v1/candidates/[id]/unlock
 * Get full candidate profile after payment verification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Authentication required', 401);
    }

    const candidateId = params.id;

    // Verify company membership
    const companyUser = await db.query.companyUsers.findFirst({
      where: eq(companyUsers.userId, userId),
      with: {
        company: true,
      },
    });

    if (!companyUser) {
      return createErrorResponse('Access denied: Company membership required', 403);
    }

    const company = companyUser.company;

    // Check if company has purchased access to this profile
    const profilePurchase = await db.query.profileViews.findFirst({
      where: and(
        eq(profileViews.candidateId, candidateId),
        eq(profileViews.companyId, company.id),
        eq(profileViews.viewType, 'purchased')
      ),
    });

    if (!profilePurchase) {
      return createErrorResponse('Profile access not purchased. Please complete payment first.', 402);
    }

    // Get full candidate profile with all related data
    const candidate = await db.query.candidateProfiles.findFirst({
      where: eq(candidateProfiles.id, candidateId),
      with: {
        user: {
          columns: {
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!candidate) {
      return createErrorResponse('Candidate not found', 404);
    }

    // Get candidate tags/skills
    const candidateTagsData = await db
      .select({
        tagId: tags.id,
        tagName: tags.name,
        tagCategory: tags.category,
        proficiency: candidateTags.proficiency,
        yearsExperience: candidateTags.yearsExperience,
        isEndorsed: candidateTags.isEndorsed,
      })
      .from(candidateTags)
      .innerJoin(tags, eq(candidateTags.tagId, tags.id))
      .where(eq(candidateTags.candidateId, candidateId));

    // Get work experiences
    const experiences = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.candidateId, candidateId))
      .orderBy(workExperiences.order);

    // Get education
    const educationRecords = await db
      .select()
      .from(education)
      .where(eq(education.candidateId, candidateId))
      .orderBy(education.order);

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion({
      ...candidate,
      tags: candidateTagsData,
      workExperiences: experiences,
      education: educationRecords,
    });

    // Build complete unlocked profile
    const unlockedProfile = {
      // Basic profile information
      id: candidate.id,
      title: candidate.title,
      summary: candidate.summary,
      experience: candidate.experience,
      location: candidate.location,
      remotePreference: candidate.remotePreference,
      availability: candidate.availability,
      
      // Contact information (only available after purchase)
      contact: {
        firstName: candidate.user?.firstName,
        lastName: candidate.user?.lastName,
        email: candidate.user?.email,
        profileImage: candidate.user?.imageUrl,
        linkedinUrl: candidate.linkedinUrl,
        githubUrl: candidate.githubUrl,
        portfolioUrl: candidate.portfolioUrl,
      },
      
      // Salary information (unredacted)
      salary: {
        min: candidate.salaryMin ? parseFloat(candidate.salaryMin) : null,
        max: candidate.salaryMax ? parseFloat(candidate.salaryMax) : null,
        currency: candidate.salaryCurrency,
      },
      
      // Skills and expertise
      skills: candidateTagsData.map(tag => ({
        id: tag.tagId,
        name: tag.tagName,
        category: tag.tagCategory,
        proficiency: tag.proficiency,
        yearsExperience: tag.yearsExperience,
        isEndorsed: tag.isEndorsed,
      })),
      
      // Work experience
      workExperience: experiences.map(exp => ({
        id: exp.id,
        company: exp.company,
        title: exp.title,
        description: exp.description,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        isRemote: exp.isRemote,
      })),
      
      // Education
      education: educationRecords.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        gpa: edu.gpa ? parseFloat(edu.gpa) : null,
        startDate: edu.startDate,
        endDate: edu.endDate,
        description: edu.description,
      })),
      
      // Files and documents
      documents: {
        resumeUrl: candidate.resumeUrl,
        portfolioUrl: candidate.portfolioUrl,
      },
      
      // Profile metadata
      profileCompletion,
      isAnonymized: false, // Profile is unlocked
      lastUpdated: candidate.updatedAt,
      
      // Purchase information
      purchase: {
        purchaseDate: profilePurchase.createdAt,
        paymentId: profilePurchase.paymentId,
        amount: profilePurchase.paymentAmount ? parseFloat(profilePurchase.paymentAmount) : null,
        currency: profilePurchase.currency,
      },
    };

    // Log the profile access for analytics
    await logProfileAccess(company.id, userId, candidateId, 'full_view');

    return createSuccessResponse(unlockedProfile, 'Full candidate profile retrieved successfully');

  } catch (error) {
    console.error('Profile unlock error:', error);
    return createErrorResponse('Failed to retrieve unlocked profile', 500);
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
  
  if (profile.tags && profile.tags.length > 0) {
    completedFields += 5; // Tags present
  }
  if (profile.workExperiences && profile.workExperiences.length > 0) {
    completedFields += 5; // Work experience present
  }
  if (profile.education && profile.education.length > 0) {
    completedFields += 5; // Education present
  }

  return Math.round((completedFields / totalFields) * 100);
}

/**
 * Log profile access for analytics
 */
async function logProfileAccess(
  companyId: string,
  userId: string,
  candidateId: string,
  accessType: string
) {
  try {
    console.log('Profile access logged:', {
      companyId,
      userId,
      candidateId,
      accessType,
      timestamp: new Date().toISOString(),
    });
    
    // Future: Could store in analytics table or send to analytics service
  } catch (error) {
    console.error('Failed to log profile access:', error);
    // Don't fail the request if logging fails
  }
}