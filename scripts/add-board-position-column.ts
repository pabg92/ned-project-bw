import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addBoardPositionColumn() {
  try {
    console.log('Adding is_board_position column to work_experiences table...');
    
    // Add the column using raw SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE work_experiences 
        ADD COLUMN IF NOT EXISTS is_board_position BOOLEAN DEFAULT false;
      `
    });
    
    if (error) {
      // If the RPC doesn't exist, try direct query
      const { error: directError } = await supabase
        .from('work_experiences')
        .select('is_board_position')
        .limit(1);
      
      if (directError?.message?.includes('column "is_board_position" does not exist')) {
        console.error('Column does not exist and cannot be added via API. Please add manually in Supabase dashboard:');
        console.log(`
ALTER TABLE work_experiences 
ADD COLUMN is_board_position BOOLEAN DEFAULT false;
        `);
        return;
      } else if (!directError) {
        console.log('✅ Column already exists!');
        return;
      }
    }
    
    console.log('✅ Column added successfully!');
    
    // Update existing board positions based on title keywords
    console.log('Updating existing board positions...');
    
    const { data: allExperiences } = await supabase
      .from('work_experiences')
      .select('*');
    
    if (allExperiences) {
      for (const exp of allExperiences) {
        const isBoard = 
          exp.position?.toLowerCase().includes('director') ||
          exp.position?.toLowerCase().includes('trustee') ||
          exp.position?.toLowerCase().includes('chair') ||
          exp.position?.toLowerCase().includes('board');
        
        if (isBoard) {
          await supabase
            .from('work_experiences')
            .update({ is_board_position: true })
            .eq('id', exp.id);
          
          console.log(`Updated: ${exp.position} at ${exp.company_name}`);
        }
      }
    }
    
    console.log('✅ Migration complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

addBoardPositionColumn();