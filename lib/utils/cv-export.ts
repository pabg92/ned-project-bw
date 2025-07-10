/**
 * Utility functions for exporting candidate profiles as CVs
 */

interface CVExportOptions {
  format?: 'pdf' | 'docx';
  includePhoto?: boolean;
  theme?: 'professional' | 'modern' | 'classic';
}

/**
 * Generate a downloadable CV from profile data
 * Note: For now, we'll use the browser's print functionality
 * In the future, this could be expanded to use a PDF generation library
 */
export async function generateCV(profileData: any, options: CVExportOptions = {}) {
  const { format = 'pdf' } = options;

  if (format === 'pdf') {
    // Use browser's print dialog which allows saving as PDF
    window.print();
  } else {
    // Future implementation for DOCX export
    console.warn('DOCX export not yet implemented');
  }
}

/**
 * Format profile data for CV export
 */
export function formatProfileForCV(profile: any) {
  return {
    personalInfo: {
      name: profile.name || 'Executive Profile',
      title: profile.title,
      location: profile.location,
      email: profile.email,
      phone: profile.phone,
      linkedin: profile.linkedinUrl,
      experience: profile.experience
    },
    summary: profile.bio,
    boardExperience: profile.workExperiences?.filter((exp: any) => 
      exp.isBoardPosition || exp.is_board_position
    ) || [],
    executiveExperience: profile.workExperiences?.filter((exp: any) => 
      !exp.isBoardPosition && !exp.is_board_position
    ) || [],
    skills: {
      core: profile.keySkills || profile.skills || [],
      functional: profile.functionalExpertise || profile.sectors || [],
      industry: profile.industryExpertise || []
    },
    education: profile.education || [],
    certifications: profile.certifications || [],
    languages: profile.languages || ['English'],
    availability: {
      status: profile.availability,
      remote: profile.remotePreference,
      travel: profile.willingToRelocate,
      activelySeeking: profile.activelySeeking
    }
  };
}

/**
 * Generate a filename for the CV download
 */
export function generateCVFilename(profileName: string, isAnonymized: boolean = false) {
  const timestamp = new Date().toISOString().split('T')[0];
  const name = isAnonymized ? 'Executive_Profile' : profileName.replace(/\s+/g, '_');
  return `${name}_CV_${timestamp}.pdf`;
}