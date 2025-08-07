import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdminRole(userId: string, email: string) {
  try {
    console.log(`Setting admin role for user: ${userId} (${email})`);

    // First, check if user exists in the users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
      return;
    }

    if (!existingUser) {
      // User doesn't exist, create them
      console.log('User not found in database, creating...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          role: 'admin',
          first_name: 'Admin',
          last_name: 'User',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        return;
      }
      console.log('✅ User created with admin role');
    } else {
      // User exists, update their role
      console.log('User found, updating role...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user role:', updateError);
        return;
      }
      console.log('✅ User role updated to admin');
    }

    // Verify the update
    const { data: updatedUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }

    console.log('User details:', updatedUser);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Get user ID and email from command line arguments
const userId = process.argv[2];
const email = process.argv[3];

if (!userId || !email) {
  console.error('Please provide both user ID and email as arguments');
  console.error('Usage: npx tsx scripts/set-admin-role.ts <user-id> <email>');
  process.exit(1);
}

setAdminRole(userId, email);