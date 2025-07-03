#!/usr/bin/env tsx

/**
 * Database Seeding Script for NED Backend
 * 
 * This script creates sample data for testing the database schema
 * Run with: npx tsx scripts/seed.ts
 */

import { db } from '../src/lib/supabase/client';
import { 
  users, 
  companies, 
  companyUsers, 
  tags, 
  candidateProfiles, 
  candidateTags,
  workExperiences,
  education
} from '../src/lib/supabase/schema';

// Sample data
const sampleUsers = [
  {
    id: 'user_candidate_1',
    email: 'jane.doe@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'candidate' as const,
    isActive: true,
  },
  {
    id: 'user_candidate_2', 
    email: 'john.smith@example.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'candidate' as const,
    isActive: true,
  },
  {
    id: 'user_company_1',
    email: 'hiring@techcorp.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'company' as const,
    isActive: true,
  },
  {
    id: 'user_admin_1',
    email: 'admin@ned.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    isActive: true,
  },
];

const sampleCompanies = [
  {
    name: 'TechCorp Inc',
    description: 'Leading technology company specializing in cloud solutions',
    website: 'https://techcorp.com',
    size: 'medium',
    industry: 'Technology',
    location: 'San Francisco, CA',
    tier: 'premium' as const,
    searchQuota: 100,
    searchesUsed: 25,
    subscriptionStatus: 'active' as const,
  },
  {
    name: 'StartupXYZ',
    description: 'Innovative fintech startup',
    website: 'https://startupxyz.com',
    size: 'startup',
    industry: 'Fintech',
    location: 'New York, NY',
    tier: 'basic' as const,
    searchQuota: 10,
    searchesUsed: 5,
    subscriptionStatus: 'trial' as const,
  },
];

