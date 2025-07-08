'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface WorkExperience {
  companyName: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
}

interface FormData {
  // User Info
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  
  // Basic Profile Info
  title: string;
  company: string;
  industry: string;
  summary: string;
  experience: string;
  location: string;
  yearsOfExperience: string;
  
  // Board Experience
  boardExperience: boolean;
  boardPositions: number;
  boardDetails: string;
  
  // Work Experience
  workExperiences: WorkExperience[];
  
  // Education
  education: Education[];
  
  // Skills & Expertise
  keySkills: string[];
  functionalExpertise: string[];
  industryExpertise: string[];
  
  // Work Preferences
  remotePreference: string;
  availability: string;
  activelySeeking: boolean;
  availableImmediate: boolean;
  willingToRelocate: boolean;
  
  // Salary Information
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  
  // Professional Links
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
  
  // Profile Settings
  isActive: boolean;
  isAnonymized: boolean;
}

// Predefined options for skills and expertise
const SKILL_OPTIONS = [
  "Financial Strategy", "M&A", "Corporate Finance", "Risk Management", 
  "Digital Transformation", "ESG & Sustainability", "Audit & Compliance",
  "Strategic Planning", "Leadership", "Change Management", "Innovation"
];

const FUNCTIONAL_EXPERTISE_OPTIONS = [
  "CEO Leadership", "CFO", "Strategic Planning", "Investor Relations",
  "Treasury Management", "Financial Reporting", "Risk Management",
  "Cost Optimization", "M&A", "Data Analytics"
];

const INDUSTRY_EXPERTISE_OPTIONS = [
  "Technology", "Financial Services", "Healthcare", "Retail",
  "Manufacturing", "Energy", "Real Estate", "Media & Entertainment",
  "Telecommunications", "Transportation", "Education", "Government"
];

