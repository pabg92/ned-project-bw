"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography, buttonStyles, cn } from "@/lib/typography"
import Link from "next/link"

const specialisms = [
  "CFO",
  "CMO",
  "PEOPLE & HR",
  "SUSTAINABILITY",
  "COO",
  "TRAINING"
]

const sectors = [
  { display: "Arts & Creative Industries", value: "arts-creative-industries" },
  { display: "Business & Professional Services", value: "business-professional-services" },
  { display: "Charity", value: "charity" },
  { display: "Consumer", value: "consumer" },
  { display: "Education", value: "education" },
  { display: "Energy & Renewables", value: "energy-renewables" },
  { display: "Financial Services", value: "financial-services" },
  { display: "Healthcare", value: "healthcare" },
  { display: "Housing Association", value: "housing-association" },
  { display: "Industrial & Manufacturing", value: "industrial-manufacturing" },
  { display: "NHS Trusts", value: "nhs-trusts" },
  { display: "Public Sector", value: "public-sector" },
  { display: "Real Estate", value: "real-estate" }
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
  { display: "Chair", value: "chair" },
  { display: "Non-Executive Director", value: "ned" },
  { display: "Advisor", value: "advisor" },
  { display: "Trustee", value: "trustee" }
]

type TabType = "specialism" | "sector" | "organisation type" | "role"

export default function ExpertSearchSection() {
  const [activeTab, setActiveTab] = useState<TabType>("specialism")
  const [showAllFilters, setShowAllFilters] = useState(false)

  const getActiveContent = () => {
    const content = (() => {
      switch (activeTab) {
        case "specialism":
          return specialisms.map(s => ({ display: s, value: s }))
        case "sector":
          return sectors
        case "organisation type":
          return organisationTypes.map(o => ({ display: o, value: o }))
        case "role":
          return roles
        default:
          return specialisms.map(s => ({ display: s, value: s }))
      }
    })()
    
    // Show only first 6 items unless expanded
    return showAllFilters ? content : content.slice(0, 6)
  }

  return (
    <section className="pt-10 pb-10 bg-white relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <h2 className={`${typography.h1.base} text-gray-800 mb-4`}>
            EXPERTISE TO SOLVE YOUR CHALLENGES
          </h2>
          <p className={`${typography.body.large} text-gray-600 max-w-3xl mx-auto`}>
            Our network possesses deep functional expertise across every critical area of business leadership.
          </p>
          
          {/* Dotted line decoration */}
          <div className="flex justify-center mt-6">
            <div className="w-full max-w-lg border-b-3 border-dotted border-[var(--cta-start)] opacity-40"></div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 relative">
          <button
            onClick={() => setActiveTab("specialism")}
            className={`relative px-5 py-2.5 ${typography.button.base} font-medium transition-all duration-300 rounded-full ${
              activeTab === "specialism"
                ? "[background:var(--cta-grad)] text-white shadow-lg scale-105"
                : "bg-[var(--bg-subtle)] text-[var(--muted)] hover:bg-[#E2E8F0]"
            }`}
          >
            BY SPECIALISM
          </button>
          <button
            onClick={() => setActiveTab("sector")}
            className={`relative px-5 py-2.5 ${typography.button.base} font-medium transition-all duration-300 rounded-full ${
              activeTab === "sector"
                ? "[background:var(--cta-grad)] text-white shadow-lg scale-105"
                : "bg-[var(--bg-subtle)] text-[var(--muted)] hover:bg-[#E2E8F0]"
            }`}
          >
            BY SECTOR
          </button>
          <button
            onClick={() => setActiveTab("organisation type")}
            className={`relative px-5 py-2.5 ${typography.button.base} font-medium transition-all duration-300 rounded-full ${
              activeTab === "organisation type"
                ? "[background:var(--cta-grad)] text-white shadow-lg scale-105"
                : "bg-[var(--bg-subtle)] text-[var(--muted)] hover:bg-[#E2E8F0]"
            }`}
          >
            BY ORGANISATION TYPE
          </button>
          <button
            onClick={() => setActiveTab("role")}
            className={`relative px-5 py-2.5 ${typography.button.base} font-medium transition-all duration-300 rounded-full ${
              activeTab === "role"
                ? "[background:var(--cta-grad)] text-white shadow-lg scale-105"
                : "bg-[var(--bg-subtle)] text-[var(--muted)] hover:bg-[#E2E8F0]"
            }`}
          >
            BY ROLE
          </button>
        </div>

        {/* Enhanced Filter Pills Grid */}
        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto mb-8 px-4">
          {getActiveContent().map((item, index) => {
            // Create the appropriate filter URL based on active tab
            const filterUrl = (() => {
              const baseUrl = "/search?"
              switch (activeTab) {
                case "specialism":
                  return `${baseUrl}query=${encodeURIComponent(item.value)}`
                case "sector":
                  return `${baseUrl}sectors=${encodeURIComponent(item.value)}`
                case "organisation type":
                  // Map organization types to sectors or handle separately
                  return `${baseUrl}sectors=${encodeURIComponent(item.value)}`
                case "role":
                  return `${baseUrl}role=${encodeURIComponent(item.value)}`
                default:
                  return "/search"
              }
            })()

            return (
              <Link key={index} href={filterUrl}>
                <Button
                  className={cn("[background:var(--cta-grad)] hover:[background:var(--hover-grad)] text-white", buttonStyles.size.base, typography.button.base, "rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group min-w-[140px] max-w-[200px] px-4 py-2.5")}
                >
                  <span className="truncate">{item.display}</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                </Button>
              </Link>
            )
          })}
        </div>
        
        {/* View All Filters Button */}
        {((activeTab === "sector" && sectors.length > 6) || 
          (activeTab === "organisation type" && organisationTypes.length > 6)) && (
          <div className="text-center">
            <button
              onClick={() => setShowAllFilters(!showAllFilters)}
              className={`text-[var(--cta-start)] hover:text-[var(--hover-start)] ${typography.body.base} inline-flex items-center gap-1 transition-colors duration-300`}
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