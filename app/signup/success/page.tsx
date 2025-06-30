"use client"

import { useEffect, useState } from "react"
import { CheckCircle, ArrowRight, Calendar, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"

export default function SignupSuccessPage() {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6b93ce", "#5a82bd", "#4a72ad"]
    })

    // Show content with animation
    setTimeout(() => setShowContent(true), 200)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className={cn(
        "max-w-2xl w-full transition-all duration-1000 transform",
        showContent ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 animate-bounce-slow">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bebas-neue text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Thank you for applying to join our exclusive network of board directors. 
            Your application has been received and is under review.
          </p>

          {/* What's Next Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What happens next?</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-[#6b93ce] text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                <span className="text-gray-700">
                  Our team will review your application within 2-3 business days
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-[#6b93ce] text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                <span className="text-gray-700">
                  You'll receive an email confirmation with your application details
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-[#6b93ce] text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                <span className="text-gray-700">
                  If approved, we'll schedule an introductory call to discuss opportunities
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="#" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-[#6b93ce] transition-all duration-300 hover:shadow-md">
                <Calendar className="h-8 w-8 text-[#6b93ce] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Schedule a Call</p>
              </div>
            </Link>
            <Link href="#" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-[#6b93ce] transition-all duration-300 hover:shadow-md">
                <Mail className="h-8 w-8 text-[#6b93ce] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Contact Support</p>
              </div>
            </Link>
            <Link href="#" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-[#6b93ce] transition-all duration-300 hover:shadow-md">
                <Phone className="h-8 w-8 text-[#6b93ce] mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Call Us</p>
              </div>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button 
                variant="outline" 
                className="border-[#6b93ce] text-[#6b93ce] hover:bg-[#6b93ce] hover:text-white transition-all duration-300"
              >
                Return to Homepage
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                View Your Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Reference Number */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Your reference number: <span className="font-mono font-medium text-gray-700">BC-{Date.now().toString().slice(-8)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}