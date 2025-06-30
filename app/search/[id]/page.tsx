"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/navbar"
import Footer from "@/footer"
import { 
  ArrowLeft, Download, Heart, Share2, Calendar, MapPin, 
  Briefcase, GraduationCap, Award, Target, Users, 
  Building, Clock, CheckCircle, Lock, Unlock, Mail, Phone, Linkedin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

// Mock profile data - will be replaced with Supabase
const mockProfile = {
  id: "1",
  name: "Sarah Thompson",
  title: "Former CFO - FTSE 100",
  email: "sarah.thompson@example.com",
  phone: "+44 20 7123 4567",
  linkedin: "https://linkedin.com/in/sarah-thompson",
  location: "London, UK",
  imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
  isUnlocked: true,
  
  // Executive Summary
  summary: "Accomplished CFO with 25+ years of experience leading financial strategy and transformation in FTSE 100 companies. Proven track record of driving growth through M&A, implementing digital finance transformation, and building high-performing teams. Passionate about sustainable finance and ESG integration.",
  
  // Key Stats
  yearsExperience: 25,
  boardPositions: 3,
  sectors: ["Financial Services", "Technology", "Healthcare", "Retail"],
  availability: "Immediate",
  willingToTravel: "International",
  
  // Skills & Expertise
  coreSkills: [
    "Financial Strategy",
    "M&A & Corporate Finance", 
    "Digital Transformation",
    "Risk Management",
    "ESG & Sustainability",
    "Audit & Compliance"
  ],
  
  functionalExpertise: [
    "CFO Leadership",
    "Strategic Planning",
    "Investor Relations",
    "Treasury Management",
    "Financial Reporting",
    "Cost Optimization"
  ],
  
  // Board Experience
  boardExperience: [
    {
      company: "TechCorp PLC",
      role: "Non-Executive Director & Audit Chair",
      period: "2020 - Present",
      type: "FTSE 250",
      description: "Leading audit committee through digital transformation and cybersecurity enhancement initiatives."
    },
    {
      company: "HealthTech Ltd",
      role: "Independent Non-Executive Director", 
      period: "2018 - Present",
      type: "AIM Listed",
      description: "Providing strategic guidance on international expansion and M&A strategy."
    },
    {
      company: "Sustainable Finance Foundation",
      role: "Trustee",
      period: "2019 - Present", 
      type: "Non-Profit",
      description: "Championing ESG integration in financial services sector."
    }
  ],
  
  // Executive Experience
  executiveExperience: [
    {
      company: "Global Finance Corp",
      role: "Group Chief Financial Officer",
      period: "2015 - 2020",
      description: "Led financial strategy for £5bn revenue financial services group. Delivered 30% cost reduction through digital transformation while improving service quality."
    },
    {
      company: "Digital Banking PLC",
      role: "Deputy CFO",
      period: "2010 - 2015",
      description: "Managed £2bn balance sheet transformation and regulatory compliance during major industry changes."
    }
  ],
  
  // Education & Qualifications
  education: [
    {
      degree: "MBA",
      institution: "London Business School",
      year: "1998"
    },
    {
      degree: "ACA - Chartered Accountant",
      institution: "ICAEW",
      year: "1995"
    },
    {
      degree: "BSc Economics",
      institution: "London School of Economics",
      year: "1993"
    }
  ],
  
  // Achievements
  achievements: [
    "CFO of the Year - Finance Directors Awards 2019",
    "Led successful £500m IPO for tech unicorn",
    "Implemented AI-driven financial planning system reducing forecast variance by 60%",
    "Board sponsor for diversity initiative increasing female leadership by 40%"
  ]
}

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)
  
  const profile = mockProfile // In real app, fetch based on params.id

  const handleUnlock = () => {
    setShowContactInfo(true)
    // In real app, this would deduct a credit
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
      </div>
      
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profile.isUnlocked ? (
                <Image
                  src={profile.imageUrl}
                  alt={profile.name}
                  width={150}
                  height={150}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-36 h-36 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <Lock className="h-16 w-16 text-gray-500" />
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bebas-neue text-gray-900">
                    {profile.isUnlocked ? profile.name : "Executive Profile"}
                  </h1>
                  <p className="text-xl text-gray-700 font-medium mt-1">{profile.title}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {profile.yearsExperience}+ years experience
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Available: {profile.availability}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {profile.boardPositions} Board Positions
                    </span>
                  </div>
                  
                  {/* Sectors */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.sectors.map(sector => (
                      <Badge key={sector} variant="secondary" className="bg-gray-100">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {profile.isUnlocked && (
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download CV
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Executive Summary */}
              <div className="mt-6">
                <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills & Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#6b93ce]" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Core Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.coreSkills.map(skill => (
                        <Badge key={skill} className="bg-[#e8f0fe] text-[#6b93ce] border-0">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Functional Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.functionalExpertise.map(skill => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Board Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#6b93ce]" />
                  Board Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.boardExperience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-[#6b93ce] pl-4">
                      <h4 className="font-medium text-gray-900">{exp.role}</h4>
                      <p className="text-[#6b93ce] font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-600 mt-1">{exp.period} • {exp.type}</p>
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Executive Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#6b93ce]" />
                  Executive Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.executiveExperience.map((exp, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900">{exp.role}</h4>
                      <p className="text-[#6b93ce] font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-600 mt-1">{exp.period}</p>
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Contact & Additional Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.isUnlocked && showContactInfo ? (
                  <div className="space-y-3">
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-gray-700 hover:text-[#6b93ce]">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{profile.email}</span>
                    </a>
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-[#6b93ce]">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{profile.phone}</span>
                    </a>
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-[#6b93ce]">
                      <Linkedin className="h-4 w-4" />
                      <span className="text-sm">LinkedIn Profile</span>
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Unlock to view contact details</p>
                    <Button 
                      onClick={handleUnlock}
                      className="w-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock (1 Credit)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#6b93ce]" />
                  Education & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.education.map((edu, index) => (
                    <div key={index}>
                      <p className="font-medium text-gray-900">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution}, {edu.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Key Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#6b93ce]" />
                  Key Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#6b93ce]" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800 border-0">
                      {profile.availability}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Travel:</span>
                    <span className="text-gray-900">{profile.willingToTravel}</span>
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