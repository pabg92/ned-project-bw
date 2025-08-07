"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Upload, Check, User, Briefcase, Target, Award, DollarSign, FileText, Shield, Plus, X, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface DealExperience {
  dealType: string
  dealValue: string
  dealCurrency: string
  companyName: string
  role: string
  year: string
  description: string
  sector: string
}

interface StreamlinedFormData {
  // Step 1: Basic Info & Role
  firstName: string
  lastName: string
  email: string
  phone: string
  currentRole: string
  company: string
  headlineRole: string // ned/chair/advisor/trustee/senior-independent
  
  // Step 2: Expertise & Experience  
  specialistArea: string // Finance & Audit, Digital & Technology, etc.
  sectors: string[] // matches search filter sectors
  skills: string[] // matches search filter skills
  yearsOfExperience: string // matches search filter experience ranges
  experienceSummary: string
  boardExperience: string[] // matches search filter board experience types
  dealExperiences: DealExperience[] // Deal/transaction experience
  
  // Step 3: Availability & Compensation
  location: string // matches search filter locations
  availability: string // matches search filter availability
  remotePreference: string
  rateType: 'day' | 'annual' // Toggle for day rate vs annual salary
  minimumAcceptable: string // Minimum acceptable compensation (net)
  lastRate: string // Most recent rate
  targetRate: string // Expected/target rate
  bonusTerms: string
  
  // Step 4: Profile & References
  profilePhoto: File | null
  references: string
  awardsMediaSpeaking: string
  education: string
  alternativeQualifications: string
  clientAccessFlag: boolean
  cvFile: File | null
  termsAccepted: boolean
}

const TOTAL_STEPS = 4

const STEP_LABELS = [
  { label: "Basic Info", icon: User },
  { label: "Expertise", icon: Target },
  { label: "Availability", icon: DollarSign },
  { label: "Profile", icon: FileText },
]

// Options matching search filters
const HEADLINE_ROLE_OPTIONS = [
  { value: "ned", label: "Non-Executive Director (NED)" },
  { value: "chair", label: "Chair" },
  { value: "advisor", label: "Advisor" },
  { value: "trustee", label: "Trustee" },
  { value: "senior-independent", label: "Senior Independent Director" },
]

const SPECIALIST_AREA_OPTIONS = [
  "Finance & Audit",
  "Digital & Technology",
  "Risk & Compliance", 
  "HR & Remuneration",
  "Marketing & Brand",
  "Operations & Supply Chain",
  "Legal & Governance",
  "Strategy & Transformation",
  "ESG & Sustainability"
]

const SECTOR_OPTIONS = [
  "Financial Services",
  "Technology", 
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Energy",
  "Real Estate",
  "Media & Entertainment",
  "Telecommunications",
  "Consumer Goods",
  "Professional Services",
  "Education",
  "Public Sector",
  "Charity/Non-profit",
  "Transport & Logistics"
]

const SKILLS_OPTIONS = [
  "Digital Transformation",
  "Risk Management",
  "M&A",
  "ESG",
  "Cybersecurity",
  "Finance",
  "Strategy",
  "Governance",
  "Leadership",
  "Change Management",
  "Innovation",
  "International Expansion"
]

const BOARD_EXPERIENCE_OPTIONS = [
  { value: "ftse100", label: "FTSE 100" },
  { value: "ftse250", label: "FTSE 250" },
  { value: "aim", label: "AIM Listed" },
  { value: "private-equity", label: "Private Equity Backed" },
  { value: "startup", label: "Startup/Scale-up" },
  { value: "public-sector", label: "Public Sector" },
  { value: "charity", label: "Charity/Third Sector" },
]

const LOCATION_OPTIONS = [
  { value: "london", label: "London" },
  { value: "midlands", label: "Midlands" },
  { value: "north", label: "North (North East, North West, Yorkshire)" },
  { value: "south", label: "South (South East, South West)" },
  { value: "scotland", label: "Scotland" },
  { value: "wales", label: "Wales" },
  { value: "northern-ireland", label: "Northern Ireland" },
  { value: "international", label: "International" },
]

