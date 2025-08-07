"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export default function HeroSection() {
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("")

  const roles = [
    "Board Director",
    "Non-Executive Director",
    "Independent Director",
    "Fractional CFO",
    "Fractional CMO",
    "Fractional COO",
    "Advisory Board Member"
  ]

  const industries = [
    "Technology",
    "Financial Services",
    "Healthcare",
    "Manufacturing",
    "Retail & E-commerce",
    "Energy & Utilities",
    "Real Estate",
    "Professional Services"
  ]

  return (
    <section 
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #f9fafb, #ffffff)' }}
    >
      <div className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[55fr_45fr] gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition & Action */}
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bebas-neue tracking-wide mb-6"
                  style={{ color: '#374151' }}>
                STRATEGIC APPOINTMENTS THAT<br />
                DRIVE PERFORMANCE & VALUE
              </h1>
              
              <p className="text-lg sm:text-xl mb-8 leading-relaxed"
                 style={{ color: '#374151' }}>
                Access our exclusive network of board-level executives, vetted for their 
                real-world experience in delivering private equity-backed success.
              </p>

              {/* Search Functionality */}
              <div className="space-y-4 mb-6 max-w-lg">
                {/* Role Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => document.getElementById('role-dropdown')?.classList.toggle('hidden')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                  >
                    <span className="text-gray-700">
                      {selectedRole || "Select Your Role"}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </button>
                  <div id="role-dropdown" className="hidden absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role)
                          document.getElementById('role-dropdown')?.classList.add('hidden')
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => document.getElementById('industry-dropdown')?.classList.toggle('hidden')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                  >
                    <span className="text-gray-700">
                      {selectedIndustry || "Select Your Industry"}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </button>
                  <div id="industry-dropdown" className="hidden absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {industries.map((industry) => (
                      <button
                        key={industry}
                        onClick={() => {
                          setSelectedIndustry(industry)
                          document.getElementById('industry-dropdown')?.classList.add('hidden')
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link href={`/search?role=${encodeURIComponent(selectedRole)}&industry=${encodeURIComponent(selectedIndustry)}`}>
                <Button 
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-base font-semibold text-white group transition-all"
                  style={{ 
                    background: 'linear-gradient(to right, #7394c7, #8595d5)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #6b93ce, #5a82bd)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #7394c7, #8595d5)'
                  }}
                >
                  Find an Expert
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right Column: Awards & Accreditations */}
            <div 
              className="relative rounded-2xl p-8 lg:p-10"
              style={{ background: 'linear-gradient(to bottom, #f3f4f6, #f9fafb)' }}
            >
              <div className="text-center mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Our Awards & Accreditations
                </h3>
              </div>

              {/* Award Logos in Trophy Case Style */}
              <div className="relative">
                {/* The Sunday Times 100 - Top Center */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform">
                    <div className="text-center">
                      <div className="mb-2">
                        <div className="text-2xl font-bold text-gray-800">THE SUNDAY TIMES</div>
                        <div className="text-5xl font-black text-blue-600">100</div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">FASTEST GROWING COMPANIES</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 1000 Companies to Inspire Britain */}
                  <div className="bg-white rounded-lg shadow-md p-4 transform hover:scale-105 transition-transform">
                    <div className="text-center">
                      <div className="text-3xl font-black text-gray-800 mb-1">1000</div>
                      <p className="text-xs text-gray-600 font-medium leading-tight">
                        COMPANIES TO<br />
                        INSPIRE BRITAIN
                      </p>
                      <p className="text-xs text-blue-600 font-semibold mt-1">London Stock Exchange</p>
                    </div>
                  </div>

                  {/* Accelerate 250 */}
                  <div className="bg-white rounded-lg shadow-md p-4 transform hover:scale-105 transition-transform">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 mb-1">ACCELERATE</div>
                      <div className="text-3xl font-black text-gray-800">250</div>
                      <p className="text-xs text-gray-600 font-medium">TOP UK BUSINESSES</p>
                    </div>
                  </div>
                </div>

                {/* Additional Badges */}
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="px-3 py-1 bg-blue-50 rounded-full">
                    <span className="text-xs font-semibold text-blue-700">FTSE NETWORK</span>
                  </div>
                  <div className="px-3 py-1 bg-green-50 rounded-full">
                    <span className="text-xs font-semibold text-green-700">VERIFIED EXPERTS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}