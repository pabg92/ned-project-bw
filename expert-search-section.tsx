"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography, buttonStyles, cn } from "@/lib/typography"

const specialisms = [
  "CFO",
  "CMO",
  "PEOPLE & HR",
  "SUSTAINABILITY",
  "COO",
  "TRAINING"
]

const sectors = [
  "Arts & Creative Industries",
  "Business & Professional Services",
  "Charity",
  "Consumer",
  "Education",
  "Energy & Renewables",
  "Financial Services",
  "Healthcare",
  "Housing Association",
  "Industrial & Manufacturing",
  "NHS Trusts",
  "Public Sector",
  "Real Estate"
]

const organisationTypes = [
  "AIM Listed",
  "Education",
  "Government",
  "Private Equity",
  "Privately Owned",
  "Publicly Listed",
  "Not-for-profit",
  "Venture Backed Startups & Scaleups"
]

const roles = [
  "Chair",
  "Non-Executive Director",
  "Advisor",
  "Trustee"
]

type TabType = "specialism" | "sector" | "organisation" | "role"

export default function ExpertSearchSection() {
  const [activeTab, setActiveTab] = useState<TabType>("specialism")
  const [showAllFilters, setShowAllFilters] = useState(false)

  const getActiveContent = () => {
    const content = (() => {
      switch (activeTab) {
        case "specialism":
          return specialisms
        case "sector":
          return sectors
        case "organisation":
          return organisationTypes
        case "role":
          return roles
        default:
          return specialisms
      }
    })()
    
    // Show only first 6 items unless expanded
    return showAllFilters ? content : content.slice(0, 6)
  }

  return (
    <section className="py-10 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#7394c7] rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#9090cc] rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <h2 className={`${typography.h2.base} text-gray-800`}>
            SEARCH BY <span className="text-[#7394c7]">SPECIALISM</span>
          </h2>
          
          {/* Dotted line decoration */}
          <div className="flex justify-center mt-4">
            <div className="w-full max-w-md border-b-2 border-dotted border-gray-400 opacity-50"></div>
          </div>
        </div>

        {/* Compact Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => setActiveTab("specialism")}
            className={`relative px-4 py-2 ${typography.button.base} transition-all duration-300 rounded-full ${
              activeTab === "specialism"
                ? "bg-[#7394c7] text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            BY SPECIALISM
          </button>
          <button
            onClick={() => setActiveTab("sector")}
            className={`relative px-4 py-2 ${typography.button.base} transition-all duration-300 rounded-full ${
              activeTab === "sector"
                ? "bg-[#7394c7] text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            BY SECTOR
          </button>
          <button
            onClick={() => setActiveTab("organisation")}
            className={`relative px-4 py-2 ${typography.button.base} transition-all duration-300 rounded-full ${
              activeTab === "organisation"
                ? "bg-[#7394c7] text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            BY ORGANISATION TYPE
          </button>
          <button
            onClick={() => setActiveTab("role")}
            className={`relative px-4 py-2 ${typography.button.base} transition-all duration-300 rounded-full ${
              activeTab === "role"
                ? "bg-[#7394c7] text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            BY ROLE
          </button>
        </div>

        {/* Compact Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-6">
          {getActiveContent().map((item, index) => (
            <Button
              key={index}
              className={cn("bg-gradient-to-r from-[#9090cc] to-[#a0a0dc] hover:from-[#8080bb] hover:to-[#9090cc] text-white", buttonStyles.size.base, typography.button.base, "rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-1.5 group")}
            >
              {item}
              <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          ))}
        </div>
        
        {/* View All Filters Button */}
        {((activeTab === "sector" && sectors.length > 6) || 
          (activeTab === "organisation" && organisationTypes.length > 6)) && (
          <div className="text-center">
            <button
              onClick={() => setShowAllFilters(!showAllFilters)}
              className={`text-[#7394c7] hover:text-[#6284b6] ${typography.body.base} inline-flex items-center gap-1 transition-colors duration-300`}
            >
              {showAllFilters ? "Show Less" : "View All Filters"}
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showAllFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}