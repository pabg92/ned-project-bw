import {
  CandidateProfile,
  CandidateProfileApiResponse,
  CandidateProfileWithRelations,
  ProfileDisplayData,
  ProfileFormData,
  Tag,
  TagCategory,
  WorkExperience,
  Education,
  CandidateTag,
  AdminProfileFormData
} from '@/lib/types/profile';

// Convert snake_case API response to camelCase
export function transformApiToProfile(apiData: CandidateProfileApiResponse): CandidateProfileWithRelations {
  // Handle user data that might be nested
  const userData = apiData.users || apiData.user || {};
  const firstName = apiData.first_name || userData.first_name || '';
  const lastName = apiData.last_name || userData.last_name || '';
  const email = apiData.email || userData.email || '';

  const profile: CandidateProfileWithRelations = {
    id: apiData.id,
    userId: apiData.user_id,
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: apiData.phone,
    summary: apiData.summary,
    profileImgUrl: apiData.profile_img_url,
    location: apiData.location,
    linkedinUrl: apiData.linkedin_url,
    resumeUrl: apiData.resume_url,
    yearsExperience: apiData.years_experience,
    boardExperience: apiData.board_experience,
    boardPositions: apiData.board_positions,
    activelySeeking: apiData.actively_seeking,
    willingToRelocate: apiData.willing_to_relocate,
    compensationMin: apiData.compensation_min,
    compensationMax: apiData.compensation_max,
    currency: apiData.currency,
    availableImmediate: apiData.available_immediate,
    isActive: apiData.is_active,
    isVerified: apiData.is_verified,
    verificationStatus: apiData.verification_status,
    backgroundCheckStatus: apiData.background_check_status,
    backgroundCheckDate: apiData.background_check_date,
    adminNotes: apiData.admin_notes,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at,
    candidateTags: [],
    tags: [],
    workExperiences: [],
    education: []
  };

  // Transform tags
  if (apiData.candidate_tags) {
    profile.candidateTags = apiData.candidate_tags.map(ct => ({
      id: ct.id,
      candidateId: apiData.id,
      tagId: ct.tag_id,
      tag: {
        id: ct.tags.id,
        name: ct.tags.name,
        category: ct.tags.category,
        isActive: true
      }
    }));
    
    profile.tags = profile.candidateTags.map(ct => ct.tag!);
  }

  // Transform work experiences
  if (apiData.work_experiences) {
    profile.workExperiences = apiData.work_experiences.map(we => ({
      id: we.id,
      candidateId: apiData.id,
      companyName: we.company_name,
      title: we.title,
      location: we.location,
      startDate: we.start_date,
      endDate: we.end_date,
      isCurrent: we.is_current,
      description: we.description,
      achievements: we.achievements
    }));
  }

  // Transform education
  if (apiData.education) {
    profile.education = apiData.education.map(edu => ({
      id: edu.id,
      candidateId: apiData.id,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.field_of_study,
      location: edu.location,
      graduationDate: edu.graduation_date,
      gpa: edu.gpa,
      honors: edu.honors
    }));
  }

  return profile;
}

// Convert profile to display data with computed fields
export function transformProfileToDisplay(profile: CandidateProfileWithRelations): ProfileDisplayData {
  const firstName = profile.firstName || 'Unknown';
  const lastName = profile.lastName || 'Profile';
  
  const displayData: ProfileDisplayData = {
    ...profile,
    fullName: `${firstName} ${lastName}`.trim(),
    initials: `${firstName[0] || 'U'}${lastName[0] || 'P'}`.toUpperCase(),
    coreSkills: profile.tags.filter(t => t.category === 'skill'),
    functionalExpertise: profile.tags.filter(t => t.category === 'expertise'),
    industryExpertise: profile.tags.filter(t => t.category === 'industry'),
    certifications: profile.tags.filter(t => t.category === 'certification'),
    languages: profile.tags.filter(t => t.category === 'language'),
    statusLabel: getStatusLabel(profile),
    availabilityStatus: getAvailabilityStatus(profile)
  };

  return displayData;
}

// Convert form data to API format
export function transformFormToApi(formData: ProfileFormData | AdminProfileFormData) {
  const apiData: any = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    location: formData.location,
    linkedin_url: formData.linkedinUrl,
    summary: formData.summary,
    years_experience: formData.yearsExperience,
    board_experience: formData.boardExperience,
    board_positions: formData.boardPositions,
    actively_seeking: formData.activelySeeking,
    available_immediate: formData.availableImmediate,
    willing_to_relocate: formData.willingToRelocate,
    compensation_min: formData.compensationMin,
    compensation_max: formData.compensationMax,
    currency: formData.currency
  };

  // Add admin fields if present
  if ('isActive' in formData) {
    apiData.is_active = formData.isActive;
    apiData.is_verified = formData.isVerified;
    apiData.verification_status = formData.verificationStatus;
    apiData.background_check_status = formData.backgroundCheckStatus;
    apiData.background_check_date = formData.backgroundCheckDate;
    apiData.admin_notes = formData.adminNotes;
  }

  return apiData;
}

