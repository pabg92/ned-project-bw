"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Search, CreditCard, Users, Shield, Zap, ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import React from "react"
import Image from "next/image"

/**
 * Companies Landing Page
 * 
 * Purpose: Explain the value proposition for companies looking to find board members
 * Target Audience: HR professionals, executives, recruiters searching for board talent
 * 
 * User Flow:
 * 1. Land on this page from homepage "For Companies" link
 * 2. Learn about the service and benefits
 * 3. View pricing/credit information
 * 4. Sign up as a company user → /sign-up?role=company
 * 5. Or login if existing user → /sign-in
 * 
 * Access: Public page, no authentication required
 */
export default function CompaniesPage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()
  const userRole = user?.publicMetadata?.role as string

  // Log user state for debugging
  React.useEffect(() => {
    if (isLoaded) {
      console.log('[Companies Page] User loaded:', {
        isSignedIn,
        userRole,
        publicMetadata: user?.publicMetadata
      })
    }
  }, [isLoaded, isSignedIn, userRole, user])

  // If signed in as company, show different CTA
  const handleGetStarted = () => {
    if (isSignedIn && userRole === 'company') {
      router.push('/search')
    } else if (isSignedIn) {
      // Signed in but not a company user
      router.push('/sign-up?role=company')
    } else {
      // Not signed in
      router.push('/sign-up?role=company')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Using navbar gradient colors */}
      <section className="relative bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Board Champions Logo */}
          <div className="mb-8">
            <Image
              src="/board-champions-assets/BC Option 2 WO.svg"
              alt="Board Champions"
              width={300}
              height={120}
              className="mx-auto"
              priority
            />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-medium">For Companies & Recruiters</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bebas-neue mb-6">
            Find Your Next Board Member
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-[#c5d5e4]">
            Access the UK's premier network of board-ready executives. 
            Search, filter, and connect with verified candidates in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-[#4a4a4a] hover:bg-gray-100 text-lg px-8 py-6"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {isSignedIn && userRole !== 'company' && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/sign-in')}
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bebas-neue text-center mb-12 text-[#4a4a4a]">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: <Users className="h-8 w-8" />,
                title: "Sign Up",
                description: "Create your company account in seconds"
              },
              {
                step: "2",
                icon: <Search className="h-8 w-8" />,
                title: "Search & Filter",
                description: "Browse anonymized profiles of board-ready executives"
              },
              {
                step: "3",
                icon: <CreditCard className="h-8 w-8" />,
                title: "Unlock Profiles",
                description: "Use credits to reveal full candidate details"
              },
              {
                step: "4",
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Connect",
                description: "Contact candidates directly with full information"
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-[#6b93ce] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 bg-[#5a5a5a] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#4a4a4a]">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bebas-neue text-center mb-4 text-[#4a4a4a]">
            Why Choose Board Champions
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            The most efficient way to find qualified board members for your organization
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-[#6b93ce] mb-4" />
                <CardTitle className="text-2xl text-[#4a4a4a]">Verified Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every profile is reviewed and approved by our team. Access only quality, 
                  board-ready executives who are actively seeking positions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-[#6b93ce] mb-4" />
                <CardTitle className="text-2xl text-[#4a4a4a]">Instant Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No lengthy contracts or subscriptions. Purchase credits and start 
                  unlocking profiles immediately. Pay only for what you need.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Search className="h-12 w-12 text-[#6b93ce] mb-4" />
                <CardTitle className="text-2xl text-[#4a4a4a]">Smart Filtering</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Filter by industry, experience, location, and availability. 
                  Our advanced search helps you find the perfect match quickly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bebas-neue text-center mb-4 text-[#4a4a4a]">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            No subscriptions. No hidden fees. Pay only for the profiles you unlock.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-[#6b93ce] transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl text-[#4a4a4a]">Starter</CardTitle>
                <CardDescription>Perfect for single hires</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#4a4a4a]">£25</span>
                  <span className="text-gray-600">/5 credits</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlock 5 full profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">No expiration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Instant access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-[#6b93ce] shadow-lg transform scale-105">
              <CardHeader>
                <div className="bg-[#6b93ce] text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-2">
                  Most Popular
                </div>
                <CardTitle className="text-2xl text-[#4a4a4a]">Professional</CardTitle>
                <CardDescription>For active recruiters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#4a4a4a]">£45</span>
                  <span className="text-gray-600">/10 credits</span>
                  <span className="text-sm text-green-600 block">Save £5</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlock 10 full profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Bulk unlock discount</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-[#6b93ce] transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl text-[#4a4a4a]">Enterprise</CardTitle>
                <CardDescription>For teams and agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#4a4a4a]">£80</span>
                  <span className="text-gray-600">/20 credits</span>
                  <span className="text-sm text-green-600 block">Save £20</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlock 20 full profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Dedicated support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Team sharing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-center text-gray-600 mt-8">
            Need more credits? Contact us for custom enterprise packages.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bebas-neue mb-4">
            Ready to Find Your Next Board Member?
          </h2>
          <p className="text-xl mb-8 text-[#c5d5e4]">
            Join hundreds of companies already using Board Champions to build exceptional boards.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-[#4a4a4a] hover:bg-gray-100 text-lg px-8 py-6"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Link href="/sign-in">
                Existing User? Sign In
              </Link>
            </Button>
          </div>
          
          <p className="mt-8 text-sm text-[#c5d5e4]">
            No credit card required to browse profiles • Cancel anytime
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bebas-neue text-center mb-12 text-[#4a4a4a]">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#4a4a4a]">
                  How does the credit system work?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Each credit allows you to unlock one candidate's full profile, including 
                  their contact information, detailed experience, and LinkedIn profile. 
                  Once unlocked, you have permanent access to that profile.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#4a4a4a]">
                  Can I see profiles before purchasing credits?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can browse all anonymized profiles for free. You'll see their 
                  experience level, skills, location, and professional summary. Credits are 
                  only needed to reveal identity and contact details.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-[#4a4a4a]">
                  Are all candidates actively looking?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All candidates on our platform have explicitly expressed interest in 
                  board positions. Each profile shows their availability timeline, from 
                  "immediately available" to "open to opportunities."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}