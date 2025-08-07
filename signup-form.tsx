"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Upload, Check, FileText, User, Briefcase, Users, PenTool, CheckCircle, Plus, X, TrendingUp, Sparkles } from "lucide-react"
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
  companyType?: string // Added for board company type
  isHighlighted?: boolean // Added for featured roles on profile
}

interface OtherExperience {
  title: string
  organization: string
  description: string
  startDate: string
  endDate: string
}

interface Education {
  institution: string
  degree: string
  fieldOfStudy: string
  graduationDate: string
}

interface DealExperience {
  dealType: string // M&A, IPO, PE, Restructuring, etc.
  dealValue: string
  dealCurrency: string
  companyName: string
  role: string // Led, Advised, Board oversight, etc.
  year: string
  description: string
  sector: string
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
  roleTypes: string[] // Added for role type selection
  company: string
  areaOfSpecialism: string
  sectors: string[] // Changed from industry to sectors (multi-select)
  yearsOfExperience: string
  careerHighlights: string // Changed from summary
  currentlyEmployed: boolean
  
  // Step 3: Board Experience
  boardExperience: boolean
  boardPositions: number
  boardExperienceTypes: string[] // Added for board experience types
  boardDetails: string
  keynoteMediaExperience: boolean // Added for keynote/media flag
  
  // Step 4: Work Experience
  workExperiences: WorkExperience[]
  alternativeQualifications: string
  otherExperiences: OtherExperience[]
  
  // Step 5: Transaction/Deal Experience
  dealExperiences: DealExperience[]
  
  // Step 6: Education & Skills
  education: Education[]
  popularSkills: string[] // Merged all skills into one
  references: string // Can be text or will handle file upload
  profilePhotoFile: File | null
  
  // Step 7: Availability & Documents
  activelySeeking: boolean
  availability: string // immediately, 2weeks, 1month, 3months, 6months
  remotePreference: string // remote, hybrid, onsite, flexible
  willingToTravel: boolean // Changed from relocate to travel
  minimumAcceptableRate: string // Net rate
  lastRate: string
  targetDayRate: string
  visibility: string // public, recruiter-only, hidden
  cvFile: File | null
  termsAccepted: boolean
}

interface FormErrors {
  [key: string]: string | undefined
}

const TOTAL_STEPS = 7

// Location options for UK regions
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

const STEP_LABELS = [
  { label: "Personal Info", icon: User },
  { label: "Professional", icon: Briefcase },
  { label: "Board Experience", icon: Users },
  { label: "Work History", icon: Briefcase },
  { label: "Deal Experience", icon: TrendingUp },
  { label: "Education & Skills", icon: PenTool },
  { label: "Availability", icon: FileText },
]

// Predefined options for roles
const ROLE_TYPE_OPTIONS = [
  { value: "chair", label: "Chair" },
  { value: "ned", label: "Non-Executive Director" },
  { value: "advisor", label: "Advisor" },
  { value: "trustee", label: "Trustee" },
  { value: "senior-independent", label: "Senior Independent Director" },
]

