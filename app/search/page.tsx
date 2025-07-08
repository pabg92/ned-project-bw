"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import SearchNavbar from "@/components/search/search-navbar"
import Footer from "@/footer"
import SearchFilters from "@/components/search/search-filters"
import SearchResults from "@/components/search/search-results"
import EnhancedSearchBar from "@/components/search/enhanced-search-bar"
import SearchCTABanner from "@/components/search/search-cta-banner"
import { useShortlist } from "@/hooks/use-shortlist"
import { useCredits } from "@/hooks/use-credits"
import { Button } from "@/components/ui/button"
import { CreditCard, Info } from "lucide-react"
import Link from "next/link"

export interface SearchFilters {
  query: string
  role: string[]
  sectors: string[]
  skills: string[]
  experience: string
  location: string
  availability: string
  boardExperience: string[]
  remotePreference?: string
  salaryMin?: number
  salaryMax?: number
}

/**
 * Search Page - Company Users Only
 * 
 * This page allows company users to search and browse board member candidates.
 * Access is restricted to users with 'company' or 'admin' role.
 * 
 * Features:
 * - Browse anonymized candidate profiles
 * - Filter by various criteria
 * - Unlock profiles using credits
 * - Save profiles to shortlist
 * - Save search criteria
 */
export default function SearchPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const userRole = user?.publicMetadata?.role as string
  
  // Check access on mount
  useEffect(() => {
    if (isLoaded) {
      console.log('[Search] Access check:', {
        isSignedIn,
        userRole,
        publicMetadata: user?.publicMetadata,
        shouldRedirect: !isSignedIn || (userRole !== 'company' && userRole !== 'admin')
      })
      
      if (!isSignedIn || (userRole !== 'company' && userRole !== 'admin')) {
        console.log('[Search] Access denied, redirecting to /companies')
        router.push('/companies')
      }
    }
  }, [isLoaded, isSignedIn, userRole, router, user])
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    role: [],
    sectors: [],
    skills: [],
    experience: "",
    location: "",
    availability: "",
    boardExperience: [],
    remotePreference: "",
    salaryMin: undefined,
    salaryMax: undefined
  })
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(true)
  const [savedSearches, setSavedSearches] = useState<string[]>([])
  
  // Use real credits from Clerk
  const { credits, loading: creditsLoading } = useCredits()
  
  // Use real shortlist
  const { profiles: shortlistProfiles } = useShortlist()
  const shortlistCount = shortlistProfiles.length
  
  // Show loading state while checking auth
  if (!isLoaded || creditsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b93ce] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading search...</p>
        </div>
      </div>
    )
  }

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
      
      {/* Welcome Banner for Company Users */}
      {userRole === 'company' && credits === 0 && (
        <div className="bg-[#6b93ce] text-white px-4 py-3">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5" />
              <p className="text-sm">
                Welcome! You can browse profiles for free. Purchase credits to unlock full candidate details.
              </p>
            </div>
            <Link href="/billing">
              <Button size="sm" variant="secondary" className="bg-white text-[#6b93ce] hover:bg-gray-100">
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
            </Link>
          </div>
        </div>
      )}
      
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