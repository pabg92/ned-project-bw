"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Grid, List, SlidersHorizontal, ChevronDown, CheckSquare, 
  Square, Unlock, Download, Heart, ArrowUp, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import ProfileCard, { Profile } from "./profile-card"
import { SearchFilters } from "@/app/search/page"
import { useShortlist } from "@/hooks/use-shortlist"
import { cn } from "@/lib/utils"

// NO MOCK DATA - Only show real database profiles

interface Props {
  filters: SearchFilters
  viewMode: "grid" | "list"
  sortBy: string
  onViewModeChange: (mode: "grid" | "list") => void
  onSortChange: (sort: string) => void
  onToggleFilters: () => void
  showFilters: boolean
}

export default function SearchResults({
  filters,
  viewMode,
  sortBy,
  onViewModeChange,
  onSortChange,
  onToggleFilters,
  showFilters
}: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12
  const router = useRouter()
  
  const { addProfile, removeProfile, isInShortlist } = useShortlist()

  // Track scroll position for "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch profiles from API
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sortBy: sortBy,
        })

        // Add filters to params
        if (filters.query) params.append('query', filters.query)
        if (filters.experience) params.append('experience', filters.experience)
        if (filters.location) params.append('location', filters.location)
        if (filters.availability) params.append('availability', filters.availability)
        if (filters.remotePreference) params.append('remotePreference', filters.remotePreference)
        if (filters.salaryMin) params.append('salaryMin', filters.salaryMin.toString())
        if (filters.salaryMax) params.append('salaryMax', filters.salaryMax.toString())
        if (filters.sectors && filters.sectors.length > 0) {
          params.append('sectors', filters.sectors.join(','))
        }
        if (filters.skills && filters.skills.length > 0) {
          params.append('skills', filters.skills.join(','))
        }

        // Use the main search endpoint that filters for active and completed profiles
        const response = await fetch(`/api/search/candidates?${params}`)
        const data = await response.json()

        if (data.success && data.data.profiles.length > 0) {
          setProfiles(data.data.profiles)
          setTotalCount(data.data.pagination.total)
          setTotalPages(data.data.pagination.totalPages)
        } else {
          console.error('No profiles found or API error:', data.error || 'No profiles')
          // NO MOCK DATA - Show empty state
          setProfiles([])
          setTotalCount(0)
          setTotalPages(0)
        }
      } catch (error) {
        console.error('Error fetching profiles:', error)
        // NO MOCK DATA - Show empty state
        setProfiles([])
        setTotalCount(0)
        setTotalPages(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [filters, currentPage, sortBy])

  const handleUnlock = (id: string) => {
    // Navigate to the profile page when unlock is clicked
    router.push(`/search/${id}`)
  }

  const handleBulkUnlock = () => {
    if (selectedProfiles.length === 0) return
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setProfiles(prev =>
        prev.map(p => selectedProfiles.includes(p.id) ? { ...p, isUnlocked: true } : p)
      )
      setSelectedProfiles([])
      setIsLoading(false)
    }, 1000)
  }

  const handleSave = (id: string) => {
    const profile = profiles.find(p => p.id === id)
    if (!profile) return

    if (isInShortlist(id)) {
      removeProfile(id)
    } else {
      addProfile({
        id: profile.id,
        name: profile.name,
        title: profile.title
      })
    }
  }

  const handleSelectProfile = (id: string) => {
    setSelectedProfiles(prev =>
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const visibleProfileIds = displayedProfiles.map(p => p.id)
    if (selectedProfiles.length === visibleProfileIds.length) {
      setSelectedProfiles([])
    } else {
      setSelectedProfiles(visibleProfileIds)
    }
  }

  // No need to filter client-side as API handles it
  const displayedProfiles = profiles

  const lockedProfiles = profiles.filter(p => !p.isUnlocked)
  const selectedLockedCount = selectedProfiles.filter(id => 
    lockedProfiles.some(p => p.id === id)
  ).length
  
  return (
    <div>
      {/* Bulk Actions Bar */}
      {selectedProfiles.length > 0 && (
        <div className="bg-[#6b93ce] text-white rounded-lg p-4 mb-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProfiles([])}
                className="text-white hover:bg-white/20"
              >
                <Square className="h-4 w-4 mr-2" />
                {selectedProfiles.length} selected
              </Button>
              
              <div className="h-6 w-px bg-white/30" />
              
              <Button
                onClick={handleBulkUnlock}
                disabled={selectedLockedCount === 0 || isLoading}
                className="bg-white text-[#6b93ce] hover:bg-gray-100"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Unlock className="h-4 w-4 mr-2" />
                )}
                Unlock {selectedLockedCount} Profiles ({selectedLockedCount} Credits)
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Heart className="h-4 w-4 mr-2" />
                Add to Shortlist
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <Badge className="bg-white/20 text-white">
              Save {Math.round(selectedLockedCount * 0.2)} credits with bulk unlock
            </Badge>
          </div>
        </div>
      )}
      
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {viewMode === "grid" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-gray-600 hover:text-gray-900"
              >
                {selectedProfiles.length === displayedProfiles.length ? (
                  <CheckSquare className="h-4 w-4 mr-2" />
                ) : (
                  <Square className="h-4 w-4 mr-2" />
                )}
                Select All
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{totalCount}</span> executives found
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className={viewMode === "grid" ? "bg-white shadow-sm" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={viewMode === "list" ? "bg-white shadow-sm" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6b93ce]" />
        </div>
      ) : displayedProfiles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg mb-2">No approved profiles available</p>
          <p className="text-gray-500">Please check back later or contact admin for profile approval</p>
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {displayedProfiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              viewMode={viewMode}
              onUnlock={handleUnlock}
              onSave={handleSave}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page 
                        ? "bg-[#6b93ce] hover:bg-[#5a82bd]" 
                        : ""
                      }
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}