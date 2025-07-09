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
 * Search Page - Public Access
 * 
 * This page allows anyone to search and browse board member candidates.
 * Different features are available based on user status:
 * 
 * Public (not logged in):
 * - Browse anonymized candidate profiles
 * - Filter by various criteria
 * - See limited profile information
 * 
 * Authenticated (not company):
 * - Same as public + prompts to upgrade
 * 
 * Company/Admin users:
 * - Full access including profile unlocking
 * - Save profiles to shortlist
 * - Save search criteria
 */
export default function SearchPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const userRole = user?.publicMetadata?.role as string
  const isCompanyUser = userRole === 'company' || userRole === 'admin'
  
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
  const [searchQuery, setSearchQuery] = useState("") // Local state for immediate UI updates
  const [debouncedQuery, setDebouncedQuery] = useState("") // Debounced state for API calls
  
  // Use real credits from Clerk (only for company users)
  const { credits, loading: creditsLoading } = useCredits()
  
  // Use real shortlist (only for authenticated users)
  const { profiles: shortlistProfiles } = useShortlist()
  const shortlistCount = isSignedIn ? shortlistProfiles.length : 0
  
  // Show loading state while checking auth (only show for authenticated users)
  if (!isLoaded || (isSignedIn && creditsLoading)) {
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
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/search')
      return
    }
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
      
      {/* Welcome Banners based on user status */}
      {!isSignedIn && (
        <div className="bg-gradient-to-r from-[#7394c7] to-[#8595d5] text-white px-4 py-3">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5" />
              <p className="text-sm font-medium">
                You're browsing as a guest. Sign up to unlock profiles and save searches.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/sign-in?redirect_url=/search">
                <Button size="sm" variant="secondary" className="bg-white text-[#7394c7] hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up?role=company">
                <Button size="sm" className="bg-white/20 text-white border border-white/30 hover:bg-white/30">
                  Sign Up as Company
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {isSignedIn && !isCompanyUser && (
        <div className="bg-[#6b93ce] text-white px-4 py-3">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5" />
              <p className="text-sm">
                Upgrade to a company account to unlock full profiles and contact candidates.
              </p>
            </div>
            <Link href="/companies">
              <Button size="sm" variant="secondary" className="bg-white text-[#6b93ce] hover:bg-gray-100">
                Upgrade Account
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {isCompanyUser && credits === 0 && (
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
          value={searchQuery}
          onChange={setSearchQuery}
          onDebouncedChange={(value) => updateFilter("query", value)}
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
              isSignedIn={isSignedIn}
              isCompanyUser={isCompanyUser}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}