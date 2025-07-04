"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import Navbar from "@/navbar"
import Footer from "@/footer"

interface ProfileData {
  id: string
  userId: string
  title: string
  summary: string
  experience: string
  location: string
  remotePreference: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  availability: string
  isAnonymized: boolean
  linkedinUrl: string | null
  githubUrl: string | null
  portfolioUrl: string | null
  profileCompletion: {
    isCompleted: boolean
    overallPercentage: number
    missingRequired: string[]
  }
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, isLoaded: userLoaded } = useUser()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    experience: "",
    location: "",
    remotePreference: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    availability: "",
    isAnonymized: false,
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  })

  useEffect(() => {
    if (userLoaded && !user) {
      router.push("/sign-in?redirect=/profile/edit")
    } else if (user) {
      fetchProfile()
    }
  }, [user, userLoaded])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/v1/candidates/profile")
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/sign-in?redirect=/profile/edit")
          return
        }
        const errorData = await response.json()
        setError(errorData.message || "Failed to load profile")
        return
      }

      const result = await response.json()
      if (result.success && result.data) {
        setProfile(result.data)
        // Initialize form with existing data
        setFormData({
          title: result.data.title || "",
          summary: result.data.summary || "",
          experience: result.data.experience || "",
          location: result.data.location || "",
          remotePreference: result.data.remotePreference || "",
          salaryMin: result.data.salaryMin?.toString() || "",
          salaryMax: result.data.salaryMax?.toString() || "",
          salaryCurrency: result.data.salaryCurrency || "USD",
          availability: result.data.availability || "",
          isAnonymized: result.data.isAnonymized || false,
          linkedinUrl: result.data.linkedinUrl || "",
          githubUrl: result.data.githubUrl || "",
          portfolioUrl: result.data.portfolioUrl || "",
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      // Prepare data for API
      const updateData: any = {
        title: formData.title,
        summary: formData.summary,
        experience: formData.experience,
        location: formData.location,
        remotePreference: formData.remotePreference,
        availability: formData.availability,
        isAnonymized: formData.isAnonymized,
      }

      // Only include salary if values are provided
      if (formData.salaryMin) {
        updateData.salaryMin = parseInt(formData.salaryMin)
      }
      if (formData.salaryMax) {
        updateData.salaryMax = parseInt(formData.salaryMax)
      }
      if (formData.salaryMin || formData.salaryMax) {
        updateData.salaryCurrency = formData.salaryCurrency
      }

      // Only include URLs if they're not empty
      if (formData.linkedinUrl) updateData.linkedinUrl = formData.linkedinUrl
      if (formData.githubUrl) updateData.githubUrl = formData.githubUrl
      if (formData.portfolioUrl) updateData.portfolioUrl = formData.portfolioUrl

      const response = await fetch("/api/v1/candidates/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile")
      }

      if (result.success) {
        setSuccess("Profile updated successfully!")
        setProfile(result.data)
        // Redirect to profile view after a short delay
        setTimeout(() => {
          router.push(`/search/${profile?.id}`)
        }, 1500)
      }
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading || !userLoaded) {
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Profile Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              You don't have a candidate profile yet. Please contact an administrator to create one.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
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
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Edit Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Update your professional information to help recruiters find you
          </p>

          {/* Profile Completion Alert */}
          {profile.profileCompletion && !profile.profileCompletion.isCompleted && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your profile is {profile.profileCompletion.overallPercentage}% complete.
                {profile.profileCompletion.missingRequired.length > 0 && (
                  <span className="block mt-1">
                    Missing required fields: {profile.profileCompletion.missingRequired.join(", ")}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            
            {/* Title */}
            <div className="mb-6">
              <Label htmlFor="title" className="required">
                Professional Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Chief Technology Officer"
                required
                className="mt-1"
              />
            </div>

            {/* Summary */}
            <div className="mb-6">
              <Label htmlFor="summary" className="required">
                Professional Summary
              </Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="Describe your experience, skills, and what you're looking for..."
                rows={6}
                required
                className="mt-1"
              />
            </div>

            {/* Experience Level */}
            <div className="mb-6">
              <Label htmlFor="experience" className="required">
                Experience Level
              </Label>
              <Select
                value={formData.experience}
                onValueChange={(value) => handleInputChange("experience", value)}
                required
              >
                <SelectTrigger id="experience" className="mt-1">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">0-5 years</SelectItem>
                  <SelectItem value="mid">5-10 years</SelectItem>
                  <SelectItem value="senior">10-20 years</SelectItem>
                  <SelectItem value="lead">20-25 years</SelectItem>
                  <SelectItem value="executive">25+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="mb-6">
              <Label htmlFor="location" className="required">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., New York, NY"
                required
                className="mt-1"
              />
            </div>

            {/* Remote Preference */}
            <div className="mb-6">
              <Label htmlFor="remotePreference" className="required">
                Work Preference
              </Label>
              <Select
                value={formData.remotePreference}
                onValueChange={(value) => handleInputChange("remotePreference", value)}
                required
              >
                <SelectTrigger id="remotePreference" className="mt-1">
                  <SelectValue placeholder="Select work preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">On-site only</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote only</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <Label htmlFor="availability" className="required">
                Availability
              </Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => handleInputChange("availability", value)}
                required
              >
                <SelectTrigger id="availability" className="mt-1">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediate</SelectItem>
                  <SelectItem value="2weeks">2 weeks</SelectItem>
                  <SelectItem value="1month">1 month</SelectItem>
                  <SelectItem value="3months">3 months</SelectItem>
                  <SelectItem value="6months">6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Compensation Expectations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salaryMin">Minimum Salary</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                  placeholder="e.g., 150000"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="salaryMax">Maximum Salary</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                  placeholder="e.g., 250000"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="salaryCurrency">Currency</Label>
                <Select
                  value={formData.salaryCurrency}
                  onValueChange={(value) => handleInputChange("salaryCurrency", value)}
                >
                  <SelectTrigger id="salaryCurrency" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Links & Privacy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Links & Privacy</h2>
            
            {/* LinkedIn URL */}
            <div className="mb-4">
              <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1"
              />
            </div>

            {/* GitHub URL */}
            <div className="mb-4">
              <Label htmlFor="githubUrl">GitHub Profile</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                placeholder="https://github.com/yourusername"
                className="mt-1"
              />
            </div>

            {/* Portfolio URL */}
            <div className="mb-6">
              <Label htmlFor="portfolioUrl">Portfolio Website</Label>
              <Input
                id="portfolioUrl"
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                placeholder="https://yourportfolio.com"
                className="mt-1"
              />
            </div>

            {/* Anonymize Profile */}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Switch
                id="isAnonymized"
                checked={formData.isAnonymized}
                onCheckedChange={(checked) => handleInputChange("isAnonymized", checked)}
              />
              <Label htmlFor="isAnonymized" className="cursor-pointer">
                Anonymize my profile (hide name and contact details from public view)
              </Label>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}