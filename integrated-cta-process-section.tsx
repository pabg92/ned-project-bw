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
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container max-w-[1080px]">

        {/* Enhanced CTA Section with Email Capture */}
        <div className="mb-16">
          <h2 className="text-center mb-8 text-[var(--ink)] text-3xl font-semibold">
            Get a free, confidential consultation
          </h2>
          <div className="[background:var(--cta-grad)] py-12 rounded-2xl">
            <div className="max-w-6xl mx-auto px-6">
              <div className="bg-white rounded-card p-8 shadow-card text-[var(--ink)]">
              {status === "success" ? (
                // Success State
                <div className="text-center py-8 animate-fade-in">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-[var(--cta-start)]" />
                  <h3 className={`${typography.h2.base} text-[var(--ink)] mb-2`}>Thank You!</h3>
                  <p className="text-[var(--muted)] text-lg">
                    You're now subscribed to Board Champions insights.
                  </p>
                  <p className="text-[var(--muted)] mt-2">
                    Check your email for a welcome message.
                  </p>
                </div>
              ) : (
                // Form State
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left Column - Value Proposition */}
                  <div className="text-center md:text-left">
                    <p className="text-gray-700 mb-6 text-lg">
                      Join <span className="font-bold">5,000+</span> executives receiving weekly insights on:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-gray-600">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span>Exclusive board member profiles & availability</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-600">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span>Industry trends in executive appointments</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-600">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span>Board governance best practices</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-600">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span>Early access to new expert talent</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Right Column - Form */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
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
                            className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="newsletter"
                          checked={isSubscribed}
                          onCheckedChange={(checked) => setIsSubscribed(checked as boolean)}
                          className="mt-1 border-[var(--border)] data-[state=checked]:bg-[var(--cta-start)] data-[state=checked]:text-white"
                        />
                        <label htmlFor="newsletter" className="text-sm text-gray-600 cursor-pointer">
                          Yes, I want to receive weekly Board Champions insights and updates
                        </label>
                      </div>
                      
                      {status === "error" && (
                        <div className="flex items-start gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 [background:var(--cta-grad)] hover:[background:var(--hover-grad)] text-white rounded-btn shadow-btn font-semibold transition-all duration-200 group"
                      >
                        {isLoading ? (
                          <>
                            <div className="h-5 w-5 border-2 border-[var(--cta-start)] border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        By subscribing, you agree to our{" "}
                        <Link href="/privacy" className="underline hover:text-gray-700">
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
        </div>

      </div>
    </section>
  )
}