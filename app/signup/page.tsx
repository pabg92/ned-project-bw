import { Suspense } from "react"
import Navbar from "@/navbar"
import Footer from "@/footer"
import StreamlinedSignUpForm from "@/streamlined-signup-form"

interface SignUpPageProps {
  searchParams: {
    roles?: string
    sectors?: string
    specialisms?: string
    orgType?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  // Parse comma-separated values from query params
  const prefillData = {
    roles: searchParams.roles?.split(',').filter(Boolean) || [],
    sectors: searchParams.sectors?.split(',').filter(Boolean) || [],
    specialisms: searchParams.specialisms?.split(',').filter(Boolean) || [],
    orgType: searchParams.orgType || null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <StreamlinedSignUpForm prefillData={prefillData} />
      </Suspense>
      <Footer />
    </div>
  )
}