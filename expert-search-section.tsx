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

type TabType = "specialism" | "sector" | "organisation type" | "role"

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
        case "organisation type":
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
    <section className="pt-0 pb-16 bg-white relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#7394c7] to-[#8595d5] text-white rounded-2xl p-6 mt-10 mb-16 text-center shadow-xl">
          <h3 className={`${typography.h3.base} mb-2`}>Get a FREE consultation now</h3>
          <Button className={cn("bg-white text-[#7394c7] hover:bg-gray-100", buttonStyles.size.large, typography.button.large, "inline-flex items-center gap-2 shadow-lg hover:shadow-xl font-bold")}>
            I'M IN!
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
        
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <h2 className={`${typography.h1.base} text-gray-800 font-bold`}>
            SEARCH BY <span className="text-[#7394c7]">{activeTab.toUpperCase()}</span>
          </h2>
          
          {/* Dotted line decoration */}
          <div className="flex justify-center mt-6">
            <div className="w-full max-w-lg border-b-3 border-dotted border-[#7394c7] opacity-40"></div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 relative">
          <button
            onClick={() => setActiveTab("specialism")}
            className={`relative px-5 py-2.5 ${typography.button.base} font-medium transition-all duration-300 rounded-full ${
              activeTab === "specialism"
                ? "bg-[#7394c7] text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            BY SPECIALISM
          </button>
          <button
            onClick={() => setActiveTab("sector")}
            className={`relative px-5 py-2.5 ${typography.button.base} font-medium transition-all duration-300 rounded-full ${
              activeTab === "sector"
                ? "bg-[#7394c7] text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            BY SECTOR
          </button>
          <button
            onClick={() => setActiveTab("organisation type")}
            className={`relative px-5 py-2.5 ${typography.button.base} font-medium transition-all duration-300 rounded-full ${
              activeTab === "organisation type"
                ? "bg-[#7394c7] text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            BY ORGANISATION TYPE
          </button>
          <button
            onClick={() => setActiveTab("role")}
            className={`relative px-5 py-2.5 ${typography.button.base} font-medium transition-all duration-300 rounded-full ${
              activeTab === "role"
                ? "bg-[#7394c7] text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            BY ROLE
          </button>
        </div>

        {/* Enhanced Filter Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto mb-8 px-4">
          {getActiveContent().map((item, index) => (
            <Button
              key={index}
              className={cn("bg-gradient-to-r from-[#8595d5] to-[#9595e5] hover:from-[#7585c5] hover:to-[#8585d5] text-white", buttonStyles.size.base, typography.button.base, "rounded-full shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group min-w-0 px-4 py-2.5")}
            >
              <span className="truncate">{item}</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
            </Button>
          ))}
        </div>
        
        {/* View All Filters Button */}
        {((activeTab === "sector" && sectors.length > 6) || 
          (activeTab === "organisation type" && organisationTypes.length > 6)) && (
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