"use client"

import { useState, useEffect } from "react"
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

// Mock data - will be replaced with Supabase data
const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "Sarah Thompson",
    title: "Former CFO - FTSE 100",
    location: "London",
    experience: "25+ years",
    sectors: ["Financial Services", "Technology", "Healthcare"],
    skills: ["Financial Strategy", "M&A", "Risk Management", "Digital Transformation", "ESG"],
    bio: "Experienced CFO with 25+ years in financial leadership roles across FTSE 100 companies. Specialized in digital transformation and sustainable finance strategies.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    isUnlocked: false,
    boardPositions: 3,
    availability: "Immediate",
    rating: 4.8,
    profileViews: 234
  },
  {
    id: "2",
    name: "Executive Profile",
    title: "CEO - Technology Sector",
    location: "Manchester",
    experience: "20+ years",
    sectors: ["Technology", "SaaS", "Fintech"],
    skills: ["Strategy", "Growth", "Leadership", "Innovation", "Digital"],
    bio: "Technology sector CEO with proven track record of scaling businesses from startup to IPO. Expert in digital transformation and innovation strategy.",
    isUnlocked: false,
    boardPositions: 2,
    availability: "3 months",
    rating: 4.9,
    profileViews: 189
  },
  {
    id: "3",
    name: "Dr. Michael Chen",
    title: "Independent Director - Healthcare",
    location: "Cambridge",
    experience: "15+ years",
    sectors: ["Healthcare", "Biotech", "Pharmaceuticals"],
    skills: ["Clinical Governance", "R&D Strategy", "Regulatory", "Innovation"],
    bio: "Healthcare industry veteran with deep expertise in clinical governance and pharmaceutical R&D. Board experience includes listed biotechs and NHS trusts.",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    isUnlocked: true,
    boardPositions: 4,
    availability: "1 month",
    rating: 4.7,
    profileViews: 156
  },
  {
    id: "4",
    name: "Executive Profile",
    title: "CMO - Retail & Consumer",
    location: "Birmingham",
    experience: "18+ years",
    sectors: ["Retail", "E-commerce", "Consumer Goods"],
    skills: ["Brand Strategy", "Digital Marketing", "Customer Experience", "Data Analytics"],
    bio: "Award-winning CMO with extensive experience in retail transformation and omnichannel strategy. Led marketing for several major UK retail brands.",
    isUnlocked: false,
    boardPositions: 1,
    availability: "Immediate",
    rating: 4.6,
    profileViews: 145
  },
  {
    id: "5",
    name: "Executive Profile",
    title: "CHRO - Financial Services",
    location: "Edinburgh",
    experience: "22+ years",
    sectors: ["Financial Services", "Insurance", "Banking"],
    skills: ["HR Strategy", "Culture Change", "D&I", "Talent Management", "Organizational Design"],
    bio: "Transformational HR leader with expertise in culture change and diversity initiatives. Proven track record in highly regulated financial services environments.",
    isUnlocked: false,
    boardPositions: 2,
    availability: "6 months",
    rating: 4.8,
    profileViews: 178
  },
  {
    id: "6",
    name: "Executive Profile",
    title: "COO - Manufacturing",
    location: "Leeds",
    experience: "30+ years",
    sectors: ["Manufacturing", "Supply Chain", "Automotive"],
    skills: ["Operations", "Lean Six Sigma", "Supply Chain", "Sustainability", "Cost Optimization"],
    bio: "Operations excellence expert with three decades of experience in global manufacturing. Specialist in sustainable operations and supply chain resilience.",
    isUnlocked: false,
    boardPositions: 5,
    availability: "3 months",
    rating: 4.9,
    profileViews: 267
  }
]

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
  const [profiles, setProfiles] = useState(mockProfiles)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const itemsPerPage = 12
  
  const { addProfile, removeProfile, isInShortlist } = useShortlist()

  // Track scroll position for "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleUnlock = (id: string) => {
    // In real app, this would deduct a credit and update the backend
    setProfiles(prev =>
      prev.map(p => p.id === id ? { ...p, isUnlocked: true } : p)
    )
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

  // Filter profiles based on search criteria
  const filteredProfiles = profiles.filter(profile => {
    // In real app, this would be done server-side
    if (filters.query) {
      const query = filters.query.toLowerCase()
      const searchableText = [
        profile.name,
        profile.title,
        ...profile.sectors,
        ...profile.skills,
        profile.bio
      ].join(" ").toLowerCase()
      
      if (!searchableText.includes(query)) return false
    }
    
    // Add more filter logic here
    return true
  })

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedProfiles = filteredProfiles.slice(startIndex, startIndex + itemsPerPage)

  const lockedProfiles = filteredProfiles.filter(p => !p.isUnlocked)
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
              <span className="font-semibold text-gray-900">{filteredProfiles.length}</span> executives found
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