const BOARD_EXPERIENCE_TYPE_OPTIONS = [
  { value: "ftse100", label: "FTSE 100" },
  { value: "ftse250", label: "FTSE 250" },
  { value: "aim", label: "AIM Listed" },
  { value: "private-equity", label: "Private Equity Backed" },
  { value: "startup", label: "Startup/Scale-up" },
  { value: "public-sector", label: "Public Sector" },
  { value: "charity", label: "Charity/Third Sector" },
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

// Predefined options for skills - merged from various categories
const POPULAR_SKILLS_OPTIONS = [
  // Core Skills
  "Financial Strategy", "M&A", "Corporate Finance", "Risk Management", 
  "Digital Transformation", "ESG & Sustainability", "Audit & Compliance",
  "Strategic Planning", "Leadership", "Change Management", "Innovation",
  // Functional Expertise
  "CEO Leadership", "CFO", "Strategic Planning", "Investor Relations",
  "Treasury Management", "Financial Reporting", "Cost Optimization",
  "Data Analytics", "Operations Management", "HR & People Strategy",
  // Additional
  "Governance", "Cybersecurity", "Marketing & Brand", "Supply Chain",
  "Legal & Regulatory", "Technology Strategy", "International Expansion"
]

const SECTOR_OPTIONS = [
  "Financial Services", "Technology", "Healthcare", "Retail",
  "Manufacturing", "Energy", "Real Estate", "Media & Entertainment",
  "Telecommunications", "Consumer Goods", "Professional Services",
  "Education", "Public Sector", "Charity/Non-profit", "Transport & Logistics"
]

// Area of Specialism options
const AREA_OF_SPECIALISM_OPTIONS = [
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
    roleTypes: [],
    company: "",
    areaOfSpecialism: "",
    sectors: [],
    yearsOfExperience: "",
    careerHighlights: "",
    currentlyEmployed: false,
    boardExperience: false,
    boardPositions: 0,
    boardExperienceTypes: [],
    boardDetails: "",
    keynoteMediaExperience: false,
    workExperiences: [{
      companyName: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      isBoardPosition: false,
      companyType: "",
      isHighlighted: false
    }],
    alternativeQualifications: "",
    otherExperiences: [],
    dealExperiences: [],
    education: [{
      institution: "",
      degree: "",
      fieldOfStudy: "",
      graduationDate: ""
    }],
    popularSkills: [],
    references: "",
    profilePhotoFile: null,
    activelySeeking: false,
    availability: "immediately",
    remotePreference: "flexible",
    willingToTravel: false,
    minimumAcceptableRate: "",
    lastRate: "",
    targetDayRate: "",
    visibility: "public",
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
          roleTypes: parsed.roleTypes || [],
          boardExperienceTypes: parsed.boardExperienceTypes || [],
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
            isBoardPosition: false,
            companyType: ""
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
        if (!formData.areaOfSpecialism.trim()) newErrors.areaOfSpecialism = "Area of specialism is required"
        if (formData.sectors.length === 0) newErrors.sectors = "Select at least one sector"
        if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = "Years of experience is required"
        if (!formData.careerHighlights.trim()) {
          newErrors.careerHighlights = "Career highlights are required"
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
        // Deal experience is optional
        break
      case 6:
        if (formData.popularSkills.length === 0) newErrors.popularSkills = "Select at least one skill"
        if (!formData.profilePhotoFile) newErrors.profilePhotoFile = "Please upload a profile photo"
        break
      case 7:
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
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (validateStep()) {
      setIsSubmitting(true)
      try {
        // Prepare tags from popular skills and sectors
        const tags = [
          ...formData.popularSkills.map(skill => ({ name: skill, category: 'skill' })),
          ...formData.sectors.map(sector => ({ name: sector, category: 'industry' }))
        ]

        // Prepare the data
        const signupData = {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            title: formData.currentRole,
            summary: formData.careerHighlights,
            experience: getExperienceLevel(formData.yearsOfExperience),
            location: formData.location,
            linkedinUrl: formData.linkedinUrl,
            adminNotes: JSON.stringify({
              phone: formData.phone,
              company: formData.company,
              areaOfSpecialism: formData.areaOfSpecialism,
              sectors: formData.sectors,
              currentlyEmployed: formData.currentlyEmployed,
              boardExperience: formData.boardExperience,
              boardPositions: formData.boardPositions,
              boardExperienceTypes: formData.boardExperienceTypes,
              boardDetails: formData.boardDetails,
              keynoteMediaExperience: formData.keynoteMediaExperience,
              roleTypes: formData.roleTypes,
              workExperiences: formData.workExperiences,
              highlightedRoles: formData.workExperiences.filter(w => w.isHighlighted),
              alternativeQualifications: formData.alternativeQualifications,
              otherExperiences: formData.otherExperiences,
              dealExperiences: formData.dealExperiences,
              education: formData.education,
              tags: tags,
              references: formData.references,
              activelySeeking: formData.activelySeeking,
              willingToTravel: formData.willingToTravel,
              minimumAcceptableRate: formData.minimumAcceptableRate,
              lastRate: formData.lastRate,
              targetDayRate: formData.targetDayRate,
              visibility: formData.visibility,
              yearsExperience: parseInt(formData.yearsOfExperience),
              availability: formData.availability,
              remotePreference: formData.remotePreference
            }),
        }
        
        console.log('Submitting signup data:', signupData)
        console.log('Experience level:', getExperienceLevel(formData.yearsOfExperience))
        console.log('Career highlights length:', formData.careerHighlights.length)
        
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
        isBoardPosition: false,
        companyType: ""
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

  // Skills management
  const toggleSkill = (skill: string, category: 'popularSkills') => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(skill)
        ? prev[category].filter(s => s !== skill)
        : [...prev[category], skill]
    }))
  }

  // Demo mode function to auto-fill form
  const fillDemoData = () => {
    const demoData: FormData = {
      // Step 1: Personal Information
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+44 7700 123456",
      location: "london",
      linkedinUrl: "https://linkedin.com/in/johndoe",
      
      // Step 2: Professional Background
      currentRole: "Chief Executive Officer",
      roleTypes: ["chair", "ned", "senior-independent"],
      company: "TechCorp International",
      areaOfSpecialism: "Digital & Technology",
      sectors: ["Technology", "Financial Services", "Telecommunications"],
      yearsOfExperience: "20",
      careerHighlights: "• Led £500M technology company through successful IPO\n• Delivered 40% revenue growth through strategic acquisitions\n• Transformed operations saving 30% costs through digital initiatives\n• Board member of 3 FTSE 250 companies",
      currentlyEmployed: true,
      
      // Step 3: Board Experience
      boardExperience: true,
      boardPositions: 3,
      boardExperienceTypes: ["ftse250", "private-equity", "startup"],
      boardDetails: "Passionate about governance and bringing strategic insight to board discussions. Focus on digital transformation, ESG initiatives, and long-term value creation.",
      keynoteMediaExperience: true,
      
      // Step 4: Work Experience
      workExperiences: [
        {
          companyName: "TechCorp International",
          title: "Chief Executive Officer",
          location: "London, UK",
          startDate: "2018-01",
          endDate: "",
          isCurrent: true,
          description: "Leading a £500M technology services company with 2,000 employees across 15 countries. Delivered 40% revenue growth through strategic acquisitions and digital transformation initiatives.",
          isBoardPosition: false,
          companyType: "",
          isHighlighted: true
        },
        {
          companyName: "InnovateTech plc",
          title: "Non-Executive Director",
          location: "Manchester, UK",
          startDate: "2020-06",
          endDate: "",
          isCurrent: true,
          description: "Chair of the Technology Committee, member of Audit Committee. Providing strategic guidance on digital transformation and cybersecurity initiatives.",
          isBoardPosition: true,
          companyType: "ftse250",
          isHighlighted: true
        },
        {
          companyName: "Digital Ventures Ltd",
          title: "Chief Operating Officer",
          location: "London, UK",
          startDate: "2012-03",
          endDate: "2017-12",
          isCurrent: false,
          description: "Transformed operations through implementation of cloud-based systems and data analytics. Reduced operational costs by 30% while improving service delivery.",
          isBoardPosition: false,
          companyType: "",
          isHighlighted: false
        }
      ],
      alternativeQualifications: "IoD Certificate in Company Direction, PRINCE2 Practitioner",
      otherExperiences: [
        {
          title: "Mentor",
          organization: "Tech Leaders Network",
          description: "Mentoring aspiring CEOs and founders in the technology sector",
          startDate: "2019-01",
          endDate: ""
        }
      ],
      
      // Step 5: Transaction/Deal Experience
      dealExperiences: [
        {
          dealType: "acquisition",
          dealValue: "250",
          dealCurrency: "GBP",
          companyName: "CloudTech Solutions",
          role: "led-transaction",
          year: "2021",
          description: "Led the acquisition of CloudTech Solutions to expand our SaaS capabilities. Successfully integrated 150 employees and achieved £50M in revenue synergies within 18 months. Deal delivered 3.5x return on investment.",
          sector: "Technology"
        },
        {
          dealType: "ipo",
          dealValue: "750",
          dealCurrency: "GBP",
          companyName: "TechCorp International",
          role: "board-oversight",
          year: "2019",
          description: "As CEO, led the company through successful IPO on London Stock Exchange. Achieved 35% first-day premium and raised capital for international expansion.",
          sector: "Technology"
        }
      ],
      
      // Step 6: Education & Skills
      education: [
        {
          institution: "London Business School",
          degree: "MBA",
          fieldOfStudy: "Business Administration",
          graduationDate: "2005"
        },
        {
          institution: "University of Cambridge",
          degree: "BSc",
          fieldOfStudy: "Computer Science",
          graduationDate: "2000"
        }
      ],
      popularSkills: ["Strategic Planning", "M&A", "Digital Transformation", "Leadership", "Financial Strategy", "CEO Leadership", "Investor Relations", "ESG & Sustainability", "Risk Management"],
      references: "Available upon request",
      profilePhotoFile: new File(["Demo Photo"], "profile.jpg", { type: "image/jpeg" }),
      
      // Step 7: Availability & Documents
      activelySeeking: true,
      availability: "3months",
      remotePreference: "hybrid",
      willingToTravel: true,
      minimumAcceptableRate: "800",
      lastRate: "1000",
      targetDayRate: "1200",
      visibility: "public",
      cvFile: new File(["Demo CV Content"], "John_Doe_CV.pdf", { type: "application/pdf" }),
      termsAccepted: true,
    }
    
    setFormData(demoData)
    // Clear any existing errors
    setErrors({})
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
          
          {/* Demo Mode Button */}
          <Button
            type="button"
            variant="outline"
            onClick={fillDemoData}
            className="mt-4 bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 hover:border-amber-400"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Fill Demo Data
          </Button>
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
                          // Scroll to top of form
                          window.scrollTo({ top: 0, behavior: 'smooth' })
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
                  <Label>Role Types</Label>
                  <p className="text-sm text-gray-500 mb-3">Select the types of board roles you're interested in</p>
                  <div className="space-y-2">
                    {ROLE_TYPE_OPTIONS.map((role) => (
                      <div key={role.value} className="flex items-center space-x-3">
                        <Checkbox
                          id={role.value}
                          checked={formData.roleTypes.includes(role.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("roleTypes", [...formData.roleTypes, role.value])
                            } else {
                              updateFormData("roleTypes", formData.roleTypes.filter(r => r !== role.value))
                            }
                          }}
                        />
                        <Label htmlFor={role.value} className="font-normal cursor-pointer">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
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
                  <Label htmlFor="areaOfSpecialism">Area of Specialism</Label>
                  <Select
                    value={formData.areaOfSpecialism}
                    onValueChange={(value) => updateFormData("areaOfSpecialism", value)}
                  >
                    <SelectTrigger className={cn("mt-1", errors.areaOfSpecialism && "border-red-500")}>
                      <SelectValue placeholder="Select your area of specialism" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREA_OF_SPECIALISM_OPTIONS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.areaOfSpecialism && <p className="text-red-500 text-sm mt-1">{errors.areaOfSpecialism}</p>}
                </div>

                <div>
                  <Label>Sector Experience</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all sectors where you have experience</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  <Label htmlFor="careerHighlights">Career Highlights</Label>
                  <Textarea
                    id="careerHighlights"
                    value={formData.careerHighlights}
                    onChange={(e) => updateFormData("careerHighlights", e.target.value)}
                    placeholder="• Led successful turnaround of £50M business\n• Implemented digital transformation saving 30% costs\n• Board member of 3 FTSE 250 companies"
                    className={cn("mt-1 min-h-[150px]", errors.careerHighlights && "border-red-500")}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use bullet points to highlight your key achievements
                  </p>
                  {errors.careerHighlights && <p className="text-red-500 text-sm mt-1">{errors.careerHighlights}</p>}
                </div>

                <div>
                  <Label>Currently Employed?</Label>
                  <RadioGroup
                    value={formData.currentlyEmployed ? "yes" : "no"}
                    onValueChange={(value) => updateFormData("currentlyEmployed", value === "yes")}
                    className="mt-4 space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="employed-yes" />
                      <Label htmlFor="employed-yes" className="font-normal">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="employed-no" />
                      <Label htmlFor="employed-no" className="font-normal">
                        No
                      </Label>
                    </div>
                  </RadioGroup>
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
                  <>
                    <div>
                      <Label>Types of Board Experience</Label>
                      <p className="text-sm text-gray-500 mb-3">Select all that apply to your board experience</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BOARD_EXPERIENCE_TYPE_OPTIONS.map((type) => (
                          <div key={type.value} className="flex items-center space-x-3">
                            <Checkbox
                              id={type.value}
                              checked={formData.boardExperienceTypes.includes(type.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateFormData("boardExperienceTypes", [...formData.boardExperienceTypes, type.value])
                                } else {
                                  updateFormData("boardExperienceTypes", formData.boardExperienceTypes.filter(t => t !== type.value))
                                }
                              }}
                            />
                            <Label htmlFor={type.value} className="font-normal cursor-pointer">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Additional Experience</Label>
                      <div className="flex items-center space-x-3 mt-4">
                        <Checkbox
                          id="keynote-media"
                          checked={formData.keynoteMediaExperience}
                          onCheckedChange={(checked) => updateFormData("keynoteMediaExperience", checked as boolean)}
                        />
                        <Label htmlFor="keynote-media" className="font-normal cursor-pointer">
                          I have keynote speaking and/or media experience
                        </Label>
                      </div>
                    </div>
                    
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
                  </>
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

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`board-${index}`}
                          checked={exp.isBoardPosition}
                          onCheckedChange={(checked) => {
                            updateWorkExperience(index, "isBoardPosition", checked as boolean)
                            if (!checked) {
                              updateWorkExperience(index, "companyType", "")
                            }
                          }}
                        />
                        <Label htmlFor={`board-${index}`} className="text-sm font-normal">
                          This is a board position (Director, Trustee, Chair, etc.)
                        </Label>
                      </div>
                      
                      {exp.isBoardPosition && (
                        <div>
                          <Label>Company Type</Label>
                          <Select
                            value={exp.companyType || ""}
                            onValueChange={(value) => updateWorkExperience(index, "companyType", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select company type" />
                            </SelectTrigger>
                            <SelectContent>
                              {BOARD_EXPERIENCE_TYPE_OPTIONS.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    {/* Highlighted Role Checkbox */}
                    <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
                      <Checkbox
                        id={`highlight-${index}`}
                        checked={exp.isHighlighted || false}
                        onCheckedChange={(checked) => {
                          // Count currently highlighted roles
                          const highlightedCount = formData.workExperiences.filter(e => e.isHighlighted).length
                          if (checked && highlightedCount >= 3) {
                            alert("You can only highlight up to 3 roles for your profile")
                            return
                          }
                          updateWorkExperience(index, "isHighlighted", checked as boolean)
                        }}
                      />
                      <Label htmlFor={`highlight-${index}`} className="text-sm font-normal cursor-pointer">
                        <span className="font-medium">Highlight this role on my profile</span>
                        <span className="text-gray-600 ml-1">
                          ({formData.workExperiences.filter(e => e.isHighlighted).length}/3 selected)
                        </span>
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
                
                {/* Alternative Qualifications */}
                <div className="mt-6">
                  <Label htmlFor="alternativeQualifications">Alternative Industry Qualifications</Label>
                  <Textarea
                    id="alternativeQualifications"
                    value={formData.alternativeQualifications}
                    onChange={(e) => updateFormData("alternativeQualifications", e.target.value)}
                    placeholder="List any relevant industry qualifications, certifications, or accreditations (e.g., IoD Certificate in Company Direction, ACCA, CFA)"
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Optional</p>
                </div>
                
                {/* Other Experience Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Other (Non-NED) Experience</h3>
                  <p className="text-sm text-gray-600 mb-4">Include volunteer roles, advisory positions, or other relevant experience</p>
                  
                  {formData.otherExperiences.map((exp, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 mb-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              otherExperiences: prev.otherExperiences.filter((_, i) => i !== index)
                            }))
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Title/Role</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => {
                              const newExperiences = [...formData.otherExperiences]
                              newExperiences[index].title = e.target.value
                              setFormData(prev => ({ ...prev, otherExperiences: newExperiences }))
                            }}
                            placeholder="e.g., Mentor, Advisory Board Member"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Organization</Label>
                          <Input
                            value={exp.organization}
                            onChange={(e) => {
                              const newExperiences = [...formData.otherExperiences]
                              newExperiences[index].organization = e.target.value
                              setFormData(prev => ({ ...prev, otherExperiences: newExperiences }))
                            }}
                            placeholder="Organization name"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => {
                            const newExperiences = [...formData.otherExperiences]
                            newExperiences[index].description = e.target.value
                            setFormData(prev => ({ ...prev, otherExperiences: newExperiences }))
                          }}
                          placeholder="Brief description of your role and impact"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        otherExperiences: [...prev.otherExperiences, {
                          title: "",
                          organization: "",
                          description: "",
                          startDate: "",
                          endDate: ""
                        }]
                      }))
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Other Experience
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bebas-neue text-gray-900 mb-4 sm:mb-6">
                  Transaction & Deal Experience
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>For PE Firms:</strong> Share your most significant transactions, deals, and exits. 
                    This helps demonstrate your value creation track record.
                  </p>
                </div>

                {formData.dealExperiences.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-4">No deal experience added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDealExperience}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deal Experience
                    </Button>
                  </div>
                ) : (
                  <>
                    {formData.dealExperiences.map((deal, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold">Deal {index + 1}</h3>
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
                            <select
                              value={deal.dealType}
                              onChange={(e) => updateDealExperience(index, "dealType", e.target.value)}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="">Select deal type</option>
                              {DEAL_TYPE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <Label>Your Role</Label>
                            <select
                              value={deal.role}
                              onChange={(e) => updateDealExperience(index, "role", e.target.value)}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="">Select your role</option>
                              {DEAL_ROLE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <Label>Deal Value</Label>
                            <div className="flex gap-2 mt-1">
                              <select
                                value={deal.dealCurrency}
                                onChange={(e) => updateDealExperience(index, "dealCurrency", e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                              >
                                {CURRENCY_OPTIONS.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <Input
                                type="number"
                                value={deal.dealValue}
                                onChange={(e) => updateDealExperience(index, "dealValue", e.target.value)}
                                placeholder="e.g., 250 (millions)"
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
                              placeholder="e.g., Technology, Healthcare"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Deal Description & Impact</Label>
                          <Textarea
                            value={deal.description}
                            onChange={(e) => updateDealExperience(index, "description", e.target.value)}
                            placeholder="Describe your role, the strategic rationale, and the value created (e.g., 3x return, successful exit, cost synergies achieved)"
                            className="mt-1 min-h-[100px]"
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
                  </>
                )}
              </div>
            )}

            {currentStep === 6 && (
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

                {/* Popular Skills - Merged */}
                <div>
                  <Label>Popular Skills</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all skills that apply to your expertise</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {POPULAR_SKILLS_OPTIONS.map((skill) => (
                      <div
                        key={skill}
                        className={cn(
                          "border rounded-lg p-2 text-sm cursor-pointer transition-all",
                          formData.popularSkills.includes(skill)
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        )}
                        onClick={() => toggleSkill(skill, 'popularSkills')}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                  {errors.popularSkills && <p className="text-red-500 text-sm mt-1">{errors.popularSkills}</p>}
                </div>

                {/* Profile Photo Upload */}
                <div>
                  <Label>Profile Photo</Label>
                  <div className="mt-2">
                    {formData.profilePhotoFile ? (
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(formData.profilePhotoFile)}
                            alt="Profile preview"
                            className="h-24 w-24 rounded-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => updateFormData("profilePhotoFile", null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formData.profilePhotoFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.profilePhotoFile.size / 1024 / 1024).toFixed(2)} MB
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
                                const file = e.target.files[0]
                                if (file.size > 5 * 1024 * 1024) {
                                  alert("File size must be less than 5MB")
                                  return
                                }
                                updateFormData("profilePhotoFile", file)
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.profilePhotoFile && <p className="text-red-500 text-sm mt-1">{errors.profilePhotoFile}</p>}
                </div>

                {/* References */}
                <div>
                  <Label htmlFor="references">References</Label>
                  <Textarea
                    id="references"
                    value={formData.references}
                    onChange={(e) => updateFormData("references", e.target.value)}
                    placeholder="Please provide 2-3 professional references with their name, title, organization, and contact information (email/phone)"
                    className="mt-1 min-h-[120px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Optional - You can also upload reference letters in Step 7</p>
                </div>

                {/* Education - Collapsible */}
                <details className="border rounded-lg p-4">
                  <summary className="font-semibold cursor-pointer">Education (Optional)</summary>
                  <div className="mt-4 space-y-4">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
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
                </details>
              </div>
            )}

            {currentStep === 7 && (
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
                        id="willingToTravel"
                        checked={formData.willingToTravel}
                        onCheckedChange={(checked) => 
                          updateFormData("willingToTravel", checked as boolean)
                        }
                      />
                      <Label htmlFor="willingToTravel" className="font-normal">
                        I am willing to travel internationally
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Compensation Expectations */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Compensation Expectations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="minimumAcceptableRate">Minimum Acceptable (Net)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                        <Input
                          id="minimumAcceptableRate"
                          type="number"
                          value={formData.minimumAcceptableRate}
                          onChange={(e) => updateFormData("minimumAcceptableRate", e.target.value)}
                          placeholder="500"
                          className="pl-8"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Per day (net)</p>
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
                          placeholder="750"
                          className="pl-8"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Your previous day rate</p>
                    </div>
                    <div>
                      <Label htmlFor="targetDayRate">Target Day Rate</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                        <Input
                          id="targetDayRate"
                          type="number"
                          value={formData.targetDayRate}
                          onChange={(e) => updateFormData("targetDayRate", e.target.value)}
                          placeholder="1000"
                          className="pl-8"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Your ideal day rate</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Note:</strong> Day rates are typical for NED positions (2-5 days/month)
                  </p>
                </div>

                {/* Profile Visibility */}
                <div>
                  <Label htmlFor="visibility">Profile Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => updateFormData("visibility", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select profile visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div>
                          <div className="font-medium">Public</div>
                          <div className="text-sm text-gray-500">Visible to all companies and recruiters</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="recruiter-only">
                        <div>
                          <div className="font-medium">Recruiter Only</div>
                          <div className="text-sm text-gray-500">Only visible to verified recruiters</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="hidden">
                        <div>
                          <div className="font-medium">Hidden</div>
                          <div className="text-sm text-gray-500">Profile not visible in searches</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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