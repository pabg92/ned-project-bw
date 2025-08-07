"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, ArrowRight, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { typography, buttonStyles, cn, spacing } from "@/lib/typography"
import { useState, useEffect, useRef } from "react"
import React from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const processSteps = [
  {
    id: 1,
    title: "RISK-FREE CONSULTATION",
    icon: "/RFC.svg",
    iconAlt: "Consultation icon",
  },
  {
    id: 2,
    title: "SCREENING",
    icon: "/Screen.svg",
    iconAlt: "Screening icon",
  },
  {
    id: 3,
    title: "TALENT SHORTLIST",
    icon: "/talent-shortlist-icon.svg",
    iconAlt: "Talent shortlist icon",
  },
  {
    id: 4,
    title: "INTERVIEW",
    icon: "/interview-icon.svg",
    iconAlt: "Interview icon",
  },
  {
    id: 5,
    title: "HIRE",
    icon: "/hire-icon.svg",
    iconAlt: "Hire icon",
  },
]

export default function IntegratedCTAProcessSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const processRef = useRef<HTMLDivElement>(null)
  
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const userRole = user?.publicMetadata?.role as string

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (processRef.current) {
      observer.observe(processRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newsletter: isSubscribed }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setEmail("")
        setIsSubscribed(false)
      } else {
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className={`${spacing.section.base} bg-gradient-to-b from-gray-50 to-white`}>
      <div className={spacing.container}>
        {/* CTA Buttons - Mobile optimized with proper touch targets */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center mb-12">
          <Button 
            onClick={() => {
              if (isSignedIn && userRole === 'company') {
                router.push('/search')
              } else {
                router.push('/companies')
              }
            }}
            className={cn("bg-gradient-to-r from-[#454547] to-[#3a3a3c] hover:from-[#3a3a3c] hover:to-[#2f2f31] text-white", buttonStyles.size.large, typography.button.large, "rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto min-w-0 sm:min-w-[280px] group")}
          >
            <span>I need an <span className="font-bold">expert</span></span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          <Link href="/signup" className="w-full sm:w-auto">
            <Button className={cn(buttonStyles.primary, buttonStyles.size.large, typography.button.large, "flex items-center justify-center gap-2 w-full min-w-0 sm:min-w-[280px] group")}>
              <span>I'm <span className="font-bold">available</span> to <span className="font-bold">hire</span></span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12">
          <h2 className={`${typography.h1.base} mb-6`}>
            <span className="text-[#7394c7]">Winning Expert Talent</span>{" "}
            <span className="text-gray-800">appointments.</span>
          </h2>

          {/* Dotted line decoration */}
          <div className="flex justify-center mb-10">
            <div className="w-full max-w-3xl border-b-3 border-dotted border-gray-400 opacity-50"></div>
          </div>
        </div>

        {/* No Fees Statement */}
        <div className="text-center mb-16">
          <p className={`${typography.h2.base} text-gray-800 bg-gradient-to-r from-gray-100 to-gray-50 py-6 px-8 rounded-2xl inline-block shadow-inner`}>
            <span className="text-[#7394c7]">NO FEES</span> <span className="text-gray-600 font-normal">until you hire your expert.</span>
          </p>
        </div>

        {/* Enhanced CTA Section with Email Capture */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-[#7394c7] to-[#8595d5] text-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full transform -translate-x-24 translate-y-24"></div>
            </div>
            
            <div className="relative z-10">
              {status === "success" ? (
                // Success State
                <div className="text-center py-8 animate-fade-in">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-white" />
                  <h3 className={`${typography.h2.base} text-white mb-2`}>Thank You!</h3>
                  <p className="text-white/90 text-lg">
                    You're now subscribed to Board Champions insights.
                  </p>
                  <p className="text-white/80 mt-2">
                    Check your email for a welcome message.
                  </p>
                </div>
              ) : (
                // Form State
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left Column - Value Proposition */}
                  <div className="text-center md:text-left">
                    <h3 className={`${typography.h2.base} text-white mb-4`}>
                      Get a <span className="font-bold">FREE</span> consultation now
                    </h3>
                    <p className="text-white/90 mb-6 text-lg">
                      Join <span className="font-bold">5,000+</span> executives receiving weekly insights on:
                    </p>
                    <ul className="space-y-3 text-white/90">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Exclusive board member profiles & availability</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Industry trends in executive appointments</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Board governance best practices</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Early access to new expert talent</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Right Column - Form */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                          Your email address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="executive@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 bg-white/95 border-white/20 text-gray-800 placeholder:text-gray-500 h-12"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="newsletter"
                          checked={isSubscribed}
                          onCheckedChange={(checked) => setIsSubscribed(checked as boolean)}
                          className="mt-1 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-[#7394c7]"
                        />
                        <label htmlFor="newsletter" className="text-sm text-white/90 cursor-pointer">
                          Yes, I want to receive weekly Board Champions insights and updates
                        </label>
                      </div>
                      
                      {status === "error" && (
                        <div className="flex items-start gap-2 text-red-200 text-sm">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                          "w-full bg-white text-[#7394c7] hover:bg-gray-100",
                          buttonStyles.size.large,
                          typography.button.large,
                          "shadow-lg hover:shadow-xl font-bold group transition-all duration-300"
                        )}
                      >
                        {isLoading ? (
                          <>
                            <div className="h-5 w-5 border-2 border-[#7394c7] border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-white/70 text-center">
                        By subscribing, you agree to our{" "}
                        <Link href="/privacy" className="underline hover:text-white">
                          Privacy Policy
                        </Link>
                        . Unsubscribe anytime.
                      </p>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Process Section - MOVED BELOW THE FORM */}
        <div className="text-center mb-12">
          <h3 className={`${typography.h2.base} text-gray-700`}>
            The process of finding the best expert for your needs:
          </h3>
        </div>

        {/* Process Steps - New integrated layout */}
        <div 
          ref={processRef}
          className="max-w-7xl mx-auto"
        >
          {/* Desktop layout with integrated arrows */}
          <div className="hidden md:grid md:grid-cols-9 gap-0 items-center relative">
            {/* Background connecting line */}
            <div className={cn(
              "absolute top-1/2 left-20 right-20 h-px bg-gradient-to-r from-transparent via-[#7394c7]/15 to-transparent -z-10 transition-all duration-2500 ease-out transform -translate-y-1/2",
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )} 
            style={{
              transitionDelay: isVisible ? '200ms' : '0ms'
            }}
            />
            
            {processSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step Card */}
                <div 
                  className={cn(
                    "col-span-1 transition-all duration-1000 ease-out",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  style={{
                    transitionDelay: isVisible ? `${index * 250 + 300}ms` : '0ms'
                  }}
                >
                  <div className="process-step-card bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-400 group relative w-full h-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white px-3 py-3 group-hover:from-[#5a5a5a] group-hover:to-[#6a6a6a] transition-all duration-300 min-h-[52px] flex items-center justify-center">
                      <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-center text-white leading-tight">{step.title}</h4>
                    </div>

                    {/* Icon Section */}
                    <div className="p-5 sm:p-4 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-14 sm:h-14 flex items-center justify-center bg-[#7394c7]/5 rounded-full group-hover:bg-[#7394c7]/20 transition-all duration-300 ring-1 ring-[#7394c7]/10 group-hover:ring-[#7394c7]/30">
                        <Image
                          src={step.icon || "/placeholder.svg"}
                          alt={step.iconAlt}
                          width={35}
                          height={35}
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Arrow Connector - Only between steps */}
                {index < processSteps.length - 1 && (
                  <div 
                    className={cn(
                      "col-span-1 flex items-center justify-center transition-all duration-1000 ease-out",
                      isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    )}
                    style={{
                      transitionDelay: isVisible ? `${index * 250 + 500}ms` : '0ms'
                    }}
                  >
                    <div className="relative w-full flex items-center">
                      {/* Dotted line */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dotted border-[#7394c7]/30"></div>
                      </div>
                      {/* Arrow */}
                      <div className="relative bg-gradient-to-r from-white via-gray-50 to-white px-3 py-1 rounded-full">
                        <Image
                          src="/board-champions-assets/Arrow Charcoal.svg"
                          alt="Next step"
                          width={26}
                          height={26}
                          className="arrow-connector"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Mobile/Tablet Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:hidden gap-4 sm:gap-6">
            {processSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={cn(
                  "relative transition-all duration-1000 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{
                  transitionDelay: isVisible ? `${index * 200 + 300}ms` : '0ms'
                }}
              >
                {/* Mobile arrows - only show between rows */}
                {index === 1 && (
                  <div className="block sm:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 rotate-90 z-10">
                    <Image
                      src="/board-champions-assets/Arrow Charcoal.svg"
                      alt="Next step"
                      width={20}
                      height={20}
                      className="opacity-50"
                    />
                  </div>
                )}
                {index === 3 && (
                  <div className="block sm:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 rotate-90 z-10">
                    <Image
                      src="/board-champions-assets/Arrow Charcoal.svg"
                      alt="Next step"
                      width={20}
                      height={20}
                      className="opacity-50"
                    />
                  </div>
                )}
                
                {/* Card */}
                <div className="process-step-card bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-400 group relative w-full h-full">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white px-3 py-3 group-hover:from-[#5a5a5a] group-hover:to-[#6a6a6a] transition-all duration-300 min-h-[52px] flex items-center justify-center">
                    <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-center text-white leading-tight">{step.title}</h4>
                  </div>

                  {/* Icon Section */}
                  <div className="p-5 sm:p-4 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-14 sm:h-14 flex items-center justify-center bg-[#7394c7]/5 rounded-full group-hover:bg-[#7394c7]/20 transition-all duration-300 ring-1 ring-[#7394c7]/10 group-hover:ring-[#7394c7]/30">
                      <Image
                        src={step.icon || "/placeholder.svg"}
                        alt={step.iconAlt}
                        width={35}
                        height={35}
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}