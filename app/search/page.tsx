"use client"

import { useState } from "react"
import Navbar from "@/navbar"
import Footer from "@/footer"
import SearchFilters from "@/components/search/search-filters"
import SearchResults from "@/components/search/search-results"
import SearchHeader from "@/components/search/search-header"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

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

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search Header with Credits Display */}
      <SearchHeader />
      
      {/* Main Search Section */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name, role, skills, or company..."
              value={filters.query}
              onChange={(e) => updateFilter("query", e.target.value)}
              className="pl-12 pr-4 py-4 text-lg rounded-full border-gray-200 shadow-sm focus:ring-2 focus:ring-[#6b93ce] focus:border-transparent"
            />
          </div>
        </div>
        
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