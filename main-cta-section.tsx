"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { typography, buttonStyles, cn, spacing } from "@/lib/typography"
import React from "react"

export default function MainCTASection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

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
        {/* Main Heading */}
        <div className="text-center mb-12">
          <h2 className={`${typography.h1.base} mb-4`}>
            <span className="text-[#7394c7]">READY TO BUILD A WINNING BOARD?</span>
          </h2>
          <p className={`${typography.h3.base} text-gray-700`}>
            GET A FREE, CONFIDENTIAL CONSULTATION NOW
          </p>
        </div>

        {/* Enhanced CTA Section with Email Capture */}
        <div className="max-w-6xl mx-auto">
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
                      Start your journey to <span className="font-bold">exceptional leadership</span>
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
      </div>
    </section>
  )
}