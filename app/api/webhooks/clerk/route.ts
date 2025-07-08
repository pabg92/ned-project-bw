import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { CLERK_WEBHOOK_SECRET, DEFAULT_ROLE } from '@/lib/auth/config';
import { UserMetadata } from '@/lib/types/auth';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt);
        break;
      case 'user.updated':
        await handleUserUpdated(evt);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt);
        break;
      case 'session.created':
        await handleSessionCreated(evt);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleUserCreated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = evt.data;
  
  // Check if user signed up with a specific role (e.g., from /sign-up?role=company)
  const signupRole = unsafe_metadata?.role as string;
  const signupSource = unsafe_metadata?.signupSource as string;
  
  console.log('[Webhook] User created with role:', signupRole, 'from source:', signupSource);
  console.log('[Webhook] Unsafe metadata:', unsafe_metadata);
  
  // Set metadata based on signup role
  const userRole = signupRole === 'company' ? 'company' : DEFAULT_ROLE;
  console.log('[Webhook] Setting user role to:', userRole);
  
  const defaultMetadata: UserMetadata = {
    role: userRole,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  try {
    // Update user metadata in Clerk
    const { clerkClient } = await import('@clerk/backend');
    
    // Set publicMetadata with role for middleware checks
    const metadataUpdate = await clerkClient.users.updateUserMetadata(id!, {
      publicMetadata: {
        role: userRole,
        ...(userRole === 'company' && { 
          credits: 0,  // Initialize credits for company users
          unlockedProfiles: []
        })
      },
      privateMetadata: {
        signupSource: signupSource || 'direct',
        signupDate: new Date().toISOString()
      },
      unsafeMetadata: defaultMetadata,
    });
    
    console.log('[Webhook] Metadata updated successfully:', {
      userId: id,
      role: userRole,
      publicMetadata: metadataUpdate.publicMetadata
    });

    // Create user record in Supabase database
    const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)?.email_address || 
                       email_addresses?.[0]?.email_address;
    
    if (primaryEmail) {
      const { supabaseAdmin } = await import('@/lib/supabase/client');
      
      // First check if user already exists (by email)
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, clerk_id')
        .eq('email', primaryEmail)
        .single();
      
      if (existingUser) {
        // User exists, just update clerk_id
        await supabaseAdmin
          .from('users')
          .update({
            clerk_id: id,
            image_url: image_url || existingUser.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUser.id);
        
        console.log(`Updated existing user ${existingUser.id} with Clerk ID: ${id}`);
      } else {
        // Create new user with generated ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: userId,
            clerk_id: id,
            email: primaryEmail,
            first_name: first_name || '',
            last_name: last_name || '',
            image_url: image_url || null,
            role: userRole, // Use the role from signup (company or default)
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error('Failed to create user in database:', insertError);
          throw insertError;
        }
        
        console.log(`Created new user ${userId} with Clerk ID: ${id} and role: ${userRole}`);
        
        // If it's a company user, initialize their credits record
        if (userRole === 'company') {
          const { error: creditsError } = await supabaseAdmin
            .from('user_credits')
            .insert({
              user_id: userId,
              credits: 0,
              total_purchased: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          
          if (creditsError) {
            console.error('Failed to initialize credits for company user:', creditsError);
            // Don't throw - user creation succeeded, credits can be initialized later
          } else {
            console.log(`Initialized credits record for company user ${userId}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error handling user creation:', error);
    throw error;
  }
}

async function handleUserUpdated(evt: WebhookEvent) {
  const { id, email_addresses, first_name, last_name, image_url } = evt.data;
  
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/client');
    
    // Find user by clerk_id
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', id)
      .single();
    
    if (existingUser) {
      // Update user information
      const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)?.email_address || 
                         email_addresses?.[0]?.email_address;
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      // Only update fields that have changed
      if (primaryEmail && primaryEmail !== existingUser.email) {
        updateData.email = primaryEmail;
      }
      if (first_name !== undefined && first_name !== existingUser.first_name) {
        updateData.first_name = first_name;
      }
      if (last_name !== undefined && last_name !== existingUser.last_name) {
        updateData.last_name = last_name;
      }
      if (image_url !== undefined && image_url !== existingUser.image_url) {
        updateData.image_url = image_url;
      }
      
      if (Object.keys(updateData).length > 1) { // More than just updated_at
        await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('clerk_id', id);
        
        console.log(`Updated user ${existingUser.id} from Clerk webhook`);
      }
    } else {
      // User doesn't exist in our database yet, create them
      console.log(`User with Clerk ID ${id} not found in database, creating...`);
      await handleUserCreated(evt);
    }
    
  } catch (error) {
    console.error('Error handling user update:', error);
    throw error;
  }
}

async function handleUserDeleted(evt: WebhookEvent) {
  const { id } = evt.data;
  
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/client');
    
    // Find user by clerk_id
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', id)
      .single();
    
    if (existingUser) {
      // Soft delete the user
      await supabaseAdmin
        .from('users')
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
          deletion_reason: 'User deleted from Clerk',
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', id);
      
      // Also deactivate their candidate profile if it exists
      await supabaseAdmin
        .from('candidate_profiles')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', existingUser.id);
      
      console.log(`Soft deleted user ${existingUser.id} with Clerk ID: ${id}`);
    } else {
      console.log(`User with Clerk ID ${id} not found in database, skipping deletion`);
    }
    
  } catch (error) {
    console.error('Error handling user deletion:', error);
    throw error;
  }
}

async function handleSessionCreated(evt: WebhookEvent) {
  const { user_id } = evt.data;
  
  try {
    // Update last login timestamp in Clerk metadata
    const { clerkClient } = await import('@clerk/backend');
    const user = await clerkClient.users.getUser(user_id!);
    
    const currentMetadata = user.unsafeMetadata as UserMetadata;
    const updatedMetadata = {
      ...currentMetadata,
      lastLogin: new Date().toISOString(),
    };

    await clerkClient.users.updateUserMetadata(user_id!, {
      unsafeMetadata: updatedMetadata,
    });

    // Also update last login in our database
    const { supabaseAdmin } = await import('@/lib/supabase/client');
    await supabaseAdmin
      .from('users')
      .update({
        last_login: new Date().toISOString(),
      })
      .eq('clerk_id', user_id);

    console.log(`Session created for user: ${user_id}`);
    
  } catch (error) {
    console.error('Error handling session creation:', error);
    throw error;
  }
}