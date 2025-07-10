"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, MapPin, Briefcase, Calendar, Globe, Mail, Linkedin, Github, ExternalLink, Edit, Lock, CreditCard, Heart, Share2, Download, CheckCircle2, Users, Award, Target, Building2, GraduationCap, Languages, Phone, Printer, TrendingUp, DollarSign, Clock, Shield, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/navbar"
import Footer from "@/footer"
import { useCredits } from "@/hooks/use-credits"
import { cn } from "@/lib/utils"
import { generateCV, generateCVFilename } from "@/lib/utils/cv-export"

interface ProfileData {
  id: string
  name: string
  title: string
  location: string
  experience: string
  bio: string
  imageUrl?: string
  availability: string
  remotePreference?: string
  skills: string[]
  sectors: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  email?: string
  phone?: string
  user?: {
    email: string
    firstName: string
    lastName: string
  }
  isOwnProfile: boolean
  isActive: boolean
  profileCompleted: boolean
  isAnonymized: boolean
  isUnlocked?: boolean
  salary?: {
    min: number | null
    max: number | null
    currency: string
  }
  boardPositions?: number
  workExperiences?: any[]
  education?: any[]
  adminNotes?: string
  roleTypes?: string[]
  boardExperienceTypes?: string[]
  keySkills?: string[]
  functionalExpertise?: string[]
  industryExpertise?: string[]
  activelySeeking?: boolean
  willingToRelocate?: boolean
  certifications?: any[]
  languages?: string[]
  achievements?: string[]
}

// Helper function to extract achievements from work experiences
const extractAchievements = (workExperiences: any[]): string[] => {
  const achievements: string[] = []
  const achievementKeywords = [
    'increased', 'improved', 'led', 'delivered', 'achieved', 'saved', 'reduced',
    'grew', 'launched', 'implemented', 'transformed', 'generated', 'secured',
    'million', 'billion', '%', 'revenue', 'EBITDA', 'growth', 'acquisition',
    'merger', 'exit', 'IPO', 'restructuring', 'turnaround'
  ]

  workExperiences?.forEach(exp => {
    if (exp.description) {
      const sentences = exp.description.split(/[.!?]+/).filter(Boolean)
      sentences.forEach(sentence => {
        const hasKeyword = achievementKeywords.some(keyword => 
          sentence.toLowerCase().includes(keyword.toLowerCase())
        )
        if (hasKeyword && sentence.length > 20 && sentence.length < 200) {
          achievements.push(sentence.trim())
        }
      })
    }
  })

  return achievements.slice(0, 6) // Top 6 achievements
}

// Helper function to calculate board metrics
const calculateBoardMetrics = (workExperiences: any[]) => {
  const boardRoles = workExperiences?.filter(exp => exp.isBoardPosition || exp.is_board_position) || []
  const boardTypes = new Set<string>()
  let ftseCount = 0
  let peCount = 0
  let totalBoardYears = 0

  boardRoles.forEach(role => {
    if (role.companyType) {
      boardTypes.add(role.companyType)
      if (role.companyType.includes('ftse')) ftseCount++
      if (role.companyType === 'private-equity') peCount++
    }
    
    // Calculate years
    if (role.startDate || role.start_date) {
      const start = new Date(role.startDate || role.start_date)
      const end = role.isCurrent || role.is_current ? new Date() : new Date(role.endDate || role.end_date || new Date())
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
      totalBoardYears += Math.max(0, years)
    }
  })

  return {
    totalPositions: boardRoles.length,
    boardTypes: Array.from(boardTypes),
    ftseCount,
    peCount,
    totalYears: Math.round(totalBoardYears)
  }
}

