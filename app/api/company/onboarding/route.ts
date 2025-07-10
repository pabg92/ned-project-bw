import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import { getSupabaseAdmin } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      companyName,
      industry,
      companySize,
      hiringNeeds,
      website,
      position,
    } = body;

    console.log('[Company Onboarding] Processing for user:', userId);
    console.log('[Company Onboarding] Company name:', companyName);

    // Initialize Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!
    });

    // Update Clerk user metadata
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          companyName,
          companySize,
          industry,
          position,
          onboardingCompleted: true,
          credits: 0, // Initialize credits
          unlockedProfiles: [], // Initialize empty array of unlocked profiles
          role: 'company', // Ensure role is set in metadata too
        },
        privateMetadata: {
          companyWebsite: website,
          hiringNeeds,
          onboardingDate: new Date().toISOString(),
          creditHistory: [], // Initialize credit history
        }
      });
      console.log('[Company Onboarding] Clerk metadata updated successfully');
    } catch (clerkError) {
      console.error('[Company Onboarding] Error updating Clerk metadata:', clerkError);
      // Continue anyway - we can still save to Supabase
    }

    // Update user record in Supabase
    const supabaseAdmin = getSupabaseAdmin();
    
    // Find user by Clerk user ID (since we store Clerk ID as users.id)
    const { data: foundUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single();
      
    if (userError || !foundUser) {
      console.error('[Company Onboarding] User not found in database:', userError);
      throw new Error('User not found. Please ensure you are properly signed up.');
    }

    console.log('[Company Onboarding] Found user in DB:', foundUser.id);
    console.log('[Company Onboarding] Current role:', foundUser.role);

    // Update user with company name as display name and set role to company
    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({
        first_name: companyName,
        role: 'company',
        updated_at: new Date().toISOString(),
      })
      .eq('id', foundUser.id);
      
    if (updateUserError) {
      console.error('[Company Onboarding] Error updating user:', updateUserError);
      throw updateUserError;
    }
    
    console.log('[Company Onboarding] Updated user role to company');

    // Create or update company profile
    const { data: existingProfile } = await supabaseAdmin
      .from('company_profiles')
      .select('id')
      .eq('user_id', foundUser.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabaseAdmin
        .from('company_profiles')
        .update({
          company_name: companyName,
          industry,
          company_size: companySize,
          website,
          position,
          hiring_needs: hiringNeeds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id);

      if (updateError) {
        console.error('[Company Onboarding] Error updating profile:', updateError);
        throw updateError;
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabaseAdmin
        .from('company_profiles')
        .insert({
          user_id: foundUser.id,
          company_name: companyName,
          industry,
          company_size: companySize,
          website,
          position,
          hiring_needs: hiringNeeds,
        });

      if (insertError) {
        console.error('[Company Onboarding] Error creating profile:', insertError);
        throw insertError;
      }
    }

    console.log('[Company Onboarding] Company profile saved successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Company Onboarding] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save company information';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}