const DEAL_TYPE_OPTIONS = [
  { value: "acquisition", label: "Acquisition" },
  { value: "merger", label: "Merger" },
  { value: "divestiture", label: "Divestiture" },
  { value: "ipo", label: "IPO" },
  { value: "private-placement", label: "Private Placement" },
  { value: "leveraged-buyout", label: "Leveraged Buyout (LBO)" },
  { value: "management-buyout", label: "Management Buyout (MBO)" },
  { value: "restructuring", label: "Restructuring" },
  { value: "refinancing", label: "Refinancing" },
  { value: "joint-venture", label: "Joint Venture" },
  { value: "strategic-partnership", label: "Strategic Partnership" },
]

const DEAL_ROLE_OPTIONS = [
  { value: "led-transaction", label: "Led Transaction" },
  { value: "board-oversight", label: "Board Oversight" },
  { value: "advisor", label: "Advisor" },
  { value: "negotiated", label: "Negotiated Deal" },
  { value: "due-diligence", label: "Due Diligence Lead" },
  { value: "integration-lead", label: "Integration Lead" },
  { value: "committee-chair", label: "Committee Chair" },
]

const CURRENCY_OPTIONS = [
  { value: "GBP", label: "£ GBP" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
]

export default function StreamlinedSignUpForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<StreamlinedFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentRole: "",
    company: "",
    headlineRole: "",
    specialistArea: "",
    sectors: [],
    skills: [],
    yearsOfExperience: "",
    experienceSummary: "",
    boardExperience: [],
    dealExperiences: [],
    location: "",
    availability: "",
    remotePreference: "flexible",
    rateType: 'day',
    minimumAcceptable: "",
    lastRate: "",
    targetRate: "",
    bonusTerms: "",
    profilePhoto: null,
    references: "",
    awardsMediaSpeaking: "",
    education: "",
    alternativeQualifications: "",
    clientAccessFlag: false,
    cvFile: null,
    termsAccepted: false,
  })

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100

  const updateFormData = (field: keyof StreamlinedFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email"
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone is required"
        if (!formData.currentRole.trim()) newErrors.currentRole = "Current role is required"
        if (!formData.company.trim()) newErrors.company = "Company is required"
        if (!formData.headlineRole) newErrors.headlineRole = "Please select your target role type"
        break
        
      case 2:
        if (!formData.specialistArea) newErrors.specialistArea = "Specialist area is required"
        if (formData.sectors.length === 0) newErrors.sectors = "Select at least one sector"
        if (formData.skills.length === 0) newErrors.skills = "Select at least one skill"
        if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Years of experience is required"
        if (!formData.experienceSummary.trim()) newErrors.experienceSummary = "Experience summary is required"
        break
        
      case 3:
        if (!formData.location) newErrors.location = "Location is required"
        if (!formData.availability) newErrors.availability = "Availability is required"
        if (!formData.minimumAcceptable) newErrors.minimumAcceptable = "Minimum acceptable rate is required"
        if (!formData.lastRate) newErrors.lastRate = "Last rate is required"
        if (!formData.targetRate) newErrors.targetRate = "Target rate is required"
        break
        
      case 4:
        if (!formData.profilePhoto) newErrors.profilePhoto = "Profile photo is required"
        if (!formData.references.trim()) newErrors.references = "References are required"
        if (!formData.cvFile) newErrors.cvFile = "Please upload your CV"
        if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms"
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep() && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (validateStep()) {
      setIsSubmitting(true)
      try {
        // TODO: Implement submission logic
        console.log("Submitting streamlined form:", formData)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        router.push('/signup/success')
      } catch (error) {
        console.error('Submission failed:', error)
        alert('Failed to submit. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFileUpload = (field: 'profilePhoto' | 'cvFile', file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [field]: "File size must be less than 5MB" }))
      return
    }
    updateFormData(field, file)
  }

  // Deal experience management
  const addDealExperience = () => {
    setFormData(prev => ({
      ...prev,
      dealExperiences: [...prev.dealExperiences, {
        dealType: "",
        dealValue: "",
        dealCurrency: "GBP",
        companyName: "",
        role: "",
        year: "",
        description: "",
        sector: ""
      }]
    }))
  }

  const removeDealExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dealExperiences: prev.dealExperiences.filter((_, i) => i !== index)
    }))
  }

  const updateDealExperience = (index: number, field: keyof DealExperience, value: any) => {
    setFormData(prev => ({
      ...prev,
      dealExperiences: prev.dealExperiences.map((deal, i) => 
        i === index ? { ...deal, [field]: value } : deal
      )
    }))
  }

  return (
    <div className="py-8 sm:py-12 md:py-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bebas-neue text-gray-900 mb-4">
            Join Board Champions
          </h1>
          <p className="text-lg text-gray-600">
            Complete your profile in just 4 simple steps
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 md:p-10">
          {/* Progress Bar */}
          <div className="mb-8">
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
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <div className="relative flex justify-between">
                {STEP_LABELS.map((step, index) => {
                  const stepNumber = index + 1
                  const isActive = stepNumber === currentStep
                  const isCompleted = stepNumber < currentStep
                  const Icon = step.icon
                  
                  return (
                    <div key={stepNumber} className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mb-2",
                          isActive && "bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] text-white scale-110 shadow-lg",
                          isCompleted && "bg-green-500 text-white",
                          !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-medium transition-colors",
                        isActive && "text-[#6b93ce]",
                        isCompleted && "text-green-600",
                        !isActive && !isCompleted && "text-gray-400"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form Steps */}
          <div className="mb-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bebas-neue text-gray-900 mb-6">
                  Basic Information & Current Role
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
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
                      className={cn("mt-1", errors.lastName && "border-red-500")}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
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
                      className={cn("mt-1", errors.phone && "border-red-500")}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="currentRole">Current Role</Label>
                    <Input
                      id="currentRole"
                      value={formData.currentRole}
                      onChange={(e) => updateFormData("currentRole", e.target.value)}
                      placeholder="e.g., CEO, CFO, Director"
                      className={cn("mt-1", errors.currentRole && "border-red-500")}
                    />
                    {errors.currentRole && <p className="text-red-500 text-sm mt-1">{errors.currentRole}</p>}
                  </div>

                  <div>
                    <Label htmlFor="company">Current Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => updateFormData("company", e.target.value)}
                      className={cn("mt-1", errors.company && "border-red-500")}
                    />
                    {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                  </div>
                </div>

                <div>
                  <Label>Target Board Role</Label>
                  <p className="text-sm text-gray-600 mb-3">What type of board position are you seeking?</p>
                  <RadioGroup
                    value={formData.headlineRole}
                    onValueChange={(value) => updateFormData("headlineRole", value)}
                  >
                    {HEADLINE_ROLE_OPTIONS.map((role) => (
                      <div key={role.value} className="flex items-center space-x-3 mb-3">
                        <RadioGroupItem value={role.value} id={role.value} />
                        <Label htmlFor={role.value} className="font-normal cursor-pointer">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.headlineRole && <p className="text-red-500 text-sm mt-1">{errors.headlineRole}</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bebas-neue text-gray-900 mb-6">
                  Expertise & Experience
                </h2>

                <div>
                  <Label htmlFor="specialistArea">Primary Area of Expertise</Label>
                  <Select
                    value={formData.specialistArea}
                    onValueChange={(value) => updateFormData("specialistArea", value)}
                  >
                    <SelectTrigger className={cn("mt-1", errors.specialistArea && "border-red-500")}>
                      <SelectValue placeholder="Select your specialist area" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIST_AREA_OPTIONS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialistArea && <p className="text-red-500 text-sm mt-1">{errors.specialistArea}</p>}
                </div>

                <div>
                  <Label>Sector Experience</Label>
                  <p className="text-sm text-gray-600 mb-3">Select all sectors where you have experience</p>
                  <div className="grid grid-cols-2 gap-3">
                    {SECTOR_OPTIONS.map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={sector}
                          checked={formData.sectors.includes(sector)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("sectors", [...formData.sectors, sector])
                            } else {
                              updateFormData("sectors", formData.sectors.filter(s => s !== sector))
                            }
                          }}
                        />
                        <Label htmlFor={sector} className="font-normal cursor-pointer text-sm">
                          {sector}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.sectors && <p className="text-red-500 text-sm mt-1">{errors.sectors}</p>}
                </div>

                <div>
                  <Label>Key Skills</Label>
                  <p className="text-sm text-gray-600 mb-3">Select your top skills</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_OPTIONS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          if (formData.skills.includes(skill)) {
                            updateFormData("skills", formData.skills.filter(s => s !== skill))
                          } else {
                            updateFormData("skills", [...formData.skills, skill])
                          }
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                          formData.skills.includes(skill)
                            ? "bg-[#6b93ce] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                </div>

                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Select
                    value={formData.yearsOfExperience}
                    onValueChange={(value) => updateFormData("yearsOfExperience", value)}
                  >
                    <SelectTrigger className={cn("mt-1", errors.yearsOfExperience && "border-red-500")}>
                      <SelectValue placeholder="Select years of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5">0-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10-15">10-15 years</SelectItem>
                      <SelectItem value="15-20">15-20 years</SelectItem>
                      <SelectItem value="20+">20+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
                </div>

                <div>
                  <Label htmlFor="experienceSummary">Experience Summary</Label>
                  <Textarea
                    id="experienceSummary"
                    value={formData.experienceSummary}
                    onChange={(e) => updateFormData("experienceSummary", e.target.value)}
                    placeholder="Briefly describe your key achievements and experience (2-3 sentences)"
                    className={cn("mt-1 min-h-[100px]", errors.experienceSummary && "border-red-500")}
                  />
                  {errors.experienceSummary && <p className="text-red-500 text-sm mt-1">{errors.experienceSummary}</p>}
                </div>

                <div>
                  <Label>Board Experience</Label>
                  <p className="text-sm text-gray-600 mb-3">Select any relevant board experience</p>
                  <div className="space-y-2">
                    {BOARD_EXPERIENCE_OPTIONS.map((exp) => (
                      <div key={exp.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={exp.value}
                          checked={formData.boardExperience.includes(exp.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("boardExperience", [...formData.boardExperience, exp.value])
                            } else {
                              updateFormData("boardExperience", formData.boardExperience.filter(e => e !== exp.value))
                            }
                          }}
                        />
                        <Label htmlFor={exp.value} className="font-normal cursor-pointer">
                          {exp.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deal Experience Section */}
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Transaction & Deal Experience
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    For PE firms and executives: Share your most significant transactions and exits (optional)
                  </p>
                  
                  {formData.dealExperiences.length === 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDealExperience}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deal Experience
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {formData.dealExperiences.map((deal, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Deal {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDealExperience(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Deal Type</Label>
                              <Select
                                value={deal.dealType}
                                onValueChange={(value) => updateDealExperience(index, "dealType", value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select deal type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DEAL_TYPE_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Your Role</Label>
                              <Select
                                value={deal.role}
                                onValueChange={(value) => updateDealExperience(index, "role", value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DEAL_ROLE_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="col-span-2 sm:col-span-2">
                              <Label>Deal Value</Label>
                              <div className="flex gap-2 mt-1">
                                <Select
                                  value={deal.dealCurrency}
                                  onValueChange={(value) => updateDealExperience(index, "dealCurrency", value)}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CURRENCY_OPTIONS.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  value={deal.dealValue}
                                  onChange={(e) => updateDealExperience(index, "dealValue", e.target.value)}
                                  placeholder="e.g., 250"
                                  className="flex-1"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Enter value in millions</p>
                            </div>

                            <div>
                              <Label>Year</Label>
                              <Input
                                type="number"
                                value={deal.year}
                                onChange={(e) => updateDealExperience(index, "year", e.target.value)}
                                placeholder="2023"
                                min="1990"
                                max={new Date().getFullYear()}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Company/Target</Label>
                              <Input
                                value={deal.companyName}
                                onChange={(e) => updateDealExperience(index, "companyName", e.target.value)}
                                placeholder="Company name"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label>Sector</Label>
                              <Input
                                value={deal.sector}
                                onChange={(e) => updateDealExperience(index, "sector", e.target.value)}
                                placeholder="e.g., Technology"
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Deal Description & Impact</Label>
                            <Textarea
                              value={deal.description}
                              onChange={(e) => updateDealExperience(index, "description", e.target.value)}
                              placeholder="Briefly describe your role and the value created"
                              className="mt-1 min-h-[80px]"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addDealExperience}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Deal
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bebas-neue text-gray-900 mb-6">
                  Availability & Compensation
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => updateFormData("location", value)}
                    >
                      <SelectTrigger className={cn("mt-1", errors.location && "border-red-500")}>
                        <SelectValue placeholder="Select your location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) => updateFormData("availability", value)}
                    >
                      <SelectTrigger className={cn("mt-1", errors.availability && "border-red-500")}>
                        <SelectValue placeholder="When are you available?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="2weeks">Within 2 weeks</SelectItem>
                        <SelectItem value="1month">Within 1 month</SelectItem>
                        <SelectItem value="3months">Within 3 months</SelectItem>
                        <SelectItem value="6months">Within 6 months</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="remotePreference">Work Preference</Label>
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

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Compensation Expectations</h3>
                    <div className="flex items-center space-x-3">
                      <Label htmlFor="rate-type" className="text-sm font-normal">Rate Type:</Label>
                      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => updateFormData("rateType", "day")}
                          className={cn(
                            "px-3 py-1 rounded-md text-sm font-medium transition-all",
                            formData.rateType === "day" 
                              ? "bg-white text-gray-900 shadow-sm" 
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          Day Rate
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFormData("rateType", "annual")}
                          className={cn(
                            "px-3 py-1 rounded-md text-sm font-medium transition-all",
                            formData.rateType === "annual" 
                              ? "bg-white text-gray-900 shadow-sm" 
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          Annual
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="minimumAcceptable">Minimum (Net)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                        <Input
                          id="minimumAcceptable"
                          type="number"
                          value={formData.minimumAcceptable}
                          onChange={(e) => updateFormData("minimumAcceptable", e.target.value)}
                          placeholder={formData.rateType === "day" ? "800" : "90000"}
                          className={cn("pl-8", errors.minimumAcceptable && "border-red-500")}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          {formData.rateType === "day" ? "/day" : "/year"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        The lowest {formData.rateType === "day" ? "day rate" : "salary"} you would accept
                      </p>
                      {errors.minimumAcceptable && <p className="text-red-500 text-sm mt-1">{errors.minimumAcceptable}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="lastRate">Last Rate</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                        <Input
                          id="lastRate"
                          type="number"
                          value={formData.lastRate}
                          onChange={(e) => updateFormData("lastRate", e.target.value)}
                          placeholder={formData.rateType === "day" ? "1000" : "120000"}
                          className={cn("pl-8", errors.lastRate && "border-red-500")}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          {formData.rateType === "day" ? "/day" : "/year"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Your most recent {formData.rateType === "day" ? "day rate" : "annual compensation"}
                      </p>
                      {errors.lastRate && <p className="text-red-500 text-sm mt-1">{errors.lastRate}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="targetRate">Target Day Rate</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                        <Input
                          id="targetRate"
                          type="number"
                          value={formData.targetRate}
                          onChange={(e) => updateFormData("targetRate", e.target.value)}
                          placeholder={formData.rateType === "day" ? "1200" : "150000"}
                          className={cn("pl-8", errors.targetRate && "border-red-500")}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          {formData.rateType === "day" ? "/day" : "/year"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Your preferred current {formData.rateType === "day" ? "day rate" : "salary"}
                      </p>
                      {errors.targetRate && <p className="text-red-500 text-sm mt-1">{errors.targetRate}</p>}
                    </div>
                  </div>
                  
                  {formData.rateType === "day" && (
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>Note:</strong> Standard NED positions typically involve 2-5 days per month
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bonusTerms">Bonus & Terms Preferences</Label>
                  <Textarea
                    id="bonusTerms"
                    value={formData.bonusTerms}
                    onChange={(e) => updateFormData("bonusTerms", e.target.value)}
                    placeholder="e.g., Open to equity participation, prefer 3-year terms, flexible on bonus structure"
                    className="mt-1 min-h-[80px]"
                  />
                  <p className="text-sm text-gray-600 mt-1">Optional</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bebas-neue text-gray-900 mb-6">
                  Profile & References
                </h2>

                <div>
                  <Label>Profile Photo</Label>
                  <div className="mt-2">
                    {formData.profilePhoto ? (
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(formData.profilePhoto)}
                            alt="Profile preview"
                            className="h-24 w-24 rounded-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => updateFormData("profilePhoto", null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formData.profilePhoto.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.profilePhoto.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="photo-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <User className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                          <input
                            id="photo-upload"
                            type="file"
                            className="hidden"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload('profilePhoto', e.target.files[0])
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.profilePhoto && <p className="text-red-500 text-sm mt-1">{errors.profilePhoto}</p>}
                </div>

                <div>
                  <Label htmlFor="references">References</Label>
                  <Textarea
                    id="references"
                    value={formData.references}
                    onChange={(e) => updateFormData("references", e.target.value)}
                    placeholder="Please provide 2-3 professional references (name, title, relationship, contact)"
                    className={cn("mt-1 min-h-[100px]", errors.references && "border-red-500")}
                  />
                  {errors.references && <p className="text-red-500 text-sm mt-1">{errors.references}</p>}
                </div>

                <div>
                  <Label htmlFor="awardsMediaSpeaking">Awards, Media & Speaking Engagements</Label>
                  <Textarea
                    id="awardsMediaSpeaking"
                    value={formData.awardsMediaSpeaking}
                    onChange={(e) => updateFormData("awardsMediaSpeaking", e.target.value)}
                    placeholder="List any awards, media appearances, keynote speeches, or panel participation"
                    className="mt-1 min-h-[80px]"
                  />
                  <p className="text-sm text-gray-600 mt-1">Optional</p>
                </div>

                <div>
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={formData.education}
                    onChange={(e) => updateFormData("education", e.target.value)}
                    placeholder="List your educational qualifications (degree, institution, year)"
                    className="mt-1 min-h-[80px]"
                  />
                  <p className="text-sm text-gray-600 mt-1">Optional - you can choose to hide this on your profile</p>
                </div>

                <div>
                  <Label htmlFor="alternativeQualifications">Alternative Industry Qualifications</Label>
                  <Textarea
                    id="alternativeQualifications"
                    value={formData.alternativeQualifications}
                    onChange={(e) => updateFormData("alternativeQualifications", e.target.value)}
                    placeholder="e.g., IoD Certificate, ACCA, CFA, Industry certifications"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">Optional</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label htmlFor="clientAccess" className="font-medium">
                        Premium Client Access
                      </Label>
                      <p className="text-sm text-gray-600">
                        Allow verified premium clients to contact you directly
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="clientAccess"
                    checked={formData.clientAccessFlag}
                    onCheckedChange={(checked) => updateFormData("clientAccessFlag", checked)}
                  />
                </div>

                <div>
                  <Label>Upload CV/Resume</Label>
                  <div className="mt-2">
                    {formData.cvFile ? (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{formData.cvFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(formData.cvFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateFormData("cvFile", null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="cv-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                          </div>
                          <input
                            id="cv-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload('cvFile', e.target.files[0])
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.cvFile && <p className="text-red-500 text-sm mt-1">{errors.cvFile}</p>}
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => updateFormData("termsAccepted", checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms" className="font-normal cursor-pointer">
                      I agree to the terms and conditions
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      By submitting, you agree to our Privacy Policy and Terms of Service
                    </p>
                  </div>
                </div>
                {errors.termsAccepted && (
                  <p className="text-sm text-red-600">{errors.termsAccepted}</p>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "transition-all duration-300",
                currentStep === 1 && "invisible"
              )}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white disabled:opacity-50"
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