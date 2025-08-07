"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import SearchNavbar from "@/components/search/search-navbar"
import Footer from "@/footer"
import SearchResults from "@/components/search/search-results"
import EnhancedSearchBar from "@/components/search/enhanced-search-bar"
import UnifiedSearchBanner from "@/components/search/unified-search-banner"
import { useShortlist } from "@/hooks/use-shortlist"
import { useCredits } from "@/hooks/use-credits"
import { useSavedSearches } from "@/hooks/use-saved-searches"
import { Button } from "@/components/ui/button"
import { CreditCard, Info, Bookmark, BookmarkCheck, Filter } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import QuickAccessPanel from "@/components/search/quick-access-panel"
import DemoUserSwitcher from "@/components/demo-user-switcher"

// New unified filter system imports
import { useSearchFilters } from "@/lib/search/useSearchFilters"
import { ROLE_TYPES, ORG_TYPES, SECTORS, SPECIALISMS } from "@/lib/search/filter-data"
import { RolePopover } from "@/components/sections/filters/RolePopover"
import { OrgTypePopover } from "@/components/sections/filters/OrgTypePopover"
import { ComboMulti } from "@/components/sections/filters/ComboMulti"
import { ActiveChips } from "@/components/sections/filters/ActiveChips"
import type { SearchFilters as NEDSearchFilters } from "@/lib/search/types"

