"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Filter, X, RotateCcw, Loader2 } from "lucide-react"
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

// Filter sections are now dynamically generated in getFilterSections()

interface Props {
  filters: SearchFiltersType
  updateFilter: (key: keyof SearchFiltersType, value: any) => void
  onToggle: () => void
}

export default function SearchFilters({ filters, updateFilter, onToggle }: Props) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["role", "sectors"])
  const [filterCounts, setFilterCounts] = useState<Record<string, any>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  
  // Fetch real filter counts
  useEffect(() => {
    const fetchFilterCounts = async () => {
      try {
        const response = await fetch('/api/search/filter-counts');
        const data = await response.json();
        
        if (data.success) {
          setFilterCounts(data.data);
        }
      } catch (error) {
        console.error('Error fetching filter counts:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    };
    
    fetchFilterCounts();
  }, []);
  
  // Update filter sections with real counts
  const getFilterSections = (): FilterSection[] => {
    const sections: FilterSection[] = [
      {
        title: "Role Type",
        key: "role",
        type: "checkbox",
        options: filterCounts.role || [
          { value: "chair", label: "Chair", count: 0 },
          { value: "ned", label: "Non-Executive Director", count: 0 },
          { value: "advisor", label: "Advisor", count: 0 },
          { value: "trustee", label: "Trustee", count: 0 },
          { value: "senior-independent", label: "Senior Independent Director", count: 0 },
        ]
      },
      {
        title: "Sector Experience",
        key: "sectors",
        type: "checkbox",
        options: filterCounts.sectors || [
          { value: "financial-services", label: "Financial Services", count: 0 },
          { value: "technology", label: "Technology", count: 0 },
          { value: "healthcare", label: "Healthcare", count: 0 },
        ]
      },
      {
        title: "Years of Experience",
        key: "experience",
        type: "radio",
        options: [
          { value: "0-5", label: "0-5 years", count: filterCounts.experience?.find((e: any) => e.value === 'junior')?.count || 0 },
          { value: "5-10", label: "5-10 years", count: filterCounts.experience?.find((e: any) => e.value === 'mid')?.count || 0 },
          { value: "10-15", label: "10-15 years", count: filterCounts.experience?.find((e: any) => e.value === 'senior')?.count || 0 },
          { value: "15-20", label: "15-20 years", count: filterCounts.experience?.find((e: any) => e.value === 'lead')?.count || 0 },
          { value: "20+", label: "20+ years", count: filterCounts.experience?.find((e: any) => e.value === 'executive')?.count || 0 },
        ]
      },
      {
        title: "Location",
        key: "location",
        type: "radio",
        options: filterCounts.location || [
          { value: "london", label: "London", count: 0 },
          { value: "midlands", label: "Midlands", count: 0 },
          { value: "uk", label: "UK", count: 0 },
          { value: "international", label: "International", count: 0 },
        ]
      },
      {
        title: "Board Experience",
        key: "boardExperience",
        type: "checkbox",
        options: filterCounts.boardExperience || [
          { value: "ftse100", label: "FTSE 100", count: 0 },
          { value: "ftse250", label: "FTSE 250", count: 0 },
          { value: "aim", label: "AIM Listed", count: 0 },
          { value: "private-equity", label: "Private Equity Backed", count: 0 },
          { value: "startup", label: "Startup/Scale-up", count: 0 },
          { value: "public-sector", label: "Public Sector", count: 0 },
          { value: "charity", label: "Charity/Third Sector", count: 0 },
        ]
      },
      {
        title: "Availability",
        key: "availability",
        type: "radio",
        options: filterCounts.availability || [
          { value: "immediately", label: "Immediate", count: 0 },
          { value: "2weeks", label: "Within 2 weeks", count: 0 },
          { value: "1month", label: "Within 1 month", count: 0 },
          { value: "3months", label: "Within 3 months", count: 0 },
          { value: "6months", label: "Within 6 months", count: 0 },
        ]
      }
    ];
    
    return sections;
  };
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const resetFilters = () => {
    updateFilter("role", [])
    updateFilter("sectors", [])
    updateFilter("skills", [])
    updateFilter("experience", "")
    updateFilter("location", "")
    updateFilter("availability", "")
    updateFilter("boardExperience", [])
  }

  const activeFilterCount = [
    filters.role.length,
    filters.sectors.length,
    filters.skills.length,
    filters.experience ? 1 : 0,
    filters.location ? 1 : 0,
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
        {isLoadingCounts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#6b93ce]" />
          </div>
        ) : (
          getFilterSections().map((section) => (
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
          ))
        )}
      </div>

      {/* Skills Tags */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Popular Skills</h4>
        <div className="flex flex-wrap gap-2">
          {(filterCounts.skills || [
            { value: "Digital Transformation", label: "Digital Transformation", count: 0 },
            { value: "Risk Management", label: "Risk Management", count: 0 },
            { value: "M&A", label: "M&A", count: 0 },
            { value: "ESG", label: "ESG", count: 0 },
            { value: "Cybersecurity", label: "Cybersecurity", count: 0 },
            { value: "Finance", label: "Finance", count: 0 },
            { value: "Strategy", label: "Strategy", count: 0 },
            { value: "Governance", label: "Governance", count: 0 },
          ]).map((skill: any) => (
            <button
              key={skill.value}
              onClick={() => {
                const currentSkills = filters.skills
                if (currentSkills.includes(skill.value)) {
                  updateFilter("skills", currentSkills.filter(s => s !== skill.value))
                } else {
                  updateFilter("skills", [...currentSkills, skill.value])
                }
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1",
                filters.skills.includes(skill.value)
                  ? "bg-[#6b93ce] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {skill.label}
              {skill.count > 0 && (
                <span className="text-[10px] opacity-75">({skill.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}