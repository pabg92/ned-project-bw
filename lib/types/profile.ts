// Unified profile types aligned with database schema

// Base types matching database tables
export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  summary?: string;
  profileImgUrl?: string;
  location?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  yearsExperience?: number;
  boardExperience?: boolean;
  boardPositions?: number;
  activelySeeking?: boolean;
  willingToRelocate?: boolean;
  compensationMin?: number;
  compensationMax?: number;
  currency?: string;
  availableImmediate?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  verificationStatus?: string;
  backgroundCheckStatus?: string;
  backgroundCheckDate?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkExperience {
  id: string;
  candidateId: string;
  companyName: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string;
  isBoardPosition?: boolean;
  is_board_position?: boolean; // Support both naming conventions
  companyType?: string;
  company_type?: string; // Support both naming conventions
  createdAt?: string;
  updatedAt?: string;
}

export interface Education {
  id: string;
  candidateId: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  graduationDate?: string;
  gpa?: number;
  honors?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateTag {
  id: string;
  candidateId: string;
  tagId: string;
  createdAt?: string;
  tag?: Tag;
}

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TagCategory = 'skill' | 'expertise' | 'industry' | 'certification' | 'language' | 'other';

// Extended profile type with all relations (for display)
export interface CandidateProfileWithRelations extends CandidateProfile {
  workExperiences: WorkExperience[];
  education: Education[];
  candidateTags: CandidateTag[];
  tags: Tag[]; // Flattened tags for easier access
}

// Display-oriented types
export interface ProfileDisplayData extends CandidateProfileWithRelations {
  fullName: string;
  initials: string;
  coreSkills: Tag[];
  functionalExpertise: Tag[];
  industryExpertise: Tag[];
  certifications: Tag[];
  languages: Tag[];
  statusLabel: string;
  availabilityStatus: 'immediate' | 'international' | 'notice' | 'not-available';
}

// Form data types
export interface ProfileFormData {
  // Basic info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  
  // Professional summary
  summary: string;
  yearsExperience: number;
  
  // Board experience
  boardExperience: boolean;
  boardPositions: number;
  
  // Skills and expertise (as tag IDs or names)
  coreSkills: string[];
  functionalExpertise: string[];
  industryExpertise: string[];
  certifications: string[];
  languages: string[];
  
  // Work experience
  workExperiences: Omit<WorkExperience, 'id' | 'candidateId' | 'createdAt' | 'updatedAt'>[];
  
  // Education
  education: Omit<Education, 'id' | 'candidateId' | 'createdAt' | 'updatedAt'>[];
  
  // Availability
  activelySeeking: boolean;
  availableImmediate: boolean;
  willingToRelocate: boolean;
  
  // Compensation
  compensationMin?: number;
  compensationMax?: number;
  currency?: string;
}

// Admin-specific form data
export interface AdminProfileFormData extends ProfileFormData {
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: string;
  backgroundCheckStatus: string;
  backgroundCheckDate?: string;
  adminNotes: string;
}

// API response types (snake_case from database)
export interface CandidateProfileApiResponse {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  summary?: string;
  profile_img_url?: string;
  location?: string;
  linkedin_url?: string;
  resume_url?: string;
  years_experience?: number;
  board_experience?: boolean;
  board_positions?: number;
  actively_seeking?: boolean;
  willing_to_relocate?: boolean;
  compensation_min?: number;
  compensation_max?: number;
  currency?: string;
  available_immediate?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  verification_status?: string;
  background_check_status?: string;
  background_check_date?: string;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
  candidate_tags?: Array<{
    id: string;
    tag_id: string;
    tags: {
      id: string;
      name: string;
      category: TagCategory;
    };
  }>;
  work_experiences?: Array<{
    id: string;
    company_name: string;
    title: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
    achievements?: string;
  }>;
  education?: Array<{
    id: string;
    institution: string;
    degree: string;
    field_of_study?: string;
    location?: string;
    graduation_date?: string;
    gpa?: number;
    honors?: string;
  }>;
}