// Legacy SearchFilters interface for backward compatibility
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
  
  // New unified filter system
  const { filters: nedFilters, update: nedUpdate, hasActive: nedHasActive } = useSearchFilters()
  
  // Parse URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      
      // Check if this is a welcome visit or returning user
      if (params.get('welcome') === 'true') {
        setShowQuickAccess(true)
        // Remove the welcome param from URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('welcome')
        window.history.replaceState({}, '', newUrl)
      } else if (isSignedIn && !params.get('query') && !params.get('saved')) {
        // Show quick access for returning users without active search
        const hasVisitedBefore = localStorage.getItem('hasVisitedSearch')
        if (hasVisitedBefore) {
          setShowQuickAccess(true)
        }
        localStorage.setItem('hasVisitedSearch', 'true')
      }
      const urlFilters: Partial<SearchFilters> = {}
      
      if (params.get('query')) urlFilters.query = params.get('query')!
      if (params.get('experience')) urlFilters.experience = params.get('experience')!
      if (params.get('location')) urlFilters.location = params.get('location')!
      if (params.get('availability')) urlFilters.availability = params.get('availability')!
      if (params.get('remotePreference')) urlFilters.remotePreference = params.get('remotePreference')!
      if (params.get('role')) urlFilters.role = params.get('role')!.split(',')
      if (params.get('sectors')) urlFilters.sectors = params.get('sectors')!.split(',')
      if (params.get('skills')) urlFilters.skills = params.get('skills')!.split(',')
      if (params.get('boardExperience')) urlFilters.boardExperience = params.get('boardExperience')!.split(',')
      
      if (Object.keys(urlFilters).length > 0) {
        setFilters(prev => ({ ...prev, ...urlFilters }))
        if (urlFilters.query) {
          setSearchQuery(urlFilters.query)
        }
      }
    }
  }, [])
  
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
  const [searchQuery, setSearchQuery] = useState("") // Local state for immediate UI updates
  const [debouncedQuery, setDebouncedQuery] = useState("") // Debounced state for API calls
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [totalResults, setTotalResults] = useState(0)
  const [showQuickAccess, setShowQuickAccess] = useState(false)
  
  // Use real credits from Clerk (only for company users)
  const { credits, loading: creditsLoading } = useCredits()
  
  // Use real shortlist (only for authenticated users)
  const { profiles: shortlistProfiles } = useShortlist()
  const shortlistCount = isSignedIn ? shortlistProfiles.length : 0
  
  // Use saved searches
  const { searches: savedSearches, addSearch } = useSavedSearches()
  const savedSearchCount = savedSearches.length
  
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
    
    // Check if any filters are applied
    const hasFilters = filters.query || filters.role.length > 0 || filters.sectors.length > 0 || 
                      filters.skills.length > 0 || filters.experience || filters.location || 
                      filters.availability || filters.boardExperience.length > 0
    
    if (!hasFilters) {
      toast.error("Please apply some filters before saving the search")
      return
    }
    
    setShowSaveDialog(true)
  }
  
  const handleConfirmSaveSearch = () => {
    if (!searchName.trim()) {
      toast.error("Please enter a name for your saved search")
      return
    }
    
    addSearch(searchName, filters, totalResults)
    toast.success(`Search "${searchName}" saved successfully!`)
    setShowSaveDialog(false)
    setSearchName("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchNavbar 
        credits={credits}
        shortlistCount={shortlistCount}
        savedSearchCount={savedSearchCount}
      />
      
      {/* Unified Search Banner */}
      <UnifiedSearchBanner 
        isSignedIn={isSignedIn}
        isCompanyUser={isCompanyUser}
        credits={credits}
      />
      
      {/* Main Search Section */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Access Panel for returning users */}
        {showQuickAccess && (
          <div className="mb-8">
            <QuickAccessPanel 
              onClose={() => setShowQuickAccess(false)}
              isFirstVisit={new URLSearchParams(window.location.search).get('welcome') === 'true'}
            />
          </div>
        )}
        
        {/* NED Advisor Filter Bar */}
        <div className="mb-6 bg-white rounded-card border border-[var(--border)] p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Role Type - Multi-select checkboxes */}
            <RolePopover
              value={nedFilters.roles}
              onChange={(roles) => nedUpdate({ roles })}
              options={ROLE_TYPES}
            />
            
            {/* Sector - Multi-select combobox with search */}
            <ComboMulti
              label="Sector"
              value={nedFilters.sectors}
              options={SECTORS.map(s => ({ value: s.slug, label: s.label }))}
              onChange={(sectors) => nedUpdate({ sectors })}
              placeholder="Select sectors..."
              searchPlaceholder="Search sectors..."
              emptyText="No sectors found."
            />
            
            {/* Organisation Type - Single-select radio */}
            <OrgTypePopover
              value={nedFilters.orgType || undefined}
              onChange={(orgType) => nedUpdate({ orgType: orgType || null })}
              options={ORG_TYPES}
            />
            
            {/* Specialism - Multi-select combobox */}
            <ComboMulti
              label="Specialism"
              value={nedFilters.specialisms}
              options={SPECIALISMS.map(s => ({ value: s.slug, label: s.label }))}
              onChange={(specialisms) => nedUpdate({ specialisms })}
              placeholder="Select specialisms..."
              searchPlaceholder="Search specialisms..."
              emptyText="No specialisms found."
            />
          </div>
          
          {/* Active Filter Chips */}
          {nedHasActive && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <ActiveChips />
            </div>
          )}
        </div>
        
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
              onTotalCountChange={setTotalResults}
            />
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Save your current search filters to quickly access them later.
              This search found {totalResults} matching profiles.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g., Senior CFOs in London"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmSaveSearch()
                  }
                }}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Current filters:</p>
              <ul className="space-y-1">
                {filters.query && <li>• Search: "{filters.query}"</li>}
                {filters.role.length > 0 && <li>• Roles: {filters.role.join(", ")}</li>}
                {filters.sectors.length > 0 && <li>• Sectors: {filters.sectors.join(", ")}</li>}
                {filters.skills.length > 0 && <li>• Skills: {filters.skills.join(", ")}</li>}
                {filters.experience && <li>• Experience: {filters.experience}</li>}
                {filters.location && <li>• Location: {filters.location}</li>}
                {filters.boardExperience.length > 0 && <li>• Board Experience: {filters.boardExperience.join(", ")}</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSaveSearch}>
              <Bookmark className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Demo User Switcher */}
      <DemoUserSwitcher />
    </div>
  )
}