"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Upload, Check, FileText, User, Briefcase, Users, PenTool, CheckCircle, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface WorkExperience {
  companyName: string
  title: string
  location: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
  isBoardPosition: boolean
}

interface Education {
  institution: string
  degree: string
  fieldOfStudy: string
  graduationDate: string
}

interface FormData {
  // Step 1: Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  linkedinUrl: string
  
  // Step 2: Professional Background
  currentRole: string
  company: string
  industry: string
  yearsOfExperience: string
  summary: string
  
  // Step 3: Board Experience
  boardExperience: boolean
  boardPositions: number
  boardDetails: string
  
  // Step 4: Work Experience
  workExperiences: WorkExperience[]
  
  // Step 5: Education & Skills
  education: Education[]
  keySkills: string[]
  functionalExpertise: string[]
  industryExpertise: string[]
  
  // Step 6: Availability & Documents
  activelySeeking: boolean
  availability: string // immediately, 2weeks, 1month, 3months, 6months
  remotePreference: string // remote, hybrid, onsite, flexible
  willingToRelocate: boolean
  compensationMin: string
  compensationMax: string
  cvFile: File | null
  termsAccepted: boolean
}

interface FormErrors {
  [key: string]: string | undefined
}

const TOTAL_STEPS = 6

const STEP_LABELS = [
  { label: "Personal Info", icon: User },
  { label: "Professional", icon: Briefcase },
  { label: "Board Experience", icon: Users },
  { label: "Work History", icon: Briefcase },
  { label: "Education & Skills", icon: PenTool },
  { label: "Availability", icon: FileText },
]

// Predefined options for skills and expertise
const SKILL_OPTIONS = [
  "Financial Strategy", "M&A", "Corporate Finance", "Risk Management", 
  "Digital Transformation", "ESG & Sustainability", "Audit & Compliance",
  "Strategic Planning", "Leadership", "Change Management", "Innovation"
]

const FUNCTIONAL_EXPERTISE_OPTIONS = [
  "CEO Leadership", "CFO", "Strategic Planning", "Investor Relations",
  "Treasury Management", "Financial Reporting", "Risk Management",
  "Cost Optimization", "M&A", "Data Analytics"
]

const INDUSTRY_OPTIONS = [
  "Financial Services", "Technology", "Healthcare", "Retail",
  "Manufacturing", "Energy", "Real Estate", "Media & Entertainment",
  "Telecommunications", "Consumer Goods", "Professional Services"
]

