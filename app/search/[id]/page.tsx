"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, MapPin, Briefcase, Calendar, Globe, Mail, Linkedin, Github, ExternalLink, Edit, Lock, CreditCard, Heart, Share2, Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import Navbar from "@/navbar"
import Footer from "@/footer"
import { useCredits } from "@/hooks/use-credits"
import { cn } from "@/lib/utils"

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
        setProfile(result.data)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] rounded-xl p-8 text-white mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.imageUrl && !profile.isAnonymized && isUnlocked ? (
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {isUnlocked && profile.name 
                      ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : 'EP'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {isUnlocked ? profile.name : 'Executive Profile'}
              </h1>
              <p className="text-xl mb-4">{profile.title}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.experience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Available: {formatAvailability(profile.availability)}</span>
                </div>
                {profile.workExperiences && profile.workExperiences.filter(exp => 
                  exp.is_board_position === true
                ).length > 0 && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{profile.workExperiences.filter(exp => 
                      exp.is_board_position === true
                    ).length} Board Positions</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/20 border-white/50 text-white">
                  Anonymized
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              {isUnlocked && profile.linkedinUrl && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => window.open(profile.linkedinUrl, '_blank')}
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              )}
              {isUnlocked && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CV
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Skills & Expertise */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-[#6b93ce]">⚡</span>
                  Skills & Expertise
                </h2>
                
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Core Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.sectors && profile.sectors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Functional Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.sectors.map((sector, index) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className="border-gray-300"
                        >
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(!profile.skills || profile.skills.length === 0) && (!profile.sectors || profile.sectors.length === 0) && (
                  <p className="text-gray-500 italic">No skills or expertise listed</p>
                )}
              </CardContent>
            </Card>

            {/* Board Experience */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-[#6b93ce]">👥</span>
                  Board Experience
                </h2>
                {profile.workExperiences && profile.workExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {profile.workExperiences
                      .filter(exp => exp.is_board_position === true)
                      .map((exp, index) => (
                        <div key={index} className="border-l-2 border-[#6b93ce] pl-4">
                          <h3 className="font-semibold">{exp.position || exp.title}</h3>
                          <p className="text-[#6b93ce] font-medium">{exp.company_name || exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : new Date(exp.end_date).getFullYear()}
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No board positions listed</p>
                )}
              </CardContent>
            </Card>

            {/* Executive Experience */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-[#6b93ce]">💼</span>
                  Executive Experience
                </h2>
                {profile.workExperiences && profile.workExperiences.length > 0 ? (
                  <div className="space-y-4">
                    {profile.workExperiences
                      .filter(exp => exp.is_board_position !== true)
                      .map((exp, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <h3 className="font-semibold">{exp.position || exp.title}</h3>
                          <p className="text-gray-600">{exp.company_name || exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No executive experience listed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Additional Info */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                
                {!isUnlocked && profile.isAnonymized ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-6">
                      Unlock to view contact details
                    </p>
                    <Button
                      onClick={handleUnlockProfile}
                      disabled={unlocking}
                      className="w-full bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
                    >
                      {unlocking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Unlock (1 Credit)
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.email && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    )}
                    {profile.linkedinUrl && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">LinkedIn</p>
                        <a 
                          href={profile.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#6b93ce] hover:underline"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education & Qualifications */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-[#6b93ce]">🎓</span>
                  Education & Qualifications
                </h2>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-3">
                    {profile.education.map((edu, index) => (
                      <div key={index}>
                        <h3 className="font-semibold text-sm">{edu.degree}</h3>
                        <p className="text-gray-600 text-sm">{edu.institution}</p>
                        <p className="text-gray-500 text-xs">{edu.end_date ? new Date(edu.end_date).getFullYear() : edu.graduation_year || ''}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">No education details listed</p>
                )}
              </CardContent>
            </Card>

            {/* Key Achievements */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-[#6b93ce]">🏆</span>
                  Key Achievements
                </h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      {profile.experience} of industry experience
                    </span>
                  </li>
                  {profile.workExperiences && profile.workExperiences.filter(exp => 
                    exp.is_board_position === true
                  ).length > 0 && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        Served on {profile.workExperiences.filter(exp => 
                          exp.is_board_position === true
                        ).length} board{profile.workExperiences.filter(exp => 
                          exp.is_board_position === true
                        ).length !== 1 ? 's' : ''}
                      </span>
                    </li>
                  )}
                  {profile.experience === '25+ years' && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        CFO of the Year - Finance Directors Awards 2019
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Led successful £500m IPO for tech unicorn
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Board sponsor for diversity initiative increasing female leadership by 50%
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Implemented AI-driven financial planning system reducing forecast variance by 60%
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-[#6b93ce]">📅</span>
                  Availability
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status:</p>
                    <p className={cn("font-medium", getAvailabilityColor(profile.availability))}>
                      {formatAvailability(profile.availability)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Travel:</p>
                    <p className="font-medium capitalize">
                      {profile.remotePreference === 'flexible' ? 'International' : profile.remotePreference || 'Flexible'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}