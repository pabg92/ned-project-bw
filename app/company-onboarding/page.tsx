"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Users, Target, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CompanyOnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    hiringNeeds: "",
    website: "",
    position: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    console.log('[Company Onboarding] Submitting form data:', formData)

    try {
      // Update user metadata with company information
      const response = await fetch("/api/company/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Welcome aboard!",
          description: "Your company profile has been created successfully.",
        })
        
        // Redirect to search page
        router.push("/search")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save company information")
      }
    } catch (error) {
      console.error('[Company Onboarding] Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save company information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6b93ce]/10 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-[#6b93ce]" />
          </div>
          <h1 className="text-3xl font-bebas-neue text-[#4a4a4a] mb-2">
            Complete Your Company Profile
          </h1>
          <p className="text-gray-600">
            Tell us about your company so we can better match you with board candidates
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              This information helps candidates understand your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Acme Corporation"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Your Position *</Label>
                <Input
                  id="position"
                  placeholder="e.g., Head of Talent, CEO, Board Secretary"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  required
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="financial-services">Financial Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="media">Media & Entertainment</SelectItem>
                    <SelectItem value="private-equity">Private Equity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size *</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                  required
                >
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-50)</SelectItem>
                    <SelectItem value="small">Small (51-200)</SelectItem>
                    <SelectItem value="medium">Medium (201-1000)</SelectItem>
                    <SelectItem value="large">Large (1000+)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (10,000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Company Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hiringNeeds">What type of board members are you looking for?</Label>
                <Textarea
                  id="hiringNeeds"
                  placeholder="e.g., Looking for independent directors with fintech experience, ESG expertise needed for our sustainability committee..."
                  value={formData.hiringNeeds}
                  onChange={(e) => setFormData({ ...formData, hiringNeeds: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#6b93ce] hover:bg-[#5a82bd]"
                >
                  {isSubmitting ? "Saving..." : "Complete Setup"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/search")}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>You can update this information anytime from your account settings</p>
        </div>
      </div>
    </div>
  )
}