export default function SignUpForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    currentRole: "",
    company: "",
    industry: "",
    yearsOfExperience: "",
    summary: "",
    boardExperience: false,
    boardPositions: 0,
    boardDetails: "",
    workExperiences: [{
      companyName: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      isBoardPosition: false
    }],
    education: [{
      institution: "",
      degree: "",
      fieldOfStudy: "",
      graduationDate: ""
    }],
    keySkills: [],
    functionalExpertise: [],
    industryExpertise: [],
    activelySeeking: false,
    availability: "immediately",
    remotePreference: "flexible",
    willingToRelocate: false,
    compensationMin: "",
    compensationMax: "",
    cvFile: null,
    termsAccepted: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('signupFormData')
    const savedStep = localStorage.getItem('signupFormStep')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Ensure all fields are initialized even if missing from saved data
        setFormData({
          ...parsed,
          // String fields
          firstName: parsed.firstName || "",
          lastName: parsed.lastName || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          location: parsed.location || "",
          linkedinUrl: parsed.linkedinUrl || "",
          currentRole: parsed.currentRole || "",
          company: parsed.company || "",
          industry: parsed.industry || "",
          yearsOfExperience: parsed.yearsOfExperience || "",
          summary: parsed.summary || "",
          boardDetails: parsed.boardDetails || "",
          compensationMin: parsed.compensationMin || "",
          compensationMax: parsed.compensationMax || "",
          // Boolean fields
          boardExperience: parsed.boardExperience ?? false,
          activelySeeking: parsed.activelySeeking ?? false,
          willingToRelocate: parsed.willingToRelocate ?? false,
          termsAccepted: parsed.termsAccepted ?? false,
          // String fields with defaults
          availability: parsed.availability || "immediately",
          remotePreference: parsed.remotePreference || "flexible",
          // Number fields
          boardPositions: parsed.boardPositions || 0,
          // Array fields
          keySkills: parsed.keySkills || [],
          functionalExpertise: parsed.functionalExpertise || [],
          industryExpertise: parsed.industryExpertise || [],
          workExperiences: parsed.workExperiences || [{
            companyName: "",
            title: "",
            location: "",
            startDate: "",
            endDate: "",
            isCurrent: false,
            description: "",
            isBoardPosition: false
          }],
          education: parsed.education || [{
            institution: "",
            degree: "",
            fieldOfStudy: "",
            graduationDate: ""
          }],
          // File field
          cvFile: null // Files can't be stored in localStorage
        })
      } catch (e) {
        console.error('Failed to load saved form data')
      }
    }
    if (savedStep) {
      setCurrentStep(parseInt(savedStep))
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('signupFormData', JSON.stringify(formData))
    localStorage.setItem('signupFormStep', currentStep.toString())
  }, [formData, currentStep])

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = () => {
    const newErrors: FormErrors = {}
    
    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email"
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone is required"
        if (!formData.location.trim()) newErrors.location = "Location is required"
        break
      case 2:
        if (!formData.currentRole.trim()) newErrors.currentRole = "Current role is required"
        if (!formData.company.trim()) newErrors.company = "Company is required"
        if (!formData.industry.trim()) newErrors.industry = "Industry is required"
        if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = "Years of experience is required"
        if (!formData.summary.trim()) {
          newErrors.summary = "Professional summary is required"
        } else if (formData.summary.length < 50) {
          newErrors.summary = "Professional summary must be at least 50 characters"
        }
        break
      case 3:
        // Board experience is optional, no validation needed
        break
      case 4:
        // At least one work experience is required
        const hasValidWorkExp = formData.workExperiences.some(exp => 
          exp.companyName.trim() && exp.title.trim()
        )
        if (!hasValidWorkExp) {
          newErrors.workExperiences = "At least one work experience is required"
        }
        break
      case 5:
        if (formData.keySkills.length === 0) newErrors.keySkills = "Select at least one core skill"
        if (formData.functionalExpertise.length === 0) newErrors.functionalExpertise = "Select at least one functional expertise"
        break
      case 6:
        if (!formData.cvFile) newErrors.cvFile = "Please upload your CV/Resume"
        if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions"
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep() && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (validateStep()) {
      setIsSubmitting(true)
      try {
        // Prepare tags from skills and expertise
        const tags = [
          ...formData.keySkills.map(skill => ({ name: skill, category: 'skill' })),
          ...formData.functionalExpertise.map(exp => ({ name: exp, category: 'expertise' })),
          ...formData.industryExpertise.map(ind => ({ name: ind, category: 'industry' }))
        ]

        // Prepare the data
        const signupData = {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            title: formData.currentRole,
            summary: formData.summary,
            experience: getExperienceLevel(formData.yearsOfExperience),
            location: formData.location,
            linkedinUrl: formData.linkedinUrl,
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
              compensationMin: formData.compensationMin,
              compensationMax: formData.compensationMax,
              yearsExperience: parseInt(formData.yearsOfExperience),
              availability: formData.availability,
              remotePreference: formData.remotePreference
            }),
        }
        
        console.log('Submitting signup data:', signupData)
        console.log('Experience level:', getExperienceLevel(formData.yearsOfExperience))
        console.log('Summary length:', formData.summary.length)
        
        // Create the candidate profile via public signup API
        const response = await fetch('/api/v1/candidates/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupData)
        })

        if (!response.ok) {
          const error = await response.json()
          console.error('Signup API error:', error)
          if (error.errors) {
            // Zod validation errors
            const validationErrors = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('\n')
            throw new Error(`Validation errors:\n${validationErrors}`)
          }
          throw new Error(error.message || 'Failed to create profile')
        }

        console.log("Profile created successfully")
        // Clear saved data
        localStorage.removeItem('signupFormData')
        localStorage.removeItem('signupFormStep')
        // Redirect to success page
        router.push('/signup/success')
      } catch (error) {
        console.error('Submission failed:', error)
        if (error instanceof Error) {
          alert(error.message)
        } else {
          alert('Failed to create profile. Please try again.')
        }
        setIsSubmitting(false)
      }
    }
  }

  // Helper function to map years of experience to experience level
  const getExperienceLevel = (years: string): string => {
    const yearsNum = parseInt(years)
    if (yearsNum <= 5) return 'junior'
    if (yearsNum <= 10) return 'mid'
    if (yearsNum <= 20) return 'senior'
    if (yearsNum <= 25) return 'lead'
    return 'executive'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, cvFile: "File size must be less than 5MB" }))
        return
      }
      updateFormData("cvFile", file)
    }
  }

  // Work experience management
  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, {
        companyName: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
        isBoardPosition: false
      }]
    }))
  }

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index)
    }))
  }

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  // Education management
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        graduationDate: ""
      }]
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  // Skills management
  const toggleSkill = (skill: string, category: 'keySkills' | 'functionalExpertise' | 'industryExpertise') => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(skill)
        ? prev[category].filter(s => s !== skill)
        : [...prev[category], skill]
    }))
  }

  return (
    <div className="py-8 sm:py-12 md:py-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bebas-neue text-gray-900 mb-3 sm:mb-4">
            Join Our Network
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4 sm:px-0">
            Complete the form below to apply for membership in our exclusive network of board directors.
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-10">
          {/* Enhanced Progress Bar with Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            {/* Step Indicators */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              {/* Step Circles */}
              <div className="relative flex justify-between">
                {STEP_LABELS.map((step, index) => {
                  const stepNumber = index + 1
                  const isActive = stepNumber === currentStep
                  const isCompleted = stepNumber < currentStep
                  const Icon = step.icon
                  
                  return (
                    <div
                      key={stepNumber}
                      className="flex flex-col items-center cursor-pointer group"
                      onClick={() => {
                        if (stepNumber < currentStep) {
                          setCurrentStep(stepNumber)
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 mb-1 sm:mb-2",
                          isActive && "bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] text-white scale-110 shadow-lg",
                          isCompleted && "bg-green-500 text-white",
                          !isActive && !isCompleted && "bg-gray-200 text-gray-500",
                          stepNumber < currentStep && "hover:scale-105 cursor-pointer"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs font-medium transition-colors",
                          isActive && "text-[#6b93ce]",
                          isCompleted && "text-green-600",
                          !isActive && !isCompleted && "text-gray-400",
                          "hidden xs:block"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form Steps */}
          <div className="mb-6 sm:mb-8">
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      placeholder="John"
                      className={cn("mt-1", errors.firstName && "border-red-500")}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      placeholder="Doe"
                      className={cn("mt-1", errors.lastName && "border-red-500")}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="john.doe@example.com"
                    className={cn("mt-1", errors.email && "border-red-500")}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+44 7557520069"
                    className={cn("mt-1", errors.phone && "border-red-500")}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    placeholder="London, UK"
                    className={cn("mt-1", errors.location && "border-red-500")}
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>

                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => updateFormData("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Optional</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Professional Background
                </h2>

                <div>
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    value={formData.currentRole}
                    onChange={(e) => updateFormData("currentRole", e.target.value)}
                    placeholder="CEO, CFO, CTO, etc."
                    className={cn("mt-1", errors.currentRole && "border-red-500")}
                  />
                  {errors.currentRole && <p className="text-red-500 text-sm mt-1">{errors.currentRole}</p>}
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => updateFormData("company", e.target.value)}
                    placeholder="Company name"
                    className={cn("mt-1", errors.company && "border-red-500")}
                  />
                  {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => updateFormData("industry", value)}
                  >
                    <SelectTrigger className={cn("mt-1", errors.industry && "border-red-500")}>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
                </div>

                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => updateFormData("yearsOfExperience", e.target.value)}
                    placeholder="15"
                    className={cn("mt-1", errors.yearsOfExperience && "border-red-500")}
                  />
                  {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
                </div>

                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => updateFormData("summary", e.target.value)}
                    placeholder="Please provide a brief professional summary highlighting your career achievements and expertise."
                    className={cn("mt-1 min-h-[150px]", errors.summary && "border-red-500")}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 50 characters ({formData.summary.length}/50)
                  </p>
                  {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary}</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Board Experience Overview
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> You'll add specific board positions in the next step (Work History). 
                    Simply mark them as board positions using the checkbox provided.
                  </p>
                </div>

                <div>
                  <Label>Do you have board experience?</Label>
                  <RadioGroup
                    value={formData.boardExperience ? "yes" : "no"}
                    onValueChange={(value) => updateFormData("boardExperience", value === "yes")}
                    className="mt-4 space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="no-board-exp" />
                      <Label htmlFor="no-board-exp" className="font-normal">
                        No board experience
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="has-board-exp" />
                      <Label htmlFor="has-board-exp" className="font-normal">
                        Yes, I have board experience
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.boardExperience && (
                  <div>
                    <Label htmlFor="boardDetails">Brief Overview (Optional)</Label>
                    <Textarea
                      id="boardDetails"
                      value={formData.boardDetails}
                      onChange={(e) => updateFormData("boardDetails", e.target.value)}
                      placeholder="Optionally provide a brief overview of your board experience philosophy or approach."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Work Experience
                </h2>

                {errors.workExperiences && (
                  <p className="text-red-500 text-sm">{errors.workExperiences}</p>
                )}

                {formData.workExperiences.map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">Position {index + 1}</h3>
                      {formData.workExperiences.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWorkExperience(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => updateWorkExperience(index, "title", e.target.value)}
                          placeholder="CEO, CFO, Board Director, etc."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.companyName}
                          onChange={(e) => updateWorkExperience(index, "companyName", e.target.value)}
                          placeholder="Company name"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Location</Label>
                      <Input
                        value={exp.location}
                        onChange={(e) => updateWorkExperience(index, "location", e.target.value)}
                        placeholder="London, UK"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateWorkExperience(index, "startDate", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateWorkExperience(index, "endDate", e.target.value)}
                          disabled={exp.isCurrent}
                          className="mt-1"
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id={`current-${index}`}
                            checked={exp.isCurrent}
                            onCheckedChange={(checked) => 
                              updateWorkExperience(index, "isCurrent", checked as boolean)
                            }
                          />
                          <Label htmlFor={`current-${index}`} className="text-sm font-normal">
                            Currently working here
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateWorkExperience(index, "description", e.target.value)}
                        placeholder="Describe your key responsibilities and achievements"
                        className="mt-1 min-h-[100px]"
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        id={`board-${index}`}
                        checked={exp.isBoardPosition}
                        onCheckedChange={(checked) => 
                          updateWorkExperience(index, "isBoardPosition", checked as boolean)
                        }
                      />
                      <Label htmlFor={`board-${index}`} className="text-sm font-normal">
                        This is a board position (Director, Trustee, Chair, etc.)
                      </Label>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addWorkExperience}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Position
                </Button>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Education & Skills
                </h2>

                {/* Education Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Education</h3>
                  {formData.education.map((edu, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        {formData.education.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, "institution", e.target.value)}
                            placeholder="University name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            placeholder="MBA, BSc, etc."
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Field of Study</Label>
                          <Input
                            value={edu.fieldOfStudy}
                            onChange={(e) => updateEducation(index, "fieldOfStudy", e.target.value)}
                            placeholder="Business Administration"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Graduation Year</Label>
                          <Input
                            type="number"
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(index, "graduationDate", e.target.value)}
                            placeholder="2005"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEducation}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Education
                  </Button>
                </div>

                {/* Core Skills */}
                <div>
                  <Label>Core Skills</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SKILL_OPTIONS.map((skill) => (
                      <div
                        key={skill}
                        className={cn(
                          "border rounded-lg p-2 text-sm cursor-pointer transition-all",
                          formData.keySkills.includes(skill)
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        )}
                        onClick={() => toggleSkill(skill, 'keySkills')}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                  {errors.keySkills && <p className="text-red-500 text-sm mt-1">{errors.keySkills}</p>}
                </div>

                {/* Functional Expertise */}
                <div>
                  <Label>Functional Expertise</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FUNCTIONAL_EXPERTISE_OPTIONS.map((expertise) => (
                      <div
                        key={expertise}
                        className={cn(
                          "border rounded-lg p-2 text-sm cursor-pointer transition-all",
                          formData.functionalExpertise.includes(expertise)
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        )}
                        onClick={() => toggleSkill(expertise, 'functionalExpertise')}
                      >
                        {expertise}
                      </div>
                    ))}
                  </div>
                  {errors.functionalExpertise && <p className="text-red-500 text-sm mt-1">{errors.functionalExpertise}</p>}
                </div>

                {/* Industry Expertise */}
                <div>
                  <Label>Industry Expertise</Label>
                  <p className="text-sm text-gray-500 mb-3">Select up to 3</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <div
                        key={industry}
                        className={cn(
                          "border rounded-lg p-2 text-sm cursor-pointer transition-all",
                          formData.industryExpertise.includes(industry)
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-white border-gray-300 hover:border-gray-400",
                          formData.industryExpertise.length >= 3 && !formData.industryExpertise.includes(industry)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        )}
                        onClick={() => {
                          if (formData.industryExpertise.length < 3 || formData.industryExpertise.includes(industry)) {
                            toggleSkill(industry, 'industryExpertise')
                          }
                        }}
                      >
                        {industry}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Availability & Documents
                </h2>

                {/* Availability */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Availability</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="activelySeeking"
                        checked={formData.activelySeeking}
                        onCheckedChange={(checked) => 
                          updateFormData("activelySeeking", checked as boolean)
                        }
                      />
                      <Label htmlFor="activelySeeking" className="font-normal">
                        I am actively seeking board positions
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="availability">When are you available?</Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) => updateFormData("availability", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediately">Immediately</SelectItem>
                          <SelectItem value="2weeks">2 weeks</SelectItem>
                          <SelectItem value="1month">1 month</SelectItem>
                          <SelectItem value="3months">3 months</SelectItem>
                          <SelectItem value="6months">6 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="remotePreference">Work preference</Label>
                      <Select
                        value={formData.remotePreference}
                        onValueChange={(value) => updateFormData("remotePreference", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select work preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote only</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="onsite">On-site only</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="willingToRelocate"
                        checked={formData.willingToRelocate}
                        onCheckedChange={(checked) => 
                          updateFormData("willingToRelocate", checked as boolean)
                        }
                      />
                      <Label htmlFor="willingToRelocate" className="font-normal">
                        I am willing to travel internationally
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Compensation Expectations */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Compensation Expectations (Optional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="compensationMin">Minimum (Annual)</Label>
                      <Input
                        id="compensationMin"
                        type="number"
                        value={formData.compensationMin}
                        onChange={(e) => updateFormData("compensationMin", e.target.value)}
                        placeholder="50000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="compensationMax">Maximum (Annual)</Label>
                      <Input
                        id="compensationMax"
                        type="number"
                        value={formData.compensationMax}
                        onChange={(e) => updateFormData("compensationMax", e.target.value)}
                        placeholder="150000"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">In GBP (£)</p>
                </div>

                {/* CV Upload */}
                <div>
                  <Label>Upload your CV/Resume</Label>
                  <div
                    className={cn(
                      "mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-300",
                      isDragging ? "border-[#6b93ce] bg-blue-50" : "border-gray-300 hover:border-[#6b93ce]"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-1 text-center">
                      {formData.cvFile ? (
                        <div className="animate-fadeIn">
                          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                          <p className="text-sm font-medium text-gray-900">
                            {formData.cvFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(formData.cvFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => updateFormData("cvFile", null)}
                          >
                            Remove file
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className={cn(
                            "mx-auto h-12 w-12 transition-colors",
                            isDragging ? "text-[#6b93ce]" : "text-gray-400"
                          )} />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-medium text-[#6b93ce] hover:text-[#5a82bd] focus-within:outline-none"
                            >
                              <span>Drag and drop your file here, or click to browse</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0]
                                    if (file.size > 5 * 1024 * 1024) {
                                      setErrors(prev => ({ ...prev, cvFile: "File size must be less than 5MB" }))
                                      return
                                    }
                                    updateFormData("cvFile", file)
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PDF, DOC or DOCX up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.cvFile && <p className="text-red-500 text-sm mt-1">{errors.cvFile}</p>}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => 
                        updateFormData("termsAccepted", checked as boolean)
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor="terms" className="font-normal cursor-pointer">
                        I agree to the terms and conditions
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        By submitting this form, you agree to our{" "}
                        <Link href="/privacy" className="text-[#6b93ce] hover:underline">
                          Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link href="/terms" className="text-[#6b93ce] hover:underline">
                          Terms of Service
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-sm text-red-600">
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 sm:mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "bg-black text-white hover:bg-gray-800 border-none transition-all duration-300 w-full sm:w-auto",
                currentStep === 1 && "invisible sm:visible"
              )}
            >
              <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white px-6 sm:px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                Next
                <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white px-6 sm:px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse">Submitting...</span>
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}