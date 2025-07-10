import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enrichTestProfile() {
  const profileId = '02fb18e4-1964-409f-8a0c-1de1ab35651e';

  try {
    // First get the current profile
    const { data: profile, error: fetchError } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return;
    }

    console.log('Current profile:', profile);

    // Rich metadata matching Keith Edelman's profile
    const richMetadata = {
      phone: '+44 7557 520069',
      company: 'Arsenal Football Club',
      industry: 'Sports & Entertainment',
      boardExperience: true,
      boardPositions: 6,
      boardExperienceTypes: ['ftse100', 'ftse250', 'private-equity', 'startup'],
      boardDetails: 'Extensive board experience across FTSE-listed and PE-backed companies',
      roleTypes: ['chair', 'ned', 'advisor'],
      activelySeeking: true,
      willingToRelocate: true,
      yearsExperience: 30,
      roles: ['chair', 'ned', 'advisor'],
      boardPositionsData: [
        {
          companyName: 'Revolution Bars Group plc',
          title: 'Chairman',
          location: 'London, UK',
          startDate: '2020-01-01',
          endDate: null,
          isCurrent: true,
          description: 'Leading the board of this AIM-listed hospitality group through transformation and growth. Overseeing strategic direction, governance, and stakeholder engagement.',
          isBoardPosition: true,
          companyType: 'aim'
        },
        {
          companyName: 'Tottenham Hotspur Football Club',
          title: 'Non-Executive Director',
          location: 'London, UK',
          startDate: '2018-06-01',
          endDate: '2020-12-31',
          isCurrent: false,
          description: 'Board advisor during the critical stadium development phase. Provided expertise on infrastructure financing, commercial partnerships, and fan experience enhancement.',
          isBoardPosition: true,
          companyType: 'private-equity'
        },
        {
          companyName: 'SuperGroup plc (Superdry)',
          title: 'Senior Independent Director',
          location: 'Cheltenham, UK',
          startDate: '2016-03-01',
          endDate: '2019-05-31',
          isCurrent: false,
          description: 'Served as SID during a period of significant transformation. Led board committees on remuneration and nominations, supporting international expansion strategy.',
          isBoardPosition: true,
          companyType: 'ftse250'
        }
      ]
    };

    // Update profile with rich metadata
    const { data: updatedProfile, error: updateError } = await supabase
      .from('candidate_profiles')
      .update({
        title: 'Former CEO & Chairman',
        summary: `Highly accomplished executive and boardroom leader with over three decades of experience spanning retail, leisure, sport, property, media, and consumer goods. Best known for leading Arsenal Football Club's historic move to the Emirates Stadium, one of the most significant infrastructure projects in UK football. Throughout my career, I have held senior roles in FTSE-listed and private equity-backed firms, driving strategic growth, financial transformation, and high-impact governance. Now focused on non-executive roles, mentoring, and speaking on leadership, business transformation, and value creation.`,
        location: 'London, UK',
        experience: 'executive',
        is_anonymized: false, // Make it non-anonymized for testing
        profile_completed: true,
        private_metadata: richMetadata,
        admin_notes: 'Test profile enriched with professional board member data'
      })
      .eq('id', profileId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return;
    }

    console.log('Profile updated successfully:', updatedProfile);

    // Add work experiences
    const workExperiences = [
      {
        candidate_id: profileId,
        company_name: 'Arsenal Football Club',
        position: 'Chief Executive',
        description: 'Led the Emirates Stadium relocation project, securing over £560 million in funding and delivering the move on time and on budget. Negotiated the two largest commercial sponsorship deals in UK football at the time.',
        start_date: '2008-01-01',
        end_date: '2018-12-31',
        is_current: false
      },
      {
        candidate_id: profileId,
        company_name: 'Storehouse plc',
        position: 'Group Finance Director',
        description: 'Orchestrated financial restructuring and strategic transformation of this major retail group. Improved EBITDA by 30% through operational efficiencies and strategic acquisitions.',
        start_date: '1999-06-01',
        end_date: '2007-12-31',
        is_current: false
      }
    ];

    // First delete existing work experiences
    await supabase
      .from('work_experiences')
      .delete()
      .eq('candidate_id', profileId);

    // Insert new work experiences
    const { error: workError } = await supabase
      .from('work_experiences')
      .insert(workExperiences);

    if (workError) {
      console.error('Error inserting work experiences:', workError);
    } else {
      console.log('Work experiences added successfully');
    }

    // Add education
    const education = [
      {
        candidate_id: profileId,
        institution: 'London Business School',
        degree: 'MBA',
        field_of_study: 'Business Administration',
        end_date: '1995-06-01'
      },
      {
        candidate_id: profileId,
        institution: 'University of Manchester',
        degree: 'BSc Economics',
        field_of_study: 'Economics',
        end_date: '1988-06-01'
      }
    ];

    // First delete existing education
    await supabase
      .from('education')
      .delete()
      .eq('candidate_id', profileId);

    // Insert new education
    const { error: eduError } = await supabase
      .from('education')
      .insert(education);

    if (eduError) {
      console.error('Error inserting education:', eduError);
    } else {
      console.log('Education added successfully');
    }

    // Update user details
    const { error: userError } = await supabase
      .from('users')
      .update({
        first_name: 'Keith',
        last_name: 'Edelman'
      })
      .eq('id', profile.user_id);

    if (userError) {
      console.error('Error updating user:', userError);
    } else {
      console.log('User details updated successfully');
    }

    console.log('Profile enrichment complete!');
    console.log(`Visit: http://localhost:3000/search/${profileId}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the enrichment
enrichTestProfile();