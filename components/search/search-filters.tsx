"use client"

import { useState } from "react"
import { ChevronDown, Filter, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { SearchFilters as SearchFiltersType } from "@/app/search/page"

interface FilterSection {
  title: string
  key: keyof SearchFiltersType
  options: { value: string; label: string; count?: number }[]
  type: "checkbox" | "radio"
}

const filterSections: FilterSection[] = [
  {
    title: "Role Type",
    key: "role",
    type: "checkbox",
    options: [
      { value: "chair", label: "Chair", count: 145 },
      { value: "ned", label: "Non-Executive Director", count: 892 },
      { value: "advisor", label: "Advisor", count: 534 },
      { value: "trustee", label: "Trustee", count: 267 },
      { value: "senior-independent", label: "Senior Independent Director", count: 89 },
    ]
  },
  {
    title: "Sector Experience",
    key: "sector",
    type: "checkbox",
    options: [
      { value: "financial-services", label: "Financial Services", count: 423 },
      { value: "technology", label: "Technology", count: 567 },
      { value: "healthcare", label: "Healthcare", count: 234 },
      { value: "retail", label: "Retail & Consumer", count: 345 },
      { value: "manufacturing", label: "Manufacturing", count: 189 },
      { value: "energy", label: "Energy & Renewables", count: 156 },
      { value: "real-estate", label: "Real Estate", count: 278 },
      { value: "education", label: "Education", count: 123 },
      { value: "nonprofit", label: "Not-for-Profit", count: 234 },
    ]
  },
  {
    title: "Years of Experience",
    key: "experience",
    type: "radio",
    options: [
      { value: "0-5", label: "0-5 years" },
      { value: "5-10", label: "5-10 years" },
      { value: "10-15", label: "10-15 years" },
      { value: "15-20", label: "15-20 years" },
      { value: "20+", label: "20+ years" },
    ]
  },
  {
    title: "Location",
    key: "location",
    type: "checkbox",
    options: [
      { value: "london", label: "London", count: 456 },
      { value: "south-east", label: "South East", count: 234 },
      { value: "south-west", label: "South West", count: 178 },
      { value: "midlands", label: "Midlands", count: 267 },
      { value: "north", label: "North", count: 345 },
      { value: "scotland", label: "Scotland", count: 123 },
      { value: "wales", label: "Wales", count: 89 },
      { value: "ni", label: "Northern Ireland", count: 45 },
      { value: "international", label: "International", count: 234 },
    ]
  },
  {
    title: "Board Experience",
    key: "boardExperience",
    type: "checkbox",
    options: [
      { value: "ftse100", label: "FTSE 100", count: 234 },
      { value: "ftse250", label: "FTSE 250", count: 345 },
      { value: "aim", label: "AIM Listed", count: 456 },
      { value: "private-equity", label: "Private Equity Backed", count: 367 },
      { value: "startup", label: "Startup/Scale-up", count: 289 },
      { value: "public-sector", label: "Public Sector", count: 178 },
      { value: "charity", label: "Charity/Third Sector", count: 234 },
    ]
  },
  {
    title: "Availability",
    key: "availability",
    type: "radio",
    options: [
      { value: "immediate", label: "Immediate" },
      { value: "1-month", label: "Within 1 month" },
      { value: "3-months", label: "Within 3 months" },
      { value: "6-months", label: "Within 6 months" },
    ]
  }
]

interface Props {
  filters: SearchFiltersType
  updateFilter: (key: keyof SearchFiltersType, value: any) => void
  onToggle: () => void
}

export default function SearchFilters({ filters, updateFilter, onToggle }: Props) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["role", "sector"])
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const resetFilters = () => {
    updateFilter("role", [])
    updateFilter("sector", [])
    updateFilter("skills", [])
    updateFilter("experience", "")
    updateFilter("location", [])
    updateFilter("availability", "")
    updateFilter("boardExperience", [])
  }

  const activeFilterCount = [
    filters.role.length,
    filters.sector.length,
    filters.skills.length,
    filters.experience ? 1 : 0,
    filters.location.length,
    filters.availability ? 1 : 0,
    filters.boardExperience.length,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-[#6b93ce] text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-200">
        {filterSections.map((section) => (
          <div key={section.title} className="p-4">
            <button
              onClick={() => toggleSection(section.key)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-gray-900">{section.title}</h4>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  expandedSections.includes(section.key) && "rotate-180"
                )}
              />
            </button>
            
            {expandedSections.includes(section.key) && (
              <div className="mt-4 space-y-3">
                {section.type === "checkbox" ? (
                  section.options.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={(filters[section.key] as string[]).includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = filters[section.key] as string[]
                            if (checked) {
                              updateFilter(section.key, [...currentValues, option.value])
                            } else {
                              updateFilter(section.key, currentValues.filter(v => v !== option.value))
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </div>
                      {option.count && (
                        <span className="text-xs text-gray-500">({option.count})</span>
                      )}
                    </label>
                  ))
                ) : (
                  <RadioGroup
                    value={filters[section.key] as string}
                    onValueChange={(value) => updateFilter(section.key, value)}
                  >
                    {section.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                      >
                        <RadioGroupItem value={option.value} />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Skills Tags */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Popular Skills</h4>
        <div className="flex flex-wrap gap-2">
          {[
            "Digital Transformation",
            "Risk Management",
            "M&A",
            "ESG",
            "Cybersecurity",
            "Finance",
            "Strategy",
            "Governance",
          ].map((skill) => (
            <button
              key={skill}
              onClick={() => {
                const currentSkills = filters.skills
                if (currentSkills.includes(skill)) {
                  updateFilter("skills", currentSkills.filter(s => s !== skill))
                } else {
                  updateFilter("skills", [...currentSkills, skill])
                }
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                filters.skills.includes(skill)
                  ? "bg-[#6b93ce] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}