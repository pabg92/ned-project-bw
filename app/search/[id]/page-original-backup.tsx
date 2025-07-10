"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, MapPin, Briefcase, Calendar, Globe, Mail, Linkedin, Github, ExternalLink, Edit, Lock, CreditCard, Heart, Share2, Download, CheckCircle2, Users, Award, Target, Building2, GraduationCap, Languages, Phone, Printer } from "lucide-react"
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
}

export default function ProfilePage() {
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
        // Parse adminNotes if available to extract additional data
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
              education: adminData.education || result.data.education
            }
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b93ce] mx-auto"></div>
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
              className="bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
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

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
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
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-6">
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
                className="bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
                onClick={() => generateCV(profile)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
            )}
          </div>
        </div>

        {/* CV Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
          {/* Professional Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 print:p-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {profile.imageUrl && !profile.isAnonymized && isUnlocked ? (
                  <img
                    src={profile.imageUrl}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-slate-700 flex items-center justify-center">
                    <span className="text-3xl font-bold">
                      {isUnlocked && profile.name 
                        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : 'EP'
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {isUnlocked ? profile.name : 'Executive Profile'}
                </h1>
                <h2 className="text-2xl text-slate-200 mb-4">{profile.title}</h2>
                
                {/* Role Types */}
                {profile.roleTypes && profile.roleTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.roleTypes.map((role, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-700 text-white border-slate-600">
                        {formatRoleType(role)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.experience} Experience</span>
                  </div>
                  {isUnlocked && profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {isUnlocked && profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {isUnlocked && profile.linkedinUrl && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {profile.activelySeeking && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="text-green-300">Actively Seeking Opportunities</span>
                    </div>
                  )}
                </div>
              </div>

              {!isUnlocked && profile.isAnonymized && (
                <div className="flex-shrink-0">
                  <Button
                    onClick={handleUnlockProfile}
                    disabled={unlocking}
                    className="bg-white text-slate-900 hover:bg-slate-100"
                  >
                    {unlocking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
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

          {/* Main Content */}
          <div className="p-8 print:p-6">
            {/* Executive Summary */}
            {profile.bio && (
              <section className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#6b93ce] rounded"></div>
                  Executive Summary
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </section>
            )}

            {/* Board & Advisory Experience */}
            {profile.workExperiences && profile.workExperiences.filter(exp => exp.isBoardPosition || exp.is_board_position).length > 0 && (
              <section className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#6b93ce] rounded"></div>
                  <Users className="h-5 w-5 text-[#6b93ce]" />
                  Board & Advisory Positions
                </h3>
                
                {/* Board Experience Types */}
                {profile.boardExperienceTypes && profile.boardExperienceTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.boardExperienceTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="border-[#6b93ce] text-[#6b93ce]">
                        {formatBoardExperienceType(type)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="space-y-6">
                  {profile.workExperiences
                    .filter(exp => exp.isBoardPosition || exp.is_board_position)
                    .map((exp, index) => (
                      <div key={index} className="relative pl-6 border-l-2 border-[#6b93ce]">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#6b93ce] rounded-full"></div>
                        <div className="mb-1">
                          <h4 className="text-lg font-semibold text-slate-900">{exp.title || exp.position}</h4>
                          <div className="flex items-center gap-2 text-[#6b93ce] font-medium">
                            <Building2 className="h-4 w-4" />
                            <span>{exp.companyName || exp.company_name || exp.company}</span>
                            {exp.companyType && (
                              <Badge variant="secondary" className="text-xs bg-[#6b93ce]/10 text-[#6b93ce]">
                                {formatBoardExperienceType(exp.companyType)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {exp.location && <span>{exp.location} • </span>}
                          {formatDateRange(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent || exp.is_current)}
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 text-sm leading-relaxed">
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
              <section className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-slate-600 rounded"></div>
                  <Briefcase className="h-5 w-5 text-slate-600" />
                  Executive Experience
                </h3>
                <div className="space-y-6">
                  {profile.workExperiences
                    .filter(exp => !exp.isBoardPosition && !exp.is_board_position)
                    .map((exp, index) => (
                      <div key={index} className="relative pl-6 border-l-2 border-slate-300">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-400 rounded-full"></div>
                        <div className="mb-1">
                          <h4 className="text-lg font-semibold text-slate-900">{exp.title || exp.position}</h4>
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Building2 className="h-4 w-4" />
                            <span>{exp.companyName || exp.company_name || exp.company}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {exp.location && <span>{exp.location} • </span>}
                          {formatDateRange(exp.startDate || exp.start_date, exp.endDate || exp.end_date, exp.isCurrent || exp.is_current)}
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Core Competencies */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-slate-600 rounded"></div>
                <Award className="h-5 w-5 text-slate-600" />
                Core Competencies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Core Skills */}
                {(profile.keySkills?.length > 0 || profile.skills?.length > 0) && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Core Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.keySkills || profile.skills || []).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Functional Expertise */}
                {(profile.functionalExpertise?.length > 0 || profile.sectors?.length > 0) && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Functional Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.functionalExpertise || profile.sectors || []).map((expertise, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          {expertise}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Industry Expertise */}
                {profile.industryExpertise?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Industry Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.industryExpertise.map((industry, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
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
              <section className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-slate-600 rounded"></div>
                  <GraduationCap className="h-5 w-5 text-slate-600" />
                  Education & Qualifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-slate-300 pl-4">
                      <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                      <p className="text-slate-600">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-gray-600">{edu.fieldOfStudy || edu.field_of_study}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {edu.graduationDate || edu.graduation_date || edu.graduation_year || 
                         (edu.end_date && new Date(edu.end_date).getFullYear()) || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Additional Information */}
            <section className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Availability */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Availability</h4>
                  <p className={cn("font-medium", getAvailabilityColor(profile.availability))}>
                    {formatAvailability(profile.availability)}
                  </p>
                  {profile.remotePreference && (
                    <p className="text-sm text-gray-600 mt-1">
                      Work Preference: {profile.remotePreference === 'flexible' ? 'Flexible' : profile.remotePreference}
                    </p>
                  )}
                  {profile.willingToRelocate && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Willing to travel internationally
                    </p>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Languages</h4>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Languages className="h-4 w-4" />
                    <span>English (Native)</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Profile Status</h4>
                  {profile.isAnonymized && (
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      Anonymized Profile
                    </Badge>
                  )}
                  {profile.profileCompleted && (
                    <Badge variant="outline" className="border-green-500 text-green-700 ml-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}