const sampleTags = [
  { name: 'JavaScript', category: 'skill', description: 'JavaScript programming language', isVerified: true },
  { name: 'React', category: 'skill', description: 'React.js framework', isVerified: true },
  { name: 'Node.js', category: 'skill', description: 'Node.js runtime', isVerified: true },
  { name: 'Python', category: 'skill', description: 'Python programming language', isVerified: true },
  { name: 'Machine Learning', category: 'skill', description: 'Machine learning and AI', isVerified: true },
  { name: 'Senior Developer', category: 'experience', description: 'Senior level development experience', isVerified: true },
  { name: 'Full Stack', category: 'experience', description: 'Full stack development', isVerified: true },
  { name: 'Remote Work', category: 'experience', description: 'Remote work experience', isVerified: true },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Insert users
    console.log('👥 Inserting sample users...');
    await db.insert(users).values(sampleUsers).onConflictDoNothing();
    
    // Insert companies
    console.log('🏢 Inserting sample companies...');
    const insertedCompanies = await db.insert(companies).values(sampleCompanies).returning();
    
    // Insert company users
    console.log('🔗 Linking users to companies...');
    if (insertedCompanies.length > 0) {
      await db.insert(companyUsers).values([
        {
          userId: 'user_company_1',
          companyId: insertedCompanies[0].id,
          role: 'owner',
        },
      ]).onConflictDoNothing();
    }
    
    // Insert tags
    console.log('🏷️  Inserting sample tags...');
    const insertedTags = await db.insert(tags).values(sampleTags).returning();
    
    // Insert candidate profiles
    console.log('👤 Inserting candidate profiles...');
    const candidateProfilesData = [
      {
        userId: 'user_candidate_1',
        title: 'Senior Full Stack Developer',
        summary: 'Experienced full-stack developer with 5+ years in React and Node.js',
        experience: 'senior',
        location: 'San Francisco, CA',
        remotePreference: 'hybrid',
        salaryMin: '120000.00',
        salaryMax: '150000.00',
        availability: 'immediately',
        isAnonymized: true,
        isActive: true,
        profileCompleted: true,
        publicMetadata: {
          skillsCount: 8,
          experienceYears: 5,
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        userId: 'user_candidate_2',
        title: 'Machine Learning Engineer',
        summary: 'ML engineer specializing in computer vision and NLP',
        experience: 'mid',
        location: 'New York, NY',
        remotePreference: 'remote',
        salaryMin: '100000.00',
        salaryMax: '130000.00',
        availability: '2weeks',
        isAnonymized: true,
        isActive: true,
        profileCompleted: true,
        publicMetadata: {
          skillsCount: 6,
          experienceYears: 3,
          lastUpdated: new Date().toISOString(),
        },
      },
    ];
    
    const insertedProfiles = await db.insert(candidateProfiles).values(candidateProfilesData).returning();
    
    // Insert candidate tags
    console.log('🔗 Linking candidates to tags...');
    if (insertedProfiles.length > 0 && insertedTags.length > 0) {
      const candidateTagsData = [
        // Jane Doe's tags
        { candidateId: insertedProfiles[0].id, tagId: insertedTags[0].id, proficiency: 'expert', yearsExperience: 5 }, // JavaScript
        { candidateId: insertedProfiles[0].id, tagId: insertedTags[1].id, proficiency: 'expert', yearsExperience: 4 }, // React
        { candidateId: insertedProfiles[0].id, tagId: insertedTags[2].id, proficiency: 'advanced', yearsExperience: 3 }, // Node.js
        { candidateId: insertedProfiles[0].id, tagId: insertedTags[5].id, proficiency: 'expert', yearsExperience: 5 }, // Senior Developer
        { candidateId: insertedProfiles[0].id, tagId: insertedTags[6].id, proficiency: 'expert', yearsExperience: 4 }, // Full Stack
        
        // John Smith's tags  
        { candidateId: insertedProfiles[1].id, tagId: insertedTags[3].id, proficiency: 'expert', yearsExperience: 3 }, // Python
        { candidateId: insertedProfiles[1].id, tagId: insertedTags[4].id, proficiency: 'advanced', yearsExperience: 2 }, // Machine Learning
        { candidateId: insertedProfiles[1].id, tagId: insertedTags[7].id, proficiency: 'advanced', yearsExperience: 2 }, // Remote Work
      ];
      
      await db.insert(candidateTags).values(candidateTagsData).onConflictDoNothing();
    }
    
    // Insert work experiences
    console.log('💼 Inserting work experiences...');
    if (insertedProfiles.length > 0) {
      const workExperiencesData = [
        {
          candidateId: insertedProfiles[0].id,
          company: 'Tech Solutions Inc',
          title: 'Senior Full Stack Developer',
          description: 'Led development of microservices architecture using React and Node.js',
          location: 'San Francisco, CA',
          startDate: new Date('2022-01-01'),
          endDate: null,
          isCurrent: true,
          isRemote: false,
          order: 1,
        },
        {
          candidateId: insertedProfiles[0].id,
          company: 'WebDev Corp',
          title: 'Full Stack Developer',
          description: 'Developed web applications using modern JavaScript frameworks',
          location: 'San Francisco, CA',
          startDate: new Date('2020-06-01'),
          endDate: new Date('2021-12-31'),
          isCurrent: false,
          isRemote: false,
          order: 2,
        },
        {
          candidateId: insertedProfiles[1].id,
          company: 'AI Innovations',
          title: 'Machine Learning Engineer',
          description: 'Developed computer vision models for autonomous vehicles',
          location: 'New York, NY',
          startDate: new Date('2021-03-01'),
          endDate: null,
          isCurrent: true,
          isRemote: true,
          order: 1,
        },
      ];
      
      await db.insert(workExperiences).values(workExperiencesData).onConflictDoNothing();
    }
    
    // Insert education
    console.log('🎓 Inserting education records...');
    if (insertedProfiles.length > 0) {
      const educationData = [
        {
          candidateId: insertedProfiles[0].id,
          institution: 'Stanford University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: new Date('2016-09-01'),
          endDate: new Date('2020-06-01'),
          order: 1,
        },
        {
          candidateId: insertedProfiles[1].id,
          institution: 'MIT',
          degree: 'Master of Science',
          field: 'Artificial Intelligence',
          startDate: new Date('2019-09-01'),
          endDate: new Date('2021-06-01'),
          order: 1,
        },
      ];
      
      await db.insert(education).values(educationData).onConflictDoNothing();
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Sample data created:');
    console.log(`   - ${sampleUsers.length} users`);
    console.log(`   - ${sampleCompanies.length} companies`);
    console.log(`   - ${sampleTags.length} tags`);
    console.log(`   - ${candidateProfilesData.length} candidate profiles`);
    console.log('   - Work experiences and education records');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };