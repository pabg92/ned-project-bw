"use client"

import { useState } from "react"
import SearchNavbar from "@/components/search/search-navbar"
import Footer from "@/footer"
import SearchFilters from "@/components/search/search-filters"
import SearchResults from "@/components/search/search-results"
import EnhancedSearchBar from "@/components/search/enhanced-search-bar"
import SearchCTABanner from "@/components/search/search-cta-banner"
import { useShortlist } from "@/hooks/use-shortlist"

export interface SearchFilters {
  query: string
  role: string[]
  sector: string[]
  skills: string[]
  experience: string
  location: string[]
  availability: string
  boardExperience: string[]
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    role: [],
    sector: [],
    skills: [],
    experience: "",
    location: [],
    availability: "",
    boardExperience: []
  })
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(true)
  const [credits, setCredits] = useState(10) // Mock credits
  const [savedSearches, setSavedSearches] = useState<string[]>([])
  
  // Mock shortlist hook - will be replaced with real implementation
  const shortlistCount = 3

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSearch = () => {
    const searchString = JSON.stringify(filters)
    setSavedSearches(prev => [...prev, searchString])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchNavbar 
        credits={credits}
        shortlistCount={shortlistCount}
        savedSearchCount={savedSearches.length}
      />
      
      {/* CTA Banner */}
      <SearchCTABanner credits={credits} />
      
      {/* Main Search Section */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search Bar */}
        <EnhancedSearchBar 
          value={filters.query}
          onChange={(value) => updateFilter("query", value)}
          onSaveSearch={handleSaveSearch}
        />
        
        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <SearchFilters 
                filters={filters} 
                updateFilter={updateFilter}
                onToggle={() => setShowFilters(!showFilters)}
              />
            </div>
          )}
          
          {/* Results Area */}
          <div className="flex-1">
            <SearchResults 
              filters={filters}
              viewMode={viewMode}
              sortBy={sortBy}
              onViewModeChange={setViewMode}
              onSortChange={setSortBy}
              onToggleFilters={() => setShowFilters(!showFilters)}
              showFilters={showFilters}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}