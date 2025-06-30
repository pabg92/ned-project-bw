"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Upload, Check, FileText, User, Briefcase, Users, PenTool, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface FormData {
  // Step 1: Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Step 2: Professional Background
  currentRole: string
  company: string
  industry: string
  yearsOfExperience: string
  
  // Step 3: Board Experience
  boardExperience: string
  
  // Step 4: Skills & Expertise
  keySkills: string
  professionalBio: string
  
  // Step 5: Documents & Consent
  cvFile: File | null
  linkedinUrl: string
  termsAccepted: boolean
}

interface FormErrors {
  [key: string]: string | undefined
}

const TOTAL_STEPS = 5

const STEP_LABELS = [
  { label: "Personal Info", icon: User },
  { label: "Professional", icon: Briefcase },
  { label: "Board Experience", icon: Users },
  { label: "Skills", icon: PenTool },
  { label: "Documents", icon: FileText },
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
    currentRole: "",
    company: "",
    industry: "",
    yearsOfExperience: "",
    boardExperience: "",
    keySkills: "",
    professionalBio: "",
    cvFile: null,
    linkedinUrl: "",
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
        setFormData(parsed)
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
        break
      case 2:
        if (!formData.currentRole.trim()) newErrors.currentRole = "Current role is required"
        if (!formData.company.trim()) newErrors.company = "Company is required"
        if (!formData.industry.trim()) newErrors.industry = "Industry is required"
        if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = "Years of experience is required"
        break
      case 3:
        if (!formData.boardExperience) newErrors.boardExperience = "Please select your board experience"
        break
      case 4:
        if (!formData.keySkills.trim()) newErrors.keySkills = "Key skills are required"
        if (!formData.professionalBio.trim()) {
          newErrors.professionalBio = "Professional bio is required"
        } else if (formData.professionalBio.length < 50) {
          newErrors.professionalBio = "Professional bio must be at least 50 characters"
        }
        break
      case 5:
        if (!formData.cvFile) newErrors.cvFile = "Please upload your CV/Resume"
        if (!formData.linkedinUrl.trim()) {
          newErrors.linkedinUrl = "LinkedIn URL is required"
        } else if (!formData.linkedinUrl.includes("linkedin.com")) {
          newErrors.linkedinUrl = "Please enter a valid LinkedIn URL"
        }
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log("Form submitted:", formData)
        // Clear saved data
        localStorage.removeItem('signupFormData')
        localStorage.removeItem('signupFormStep')
        // Redirect to success page
        router.push('/signup/success')
      } catch (error) {
        console.error('Submission failed:', error)
        setIsSubmitting(false)
      }
    }
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

  return (
    <div className="py-8 sm:py-12 md:py-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => updateFormData("industry", e.target.value)}
                    placeholder="Technology, Finance, Healthcare, etc."
                    className={cn("mt-1", errors.industry && "border-red-500")}
                  />
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Board Experience
                </h2>

                <div>
                  <Label>Board Experience</Label>
                  <RadioGroup
                    value={formData.boardExperience}
                    onValueChange={(value) => updateFormData("boardExperience", value)}
                    className="mt-4 space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no-experience" id="no-experience" />
                      <Label htmlFor="no-experience" className="font-normal">
                        No previous board experience
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="previous-experience" id="previous-experience" />
                      <Label htmlFor="previous-experience" className="font-normal">
                        Previous board experience
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="currently-serving" id="currently-serving" />
                      <Label htmlFor="currently-serving" className="font-normal">
                        Currently serving on board(s)
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.boardExperience && <p className="text-red-500 text-sm mt-2">{errors.boardExperience}</p>}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Skills & Expertise
                </h2>

                <div>
                  <Label htmlFor="keySkills">Key Skills & Expertise</Label>
                  <Input
                    id="keySkills"
                    value={formData.keySkills}
                    onChange={(e) => updateFormData("keySkills", e.target.value)}
                    placeholder="Strategic Planning, Financial Oversight, Digital Transformation, etc."
                    className={cn("mt-1", errors.keySkills && "border-red-500")}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your key skills separated by commas
                  </p>
                  {errors.keySkills && <p className="text-red-500 text-sm mt-1">{errors.keySkills}</p>}
                </div>

                <div>
                  <Label htmlFor="professionalBio">Professional Bio</Label>
                  <Textarea
                    id="professionalBio"
                    value={formData.professionalBio}
                    onChange={(e) => updateFormData("professionalBio", e.target.value)}
                    placeholder="Please provide a brief professional biography highlighting your career achievements and expertise."
                    className={cn("mt-1 min-h-[200px]", errors.professionalBio && "border-red-500")}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 50 characters ({formData.professionalBio.length}/50)
                  </p>
                  {errors.professionalBio && <p className="text-red-500 text-sm mt-1">{errors.professionalBio}</p>}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Documents & Consent
                </h2>

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
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 bg-[#6b93ce] text-white hover:bg-[#5a82bd] border-none"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Browse Files
                  </Button>
                  {errors.cvFile && <p className="text-red-500 text-sm mt-1">{errors.cvFile}</p>}
                </div>

                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => updateFormData("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className={cn("mt-1", errors.linkedinUrl && "border-red-500")}
                  />
                  {errors.linkedinUrl ? (
                    <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">
                      Please enter a valid LinkedIn URL.
                    </p>
                  )}
                </div>

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