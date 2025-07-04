"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, MapPin, Briefcase, Calendar, Globe, Mail, Linkedin, Github, ExternalLink, Edit, Lock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navbar from "@/navbar"
import Footer from "@/footer"
import { useCredits } from "@/hooks/use-credits"

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
  salary?: {
    min: number | null
    max: number | null
    currency: string
  }
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

  useEffect(() => {
    fetchProfile()
  }, [params.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch individual profile data
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
        // Check if profile is already unlocked (own profile or not anonymized)
        setIsUnlocked(result.data.isOwnProfile || !result.data.isAnonymized)
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
      // Refetch profile to get full details
      await fetchProfile()
    } catch (err: any) {
      setError(err.message || "Failed to unlock profile")
    } finally {
      setUnlocking(false)
    }
  }

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return null
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    } else if (min) {
      return `${formatter.format(min)}+`
    } else if (max) {
      return `Up to ${formatter.format(max)}`
    }
    return null
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] p-8 text-white">
            <div className="flex items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profile.imageUrl ? (
                  <img
                    src={profile.imageUrl}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                    <span className="text-4xl font-bold">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                    <p className="text-xl mb-4">{profile.title}</p>
                  </div>
                  {profile.isOwnProfile && (
                    <Button
                      onClick={() => router.push('/profile/edit')}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/50"
                      variant="outline"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
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
                    <span>Available: {profile.availability}</span>
                  </div>
                  {profile.remotePreference && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="capitalize">{profile.remotePreference}</span>
                    </div>
                  )}
                </div>

                {/* Profile Status Badges */}
                <div className="flex gap-2 mt-4">
                  {!profile.isActive && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Inactive
                    </Badge>
                  )}
                  {!profile.profileCompleted && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Incomplete Profile
                    </Badge>
                  )}
                  {profile.isAnonymized && !profile.isOwnProfile && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Anonymized
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-col gap-2">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-8 relative">
            {/* Unlock Overlay for Anonymized Profiles */}
            {profile.isAnonymized && !isUnlocked && !profile.isOwnProfile && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Unlock Full Profile
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This profile is anonymized to protect the candidate's privacy. 
                    Unlock to see their full details including name, contact information, and more.
                  </p>
                  
                  {isSignedIn ? (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            You have <strong>{credits}</strong> credits available
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleUnlockProfile}
                        disabled={unlocking || !hasEnoughCredits(1)}
                        className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white w-full"
                        size="lg"
                      >
                        {unlocking ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Unlocking...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Unlock Profile (1 Credit)
                          </>
                        )}
                      </Button>
                      
                      {!hasEnoughCredits(1) && (
                        <p className="mt-4 text-sm text-red-600">
                          You need at least 1 credit to unlock this profile.
                          <Button
                            variant="link"
                            className="text-[#6b93ce] p-0 h-auto ml-1"
                            onClick={() => router.push('/billing')}
                          >
                            Buy credits
                          </Button>
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <Button
                        onClick={() => router.push(`/sign-in?redirect=/search/${params.id}`)}
                        className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white w-full"
                        size="lg"
                      >
                        Sign in to Unlock
                      </Button>
                      <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Button
                          variant="link"
                          className="text-[#6b93ce] p-0 h-auto"
                          onClick={() => router.push(`/sign-up?redirect=/search/${params.id}`)}
                        >
                          Sign up
                        </Button>
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
            {/* Profile Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>

            {/* Salary Information - only visible to authenticated users */}
            {profile.salary && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Salary Expectations</h2>
                <p className="text-gray-700 text-lg">
                  {formatSalary(profile.salary.min, profile.salary.max, profile.salary.currency)}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-[#6b93ce]/10 text-[#6b93ce] hover:bg-[#6b93ce]/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sectors */}
            {profile.sectors && profile.sectors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Industry Sectors</h2>
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

            {/* Contact Section */}
            {!profile.isOwnProfile && (
              <div className="border-t pt-8">
                <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                <p className="text-gray-600 mb-6">
                  Interested in connecting with this candidate? Contact our team to arrange an introduction.
                </p>
                <div className="flex gap-4">
                  <Button 
                    className="bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
                    onClick={() => {
                      // In a real app, this would open a contact form or trigger a contact request
                      alert(`Contact request for profile: ${profile.id}`)
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Request Introduction
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // In a real app, this would save the profile
                      alert(`Profile ${profile.id} saved to your shortlist`)
                    }}
                  >
                    Save Profile
                  </Button>
                </div>
              </div>
            )}

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
                <p><strong>Profile ID:</strong> {profile.id}</p>
                <p><strong>Is Own Profile:</strong> {profile.isOwnProfile ? 'Yes' : 'No'}</p>
                {profile.user && (
                  <>
                    <p><strong>User Email:</strong> {profile.user.email}</p>
                    <p><strong>User Name:</strong> {profile.user.firstName} {profile.user.lastName}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}