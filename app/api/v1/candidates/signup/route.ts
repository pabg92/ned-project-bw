import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/validations/middleware';
import { z } from 'zod';

// Schema for public signup
const publicSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(50, 'Professional bio must be at least 50 characters'),
  experience: z.enum(['junior', 'mid', 'senior', 'lead', 'executive']),
  location: z.string().min(1, 'Location is required'),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  adminNotes: z.string().optional(),
});

// Parse the admin notes to extract structured data
interface SignupMetadata {
  phone?: string;
  company?: string;
  industry?: string;
  boardExperience?: boolean;
  boardPositions?: number;
  boardDetails?: string;
  workExperiences?: Array<{
    companyName: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    isBoardPosition: boolean;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationDate: string;
  }>;
  tags?: Array<{ name: string; category: string }>;
  activelySeeking?: boolean;
  availability?: string;
  remotePreference?: string;
  willingToRelocate?: boolean;
  compensationMin?: string;
  compensationMax?: string;
  yearsExperience?: number;
}

/**
 * POST /api/v1/candidates/signup
 * Public endpoint for candidate registration
 */
export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const body = await request.json();
    console.log('[SIGNUP] Received data:', {
      ...body,
      summary: body.summary ? `${body.summary.substring(0, 50)}... (${body.summary.length} chars)` : 'undefined'
    });
    const validatedData = publicSignupSchema.parse(body);

    // Parse admin notes if they contain JSON metadata
    let metadata: SignupMetadata = {};
    if (validatedData.adminNotes) {
      try {
        metadata = JSON.parse(validatedData.adminNotes);
      } catch (e) {
        console.log('[SIGNUP] Admin notes are not JSON, treating as plain text');
      }
    }

    // Generate a unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('[SIGNUP] Starting signup process');
    console.log('[SIGNUP] Generated user ID:', userId);
    console.log('[SIGNUP] Email:', validatedData.email);

    // First, create the user record
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: validatedData.email,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        role: 'candidate',
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.error('[SIGNUP] Failed to create user:', userError);
      console.error('[SIGNUP] Error details:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
      if (userError.code === '23505') {
        return createErrorResponse('A user with this email already exists', 409);
      }
      return createErrorResponse('Failed to create user account', 500);
    }

    // Create the candidate profile
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .insert({
        user_id: userId,
        title: validatedData.title,
        summary: validatedData.summary,
        experience: validatedData.experience,
        location: validatedData.location,
        remote_preference: metadata.remotePreference || 'flexible',
        availability: metadata.availability || 'immediately',
        linkedin_url: validatedData.linkedinUrl || null,
        is_active: false, // Requires admin approval
        profile_completed: false, // Will be set to true when admin approves
        is_anonymized: true,
        salary_min: metadata.compensationMin || null,
        salary_max: metadata.compensationMax || null,
        salary_currency: 'GBP',
        private_metadata: {
          signupDate: new Date().toISOString(),
          verificationStatus: 'unverified',
          company: metadata.company,
          industry: metadata.industry,
          boardDetails: metadata.boardDetails,
          phone: metadata.phone,
          activelySeeking: metadata.activelySeeking,
          willingToRelocate: metadata.willingToRelocate,
          boardExperience: metadata.boardExperience,
          boardPositions: metadata.boardPositions,
          yearsExperience: metadata.yearsExperience,
          boardPositionsData: metadata.workExperiences?.filter(exp => exp.isBoardPosition),
        }
      })
      .select()
      .single();

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      // Try to clean up the user if profile creation failed
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);
      
      return createErrorResponse('Failed to create candidate profile', 500);
    }

    // Process work experiences
    if (metadata.workExperiences && metadata.workExperiences.length > 0) {
      console.log('[SIGNUP] Processing work experiences:', metadata.workExperiences.length);
      const workExperiencesToInsert = metadata.workExperiences
        .filter(exp => exp.companyName && exp.title)
        .map(exp => ({
          candidate_id: newProfile.id,
          company_name: exp.companyName,
          position: exp.title,
          start_date: exp.startDate,
          end_date: exp.isCurrent ? null : exp.endDate,
          is_current: exp.isCurrent,
          description: exp.description || null,
          // location: exp.location || null, // Column doesn't exist
          // is_board_position: exp.isBoardPosition || false // Column needs to be added to DB
        }));

      if (workExperiencesToInsert.length > 0) {
        const { error: workError } = await supabaseAdmin
          .from('work_experiences')
          .insert(workExperiencesToInsert);

        if (workError) {
          console.error('[SIGNUP] Failed to insert work experiences:', workError);
          console.error('[SIGNUP] Work experiences data:', workExperiencesToInsert);
        } else {
          console.log(`[SIGNUP] Inserted ${workExperiencesToInsert.length} work experiences`);
        }
      }
    }

    // Process education
    if (metadata.education && metadata.education.length > 0) {
      const educationToInsert = metadata.education
        .filter(edu => edu.institution && edu.degree)
        .map(edu => ({
          candidate_id: newProfile.id,
          institution: edu.institution,
          degree: edu.degree,
          field_of_study: edu.fieldOfStudy || null,
          end_date: edu.graduationDate ? `${edu.graduationDate}-06-01` : null, // Assuming June graduation
        }));

      if (educationToInsert.length > 0) {
        const { error: eduError } = await supabaseAdmin
          .from('education')
          .insert(educationToInsert);

        if (eduError) {
          console.error('[SIGNUP] Failed to insert education:', eduError);
        } else {
          console.log(`[SIGNUP] Inserted ${educationToInsert.length} education records`);
        }
      }
    }

    // Process tags
    if (metadata.tags && metadata.tags.length > 0) {
      // First ensure all tags exist
      const uniqueTags = Array.from(new Set(metadata.tags.map(t => t.name)));
      
      for (const tagName of uniqueTags) {
        const tagCategory = metadata.tags.find(t => t.name === tagName)?.category || 'skill';
        const tagType = tagCategory === 'expertise' ? 'skill' : tagCategory;
        
        await supabaseAdmin
          .from('tags')
          .upsert(
            { name: tagName, type: tagType },
            { onConflict: 'name' }
          );
      }

      // Get all tag IDs
      const { data: existingTags } = await supabaseAdmin
        .from('tags')
        .select('id, name')
        .in('name', uniqueTags);

      if (existingTags && existingTags.length > 0) {
        const candidateTagsToInsert = existingTags.map(tag => ({
          candidate_id: newProfile.id,
          tag_id: tag.id
        }));

        const { error: tagError } = await supabaseAdmin
          .from('candidate_tags')
          .insert(candidateTagsToInsert);

        if (tagError) {
          console.error('[SIGNUP] Failed to insert candidate tags:', tagError);
        } else {
          console.log(`[SIGNUP] Inserted ${candidateTagsToInsert.length} candidate tags`);
        }
      }
    }

    return createSuccessResponse({
      profileId: newProfile.id,
      userId: userId,
      message: 'Profile created successfully. An admin will review and approve your profile.'
    }, 'Signup successful', 201);

  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json({
        success: false,
        message: 'Invalid form data',
        errors: error.errors.map(err => ({
          path: err.path,
          message: err.message,
          field: err.path.join('.')
        }))
      }, { status: 400 });
    }
    
    return createErrorResponse('An unexpected error occurred during signup', 500);
  }
}