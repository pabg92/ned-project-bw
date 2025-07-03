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
  const { id, email_addresses, first_name, last_name } = evt.data;
  
  // Set default metadata for new users
  const defaultMetadata: UserMetadata = {
    role: DEFAULT_ROLE,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  try {
    // Update user metadata in Clerk
    const { clerkClient } = await import('@clerk/backend');
    
    await clerkClient.users.updateUserMetadata(id!, {
      publicMetadata: {},
      privateMetadata: {},
      unsafeMetadata: defaultMetadata,
    });

    // TODO: Create user record in Supabase database
    console.log(`User created: ${id}, Email: ${email_addresses?.[0]?.email_address}`);
    
  } catch (error) {
    console.error('Error handling user creation:', error);
    throw error;
  }
}

async function handleUserUpdated(evt: WebhookEvent) {
  const { id } = evt.data;
  
  try {
    // TODO: Update user record in Supabase database
    console.log(`User updated: ${id}`);
    
  } catch (error) {
    console.error('Error handling user update:', error);
    throw error;
  }
}

async function handleUserDeleted(evt: WebhookEvent) {
  const { id } = evt.data;
  
  try {
    // TODO: Handle user deletion in Supabase database
    console.log(`User deleted: ${id}`);
    
  } catch (error) {
    console.error('Error handling user deletion:', error);
    throw error;
  }
}

async function handleSessionCreated(evt: WebhookEvent) {
  const { user_id } = evt.data;
  
  try {
    // Update last login timestamp
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

    console.log(`Session created for user: ${user_id}`);
    
  } catch (error) {
    console.error('Error handling session creation:', error);
    throw error;
  }
}