import { supabaseAdmin } from "../lib/supabase/client"

async function createNewsletterTable() {
  try {
    console.log("Creating newsletter_subscribers table...")
    
    // Create the table
    const { error: tableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          email text UNIQUE NOT NULL,
          subscribed_to_newsletter boolean DEFAULT true,
          source text DEFAULT 'website',
          ip_address inet,
          user_agent text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          unsubscribed_at timestamptz,
          
          CONSTRAINT newsletter_subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
        );
      `
    }).single()
    
    if (tableError) {
      // Table might already exist, let's try a direct query
      const { error: createError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id')
        .limit(1)
      
      if (createError?.message.includes('does not exist')) {
        console.error("Failed to create table:", tableError)
        throw tableError
      } else {
        console.log("Table already exists or created successfully")
      }
    } else {
      console.log("Table created successfully")
    }
    
    console.log("✅ Newsletter subscribers table ready")
    
  } catch (error) {
    console.error("Error:", error)
  }
}

createNewsletterTable()