export default function ProfessionalProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const { credits, deductCredits, hasEnoughCredits } = useCredits()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [params.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/search/profiles/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Profile not found")
        } else {
          setError("Failed to load profile")
        }
        return
      }

      const result = await response.json()
      if (result.success && result.data) {
        // Enhanced data parsing with all fields
        let enrichedProfile = result.data
        if (result.data.adminNotes) {
          try {
            const adminData = JSON.parse(result.data.adminNotes)
            enrichedProfile = {
              ...result.data,
              phone: adminData.phone || result.data.phone,
              roleTypes: adminData.roleTypes || [],
              boardExperienceTypes: adminData.boardExperienceTypes || [],
              keySkills: adminData.tags?.filter((t: any) => t.category === 'skill').map((t: any) => t.name) || result.data.skills || [],
              functionalExpertise: adminData.tags?.filter((t: any) => t.category === 'expertise').map((t: any) => t.name) || result.data.sectors || [],
              industryExpertise: adminData.tags?.filter((t: any) => t.category === 'industry').map((t: any) => t.name) || [],
              activelySeeking: adminData.activelySeeking,
              willingToRelocate: adminData.willingToRelocate,
              workExperiences: adminData.workExperiences || result.data.workExperiences,
              education: adminData.education || result.data.education,
              compensationMin: adminData.compensationMin,
              compensationMax: adminData.compensationMax,
              availability: adminData.availability || result.data.availability,
              remotePreference: adminData.remotePreference || result.data.remotePreference
            }
            
            // Extract achievements from work experiences
            enrichedProfile.achievements = extractAchievements(enrichedProfile.workExperiences)
          } catch (e) {
            console.error('Failed to parse adminNotes:', e)
          }
        }
        setProfile(enrichedProfile)
        setIsUnlocked(result.data.isOwnProfile || !result.data.isAnonymized || result.data.isUnlocked)
      } else {
        setError("Profile data not available")
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleUnlockProfile = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect=/search/${params.id}`)
      return
    }

    if (!hasEnoughCredits(1)) {
      router.push('/billing?reason=insufficient-credits')
      return
    }

    try {
      setUnlocking(true)
      await deductCredits(1, params.id as string)
      setIsUnlocked(true)
      await fetchProfile()
    } catch (err: any) {
      setError(err.message || "Failed to unlock profile")
    } finally {
      setUnlocking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Profile not found"}
            </h2>
            <p className="text-gray-600 mb-8">
              The profile you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => router.push("/search")}
              className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const boardMetrics = calculateBoardMetrics(profile.workExperiences || [])

  const getAvailabilityColor = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'immediate':
      case 'immediately':
        return 'text-green-600'
      case '2weeks':
      case '1month':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatAvailability = (availability: string) => {
    const availMap: Record<string, string> = {
      'immediately': 'Immediate',
      '2weeks': '2 weeks',
      '1month': '1 month',
      '3months': '3 months',
      '6months': '6 months',
    }
    return availMap[availability] || availability
  }

  const formatRoleType = (roleType: string) => {
    const roleMap: Record<string, string> = {
      'chair': 'Chair',
      'ned': 'Non-Executive Director',
      'advisor': 'Advisor',
      'trustee': 'Trustee',
      'senior-independent': 'Senior Independent Director'
    }
    return roleMap[roleType] || roleType
  }

  const formatBoardExperienceType = (type: string) => {
    const typeMap: Record<string, string> = {
      'ftse100': 'FTSE 100',
      'ftse250': 'FTSE 250',
      'aim': 'AIM Listed',
      'private-equity': 'Private Equity Backed',
      'startup': 'Startup/Scale-up',
      'public-sector': 'Public Sector',
      'charity': 'Charity/Third Sector'
    }
    return typeMap[type] || type
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  }

  const formatDateRange = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = formatDate(startDate)
    if (isCurrent || !endDate) return `${start} - Present`
    return `${start} - ${formatDate(endDate)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
          }
          
          .print-break-before {
            page-break-before: always;
          }
          
          .print-break-inside-avoid {
            page-break-inside: avoid;
          }
          
          .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          
          .bg-gray-50 {
            background: white !important;
          }
          
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          
          h1, h2, h3 {
            color: #1a202c !important;
          }
          
          .text-white {
            color: #1a202c !important;
          }
          
          .bg-gradient-to-r {
            background: #1e3a5f !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
      `}</style>

      <div className="no-print">
        <Navbar />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl font-inter">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-6 no-print">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Heart className={cn("h-4 w-4 mr-2", isSaved && "fill-current text-red-500")} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {isUnlocked && (
              <Button
                size="sm"
                className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
                onClick={() => generateCV(profile)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
            )}
          </div>
        </div>

        {/* Professional CV Container */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Enhanced Professional Header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  {profile.imageUrl && !profile.isAnonymized && isUnlocked ? (
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="w-36 h-36 rounded-full border-4 border-white shadow-2xl object-cover"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-full border-4 border-white shadow-2xl bg-white/20 flex items-center justify-center">
                      <span className="text-4xl font-bold font-playfair">
                        {isUnlocked && profile.name 
                          ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
                          : 'EP'
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-5xl font-bold mb-3 font-playfair">
                    {isUnlocked ? profile.name : 'Executive Profile'}
                  </h1>
                  <h2 className="text-2xl text-white/90 mb-4">{profile.title}</h2>
                  
                  {/* Role Types with Enhanced Styling */}
                  {profile.roleTypes && profile.roleTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {profile.roleTypes.map((role, index) => (
                        <Badge key={index} className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1 text-sm font-medium">
                          {formatRoleType(role)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Board Metrics Summary */}
                  {boardMetrics.totalPositions > 0 && (
                    <div className="flex gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-white/80" />
                        <span className="font-semibold">{boardMetrics.totalPositions} Board Positions</span>
                      </div>
                      {boardMetrics.ftseCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-white/80" />
                          <span className="font-semibold">{boardMetrics.ftseCount} FTSE Boards</span>
                        </div>
                      )}
                      {boardMetrics.peCount > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-white/80" />
                          <span className="font-semibold">{boardMetrics.peCount} PE-Backed</span>
                        </div>
                      )}
                      {boardMetrics.totalYears > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-white/80" />
                          <span className="font-semibold">{boardMetrics.totalYears}+ Years Board Experience</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/80" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-white/80" />
                      <span>{profile.experience} Experience</span>
                    </div>
                    {isUnlocked && profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-white/80" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {isUnlocked && profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-white/80" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {isUnlocked && profile.linkedinUrl && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-white/80" />
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {profile.activelySeeking && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-semibold">Actively Seeking Board Opportunities</span>
                      </div>
                    )}
                  </div>
                </div>

                {!isUnlocked && profile.isAnonymized && (
                  <div className="flex-shrink-0">
                    <Button
                      onClick={handleUnlockProfile}
                      disabled={unlocking}
                      className="bg-white text-[#1e3a5f] hover:bg-gray-100"
                    >
                      {unlocking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1e3a5f] mr-2"></div>
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Unlock Profile (1 Credit)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content with Professional Sections */}
          <div className="p-10">
            {/* Executive Summary */}
            {profile.bio && (
              <section className="mb-10 print-break-inside-avoid">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 font-playfair">
                  <div className="w-1 h-8 bg-[#1e3a5f] rounded"></div>
                  Executive Summary
                </h3>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </section>
            )}

            {/* Key Achievements (if available) */}
            {profile.achievements && profile.achievements.length > 0 && (
              <section className="mb-10 print-break-inside-avoid">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 font-playfair">
                  <div className="w-1 h-8 bg-[#1e3a5f] rounded"></div>
                  <BarChart3 className="h-6 w-6 text-[#1e3a5f]" />
                  Key Achievements
                </h3>
                <div className="space-y-3">
                  {profile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{achievement}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Board & Advisory Experience - Prominent Section */}
            {profile.workExperiences && profile.workExperiences.filter(exp => exp.isBoardPosition || exp.is_board_position).length > 0 && (
              <section className="mb-10 print-break-inside-avoid">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 font-playfair">
                  <div className="w-1 h-8 bg-[#1e3a5f] rounded"></div>
                  <Users className="h-6 w-6 text-[#1e3a5f]" />
                  Board & Advisory Positions
                </h3>
                
                {/* Board Experience Types - Visual Tags */}
                {profile.boardExperienceTypes && profile.boardExperienceTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {profile.boardExperienceTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] px-4 py-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {formatBoardExperienceType(type)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="space-y-8">
                  {profile.workExperiences
                    .filter(exp => exp.isBoardPosition || exp.is_board_position)
                    .map((exp, index) => (
                      <div key={index} className="relative pl-8 border-l-3 border-[#1e3a5f]">
                        <div className="absolute -left-[11px] top-0 w-5 h-5 bg-[#1e3a5f] rounded-full border-3 border-white"></div>
                        <div className="mb-2">
                          <h4 className="text-xl font-semibold text-gray-900">{exp.title || exp.position}</h4>
                          <div className="flex items-center gap-3 text-[#1e3a5f] font-medium mt-1">
                            <Building2 className="h-5 w-5" />
                            <span className="text-lg">{exp.companyName || exp.company_name || exp.company}</span>
                            {exp.companyType && (
                              <Badge className="bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20">
                                {formatBoardExperienceType(exp.companyType)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3 flex items-center gap-4">
                          {exp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {exp.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateRange(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent || exp.is_current)}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Executive Experience */}
            {profile.workExperiences && profile.workExperiences.filter(exp => !exp.isBoardPosition && !exp.is_board_position).length > 0 && (
              <section className="mb-10 print-break-before print-break-inside-avoid">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 font-playfair">
                  <div className="w-1 h-8 bg-gray-600 rounded"></div>
                  <Briefcase className="h-6 w-6 text-gray-600" />
                  Executive Experience
                </h3>
                <div className="space-y-8">
                  {profile.workExperiences
                    .filter(exp => !exp.isBoardPosition && !exp.is_board_position)
                    .map((exp, index) => (
                      <div key={index} className="relative pl-8 border-l-3 border-gray-300">
                        <div className="absolute -left-[11px] top-0 w-5 h-5 bg-gray-400 rounded-full border-3 border-white"></div>
                        <div className="mb-2">
                          <h4 className="text-xl font-semibold text-gray-900">{exp.title || exp.position}</h4>
                          <div className="flex items-center gap-3 text-gray-700 font-medium mt-1">
                            <Building2 className="h-5 w-5" />
                            <span className="text-lg">{exp.companyName || exp.company_name || exp.company}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3 flex items-center gap-4">
                          {exp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {exp.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateRange(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent || exp.is_current)}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Core Competencies - Professional Grid Layout */}
            <section className="mb-10 print-break-inside-avoid">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 font-playfair">
                <div className="w-1 h-8 bg-gray-600 rounded"></div>
                <Award className="h-6 w-6 text-gray-600" />
                Core Competencies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Core Skills */}
                {(profile.keySkills?.length > 0 || profile.skills?.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-lg mb-3">Core Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.keySkills || profile.skills || []).map((skill, index) => (
                        <Badge key={index} className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Functional Expertise */}
                {(profile.functionalExpertise?.length > 0 || profile.sectors?.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-lg mb-3">Functional Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.functionalExpertise || profile.sectors || []).map((expertise, index) => (
                        <Badge key={index} className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                          {expertise}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Industry Expertise */}
                {profile.industryExpertise?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-lg mb-3">Industry Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.industryExpertise.map((industry, index) => (
                        <Badge key={index} className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Education & Qualifications */}
            {profile.education && profile.education.length > 0 && (
              <section className="mb-10 print-break-inside-avoid">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 font-playfair">
                  <div className="w-1 h-8 bg-gray-600 rounded"></div>
                  <GraduationCap className="h-6 w-6 text-gray-600" />
                  Education & Qualifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-3 border-gray-300 pl-6">
                      <h4 className="font-semibold text-gray-900 text-lg">{edu.degree}</h4>
                      <p className="text-gray-700 font-medium">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-gray-600">{edu.fieldOfStudy || edu.field_of_study}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {edu.graduationDate || edu.graduation_date || edu.graduation_year || 
                         (edu.end_date && new Date(edu.end_date).getFullYear()) || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Additional Information - Professional Footer */}
            <section className="border-t-2 pt-8 print-break-inside-avoid">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Availability */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Availability</h4>
                  <div className="space-y-2">
                    <p className={cn("font-medium text-lg", getAvailabilityColor(profile.availability))}>
                      {formatAvailability(profile.availability)}
                    </p>
                    {profile.remotePreference && (
                      <p className="text-gray-600">
                        Work Preference: <span className="font-medium">{profile.remotePreference === 'flexible' ? 'Flexible' : profile.remotePreference}</span>
                      </p>
                    )}
                    {profile.willingToRelocate && (
                      <p className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Willing to travel internationally
                      </p>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Languages</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Languages className="h-4 w-4" />
                      <span>English (Native/Fluent)</span>
                    </div>
                    {profile.languages && profile.languages.map((lang, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-700">
                        <Languages className="h-4 w-4" />
                        <span>{lang}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Status */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Profile Status</h4>
                  <div className="space-y-2">
                    {profile.isAnonymized && (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        Anonymized Profile
                      </Badge>
                    )}
                    {profile.profileCompleted && (
                      <Badge variant="outline" className="border-green-500 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified Professional
                      </Badge>
                    )}
                    {boardMetrics.totalPositions > 0 && (
                      <Badge variant="outline" className="border-[#1e3a5f] text-[#1e3a5f]">
                        <Shield className="h-3 w-3 mr-1" />
                        Experienced Board Member
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  )
}