export default function AddCandidatePage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 6;
  
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    title: '',
    company: '',
    industry: '',
    summary: '',
    experience: '',
    location: '',
    yearsOfExperience: '',
    boardExperience: false,
    boardPositions: 0,
    boardDetails: '',
    workExperiences: [{
      companyName: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: ''
    }],
    education: [{
      institution: '',
      degree: '',
      fieldOfStudy: '',
      graduationDate: ''
    }],
    keySkills: [],
    functionalExpertise: [],
    industryExpertise: [],
    remotePreference: '',
    availability: '',
    activelySeeking: true,
    availableImmediate: false,
    willingToRelocate: false,
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    isActive: true,
    isAnonymized: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Work experience management
  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, {
        companyName: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      }]
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index)
    }));
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // Education management
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        graduationDate: ''
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Skills management
  const toggleSkill = (skill: string, category: 'keySkills' | 'functionalExpertise' | 'industryExpertise') => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(skill)
        ? prev[category].filter(s => s !== skill)
        : [...prev[category], skill]
    }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper function to map years of experience to experience level
  const getExperienceLevel = (years: string): string => {
    const yearsNum = parseInt(years);
    if (yearsNum <= 5) return 'junior';
    if (yearsNum <= 10) return 'mid';
    if (yearsNum <= 20) return 'senior';
    if (yearsNum <= 25) return 'lead';
    return 'executive';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      
      // Prepare tags from skills and expertise
      const tags = [
        ...formData.keySkills.map(skill => ({ name: skill, category: 'skill' })),
        ...formData.functionalExpertise.map(exp => ({ name: exp, category: 'expertise' })),
        ...formData.industryExpertise.map(ind => ({ name: ind, category: 'industry' }))
      ];
      
      // Prepare the payload with adminNotes containing all complex data
      const payload = {
        userId: formData.userId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title,
        summary: formData.summary,
        experience: formData.experience || getExperienceLevel(formData.yearsOfExperience),
        location: formData.location,
        linkedinUrl: formData.linkedinUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        portfolioUrl: formData.portfolioUrl || undefined,
        resumeUrl: formData.resumeUrl || undefined,
        remotePreference: formData.remotePreference || undefined,
        availability: formData.availability || undefined,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
        salaryCurrency: formData.salaryCurrency,
        isActive: formData.isActive,
        isAnonymized: formData.isAnonymized,
        // Store all complex data in adminNotes as JSON
        adminNotes: JSON.stringify({
          phone: formData.phone,
          company: formData.company,
          industry: formData.industry,
          boardExperience: formData.boardExperience,
          boardPositions: formData.boardPositions,
          boardDetails: formData.boardDetails,
          workExperiences: formData.workExperiences,
          education: formData.education,
          tags: tags,
          activelySeeking: formData.activelySeeking,
          availableImmediate: formData.availableImmediate,
          willingToRelocate: formData.willingToRelocate,
          compensationMin: formData.salaryMin,
          compensationMax: formData.salaryMax,
          yearsExperience: parseInt(formData.yearsOfExperience)
        }),
        // Flag for immediate processing
        processImmediately: true
      };
      
      console.log('Sending payload:', payload);

      const response = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/candidates');
        }, 2000);
      } else {
        setError(result.error || 'Failed to create candidate');
      }
    } catch (err) {
      console.error('Error creating candidate:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-green-200">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Candidate Created Successfully</h3>
            <p className="mt-2 text-sm text-gray-500">Redirecting to candidates list...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Candidate</h1>
              <p className="mt-2 text-gray-600">Create a new candidate profile manually</p>
            </div>
            <button
              onClick={() => router.push('/admin/candidates')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Candidates
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round((currentStep / TOTAL_STEPS) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User ID *
                    </label>
                    <input
                      type="text"
                      name="userId"
                      required
                      value={formData.userId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Enter unique user ID"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="candidate@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="+1234567890"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Step 2: Professional Background */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Professional Background</h3>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Role
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="e.g. CFO, Board Director"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Current company"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Industry
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="e.g. Technology, Finance"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="15"
                      />
                    </div>
                  
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Professional Summary
                      </label>
                      <textarea
                        name="summary"
                        rows={4}
                        value={formData.summary}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Brief professional summary highlighting your experience and achievements..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Board Experience */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Board Experience</h3>
                
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="boardExperience"
                        name="boardExperience"
                        type="checkbox"
                        checked={formData.boardExperience}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="boardExperience" className="ml-2 block text-sm text-gray-900">
                        I have board experience
                      </label>
                    </div>
                    
                    {formData.boardExperience && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Number of Board Positions
                          </label>
                          <input
                            type="number"
                            name="boardPositions"
                            value={formData.boardPositions}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                            placeholder="2"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Board Experience Details
                          </label>
                          <textarea
                            name="boardDetails"
                            rows={4}
                            value={formData.boardDetails}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                            placeholder="Please describe your board experience, including companies, roles, and key contributions."
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Work Experience */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Work Experience</h3>
                  
                  {formData.workExperiences.map((exp, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="text-md font-medium">Position {index + 1}</h4>
                        {formData.workExperiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWorkExperience(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Job Title</label>
                          <input
                            value={exp.title}
                            onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                            placeholder="CEO, CFO, Board Director, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Company</label>
                          <input
                            value={exp.companyName}
                            onChange={(e) => updateWorkExperience(index, 'companyName', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                            placeholder="Company name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                          value={exp.location}
                          onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          placeholder="London, UK"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Start Date</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">End Date</label>
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                            disabled={exp.isCurrent}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent}
                          onChange={(e) => updateWorkExperience(index, 'isCurrent', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          I currently work here
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          placeholder="Key responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addWorkExperience}
                    className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Another Position
                  </button>
                </div>
              )}
              
              {/* Step 5: Education & Skills */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Education & Skills</h3>
                  
                  {/* Education Section */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Education</h4>
                    {formData.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-medium">Education {index + 1}</h5>
                          {formData.education.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEducation(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Institution</label>
                            <input
                              value={edu.institution}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                              placeholder="University name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Degree</label>
                            <input
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                              placeholder="MBA, BSc, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                            <input
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                              placeholder="Business Administration"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                            <input
                              type="number"
                              value={edu.graduationDate}
                              onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                              placeholder="2010"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addEducation}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Education
                    </button>
                  </div>
                  
                  {/* Skills Section */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Key Skills</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {SKILL_OPTIONS.map((skill) => (
                        <label key={skill} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.keySkills.includes(skill)}
                            onChange={() => toggleSkill(skill, 'keySkills')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Functional Expertise */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Functional Expertise</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {FUNCTIONAL_EXPERTISE_OPTIONS.map((expertise) => (
                        <label key={expertise} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.functionalExpertise.includes(expertise)}
                            onChange={() => toggleSkill(expertise, 'functionalExpertise')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{expertise}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Industry Expertise */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Industry Expertise</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {INDUSTRY_EXPERTISE_OPTIONS.map((industry) => (
                        <label key={industry} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.industryExpertise.includes(industry)}
                            onChange={() => toggleSkill(industry, 'industryExpertise')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{industry}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 6: Availability & Preferences */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Availability & Preferences</h3>
                  
                  {/* Work Preferences */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Remote Preference
                      </label>
                      <select
                        name="remotePreference"
                        value={formData.remotePreference}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      >
                        <option value="">Select preference</option>
                        <option value="remote">Remote Only</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-site Only</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Availability
                      </label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      >
                        <option value="">Select availability</option>
                        <option value="immediately">Immediately</option>
                        <option value="2weeks">2 weeks</option>
                        <option value="1month">1 month</option>
                        <option value="3months">3 months</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Salary Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Salary Expectations</h4>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum Salary
                        </label>
                        <input
                          type="number"
                          name="salaryMin"
                          value={formData.salaryMin}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          placeholder="50000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Maximum Salary
                        </label>
                        <input
                          type="number"
                          name="salaryMax"
                          value={formData.salaryMax}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          placeholder="80000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Currency
                        </label>
                        <select
                          name="salaryCurrency"
                          value={formData.salaryCurrency}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Professional Links */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Professional Links</h4>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          GitHub URL
                        </label>
                        <input
                          type="url"
                          name="githubUrl"
                          value={formData.githubUrl}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Portfolio URL
                        </label>
                        <input
                          type="url"
                          name="portfolioUrl"
                          value={formData.portfolioUrl}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          placeholder="https://portfolio.example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Resume URL
                        </label>
                        <input
                          type="url"
                          name="resumeUrl"
                          value={formData.resumeUrl}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                          placeholder="https://drive.google.com/..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="activelySeeking"
                        name="activelySeeking"
                        type="checkbox"
                        checked={formData.activelySeeking}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="activelySeeking" className="ml-2 block text-sm text-gray-900">
                        Actively seeking new opportunities
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="availableImmediate"
                        name="availableImmediate"
                        type="checkbox"
                        checked={formData.availableImmediate}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="availableImmediate" className="ml-2 block text-sm text-gray-900">
                        Available immediately
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="willingToRelocate"
                        name="willingToRelocate"
                        type="checkbox"
                        checked={formData.willingToRelocate}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="willingToRelocate" className="ml-2 block text-sm text-gray-900">
                        Willing to relocate
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Active Profile (Profile is visible and searchable)
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="isAnonymized"
                        name="isAnonymized"
                        type="checkbox"
                        checked={formData.isAnonymized}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAnonymized" className="ml-2 block text-sm text-gray-900">
                        Anonymized Profile (Hide personal details in search results)
                      </label>
                    </div>
                  </div>
                </div>
              )}


              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/admin/candidates')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  
                  {currentStep < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !formData.userId}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Candidate'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}