// Convert profile to form data
export function transformProfileToForm(profile: CandidateProfileWithRelations): ProfileFormData {
  const formData: ProfileFormData = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone || '',
    location: profile.location || '',
    linkedinUrl: profile.linkedinUrl || '',
    summary: profile.summary || '',
    yearsExperience: profile.yearsExperience || 0,
    boardExperience: profile.boardExperience || false,
    boardPositions: profile.boardPositions || 0,
    coreSkills: profile.tags.filter(t => t.category === 'skill').map(t => t.name),
    functionalExpertise: profile.tags.filter(t => t.category === 'expertise').map(t => t.name),
    industryExpertise: profile.tags.filter(t => t.category === 'industry').map(t => t.name),
    certifications: profile.tags.filter(t => t.category === 'certification').map(t => t.name),
    languages: profile.tags.filter(t => t.category === 'language').map(t => t.name),
    workExperiences: profile.workExperiences.map(we => ({
      companyName: we.companyName,
      title: we.title,
      location: we.location,
      startDate: we.startDate,
      endDate: we.endDate,
      isCurrent: we.isCurrent,
      description: we.description,
      achievements: we.achievements
    })),
    education: profile.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      location: edu.location,
      graduationDate: edu.graduationDate,
      gpa: edu.gpa,
      honors: edu.honors
    })),
    activelySeeking: profile.activelySeeking || false,
    availableImmediate: profile.availableImmediate || false,
    willingToRelocate: profile.willingToRelocate || false,
    compensationMin: profile.compensationMin,
    compensationMax: profile.compensationMax,
    currency: profile.currency || 'USD'
  };

  return formData;
}

// Convert profile to admin form data
export function transformProfileToAdminForm(profile: CandidateProfileWithRelations): AdminProfileFormData {
  const baseFormData = transformProfileToForm(profile);
  
  const adminFormData: AdminProfileFormData = {
    ...baseFormData,
    isActive: profile.isActive || true,
    isVerified: profile.isVerified || false,
    verificationStatus: profile.verificationStatus || 'pending',
    backgroundCheckStatus: profile.backgroundCheckStatus || 'not_started',
    backgroundCheckDate: profile.backgroundCheckDate,
    adminNotes: profile.adminNotes || ''
  };

  return adminFormData;
}

// Helper function to get status label
function getStatusLabel(profile: CandidateProfile): string {
  if (!profile.isActive) return 'Inactive';
  if (profile.isVerified) return 'Verified';
  if (profile.verificationStatus === 'pending') return 'Pending Verification';
  return 'Active';
}

// Helper function to get availability status
function getAvailabilityStatus(profile: CandidateProfile): ProfileDisplayData['availabilityStatus'] {
  if (profile.availableImmediate) return 'immediate';
  if (profile.willingToRelocate) return 'international';
  return 'notice';
}

// Format years of experience
export function formatExperience(years?: number): string {
  if (!years) return '0 years experience';
  return `${years}+ years experience`;
}

// Format location for display
export function formatLocation(location?: string): string {
  return location || 'Location not specified';
}

// Format board positions
export function formatBoardPositions(positions?: number): string {
  if (!positions) return '0 Board Positions';
  return `${positions} Board Position${positions > 1 ? 's' : ''}`;
}

// Get profile completeness percentage
export function getProfileCompleteness(profile: CandidateProfileWithRelations): number {
  let score = 0;
  const weights = {
    basic: 20, // name, email, phone, location
    summary: 15,
    experience: 20, // work experiences
    education: 10,
    skills: 15, // tags
    board: 10, // board experience details
    availability: 10 // seeking status, compensation
  };

  // Basic info
  if (profile.firstName && profile.lastName && profile.email) score += weights.basic * 0.5;
  if (profile.phone && profile.location) score += weights.basic * 0.5;

  // Summary
  if (profile.summary && profile.summary.length > 50) score += weights.summary;

  // Work experience
  if (profile.workExperiences.length > 0) score += weights.experience;

  // Education
  if (profile.education.length > 0) score += weights.education;

  // Skills/Tags
  if (profile.tags.length >= 3) score += weights.skills;

  // Board experience
  if (profile.boardExperience !== undefined && profile.boardPositions !== undefined) {
    score += weights.board;
  }

  // Availability
  if (profile.activelySeeking !== undefined && profile.availableImmediate !== undefined) {
    score += weights.availability * 0.5;
  }
  if (profile.compensationMin || profile.compensationMax) {
    score += weights.availability * 0.5;
  }

  return Math.round(score);
}

// Create initials avatar color based on name
export function getAvatarColor(name?: string | null): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];
  
  // Handle undefined or null names
  if (!name || typeof name !== 'string') {
    return colors[0]; // Default to blue
  }
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}