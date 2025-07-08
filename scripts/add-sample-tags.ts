import { config } from 'dotenv';
import path from 'path';
import { db } from '../lib/supabase/drizzle';
import { tags, candidateTags } from '../lib/supabase/schema';
import { eq } from 'drizzle-orm';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function addSampleTags() {
  try {
    const profileId = '8fba1640-72bd-4b3e-a7a4-302ac6ab2b49';
    
    console.log('Adding sample tags...');
    
    // Create skill tags
    const skillNames = [
      'Financial Strategy',
      'M&A & Corporate Finance', 
      'Digital Transformation',
      'Risk Management',
      'ESG & Sustainability'
    ];
    
    const sectorNames = [
      'Financial Services',
      'Technology',
      'Healthcare'
    ];
    
    // Insert tags
    for (const skillName of skillNames) {
      try {
        await db.insert(tags).values({
          name: skillName,
          category: 'skill'
        }).onConflictDoNothing();
      } catch (e) {
        console.log(`Tag ${skillName} might already exist`);
      }
    }
    
    for (const sectorName of sectorNames) {
      try {
        await db.insert(tags).values({
          name: sectorName,
          category: 'sector'
        }).onConflictDoNothing();
      } catch (e) {
        console.log(`Tag ${sectorName} might already exist`);
      }
    }
    
    console.log('Tags created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

// Run the script
addSampleTags();