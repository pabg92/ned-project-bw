"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import SearchNavbar from "@/components/search/search-navbar"
import Footer from "@/footer"
import { useSavedSearches } from "@/hooks/use-saved-searches"
import { useShortlist } from "@/hooks/use-shortlist"
import { useCredits } from "@/hooks/use-credits"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Trash2, ExternalLink, Calendar, Filter, 
  Users, MapPin, Briefcase, Target, Clock, ChevronRight 
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SavedSearchesPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const { searches, removeSearch } = useSavedSearches()
  const { profiles: shortlistProfiles } = useShortlist()
  const { credits } = useCredits()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const shortlistCount = isSignedIn ? shortlistProfiles.length : 0
  const savedSearchCount = searches.length
  
  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in?redirect_url=/search/saved')
    return null
  }
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b93ce] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading saved searches...</p>
        </div>
      </div>
    )
  }
  
  const handleApplySearch = (searchId: string) => {
    const search = searches.find(s => s.id === searchId)
    if (!search) return
    
    // Convert filters to URL params
    const params = new URLSearchParams()
    if (search.filters.query) params.append('query', search.filters.query)
    if (search.filters.experience) params.append('experience', search.filters.experience)
    if (search.filters.location) params.append('location', search.filters.location)
    if (search.filters.availability) params.append('availability', search.filters.availability)
    if (search.filters.remotePreference) params.append('remotePreference', search.filters.remotePreference)
    if (search.filters.role.length > 0) params.append('role', search.filters.role.join(','))
    if (search.filters.sectors.length > 0) params.append('sectors', search.filters.sectors.join(','))
    if (search.filters.skills.length > 0) params.append('skills', search.filters.skills.join(','))
    if (search.filters.boardExperience.length > 0) params.append('boardExperience', search.filters.boardExperience.join(','))
    
    // Navigate to search page with filters
    router.push(`/search?${params.toString()}`)
  }
  
  const handleDelete = (id: string) => {
    removeSearch(id)
    toast.success("Saved search deleted")
    setDeleteId(null)
  }
  
  const getFilterSummary = (search: typeof searches[0]) => {
    const parts: string[] = []
    
    if (search.filters.query) {
      parts.push(`"${search.filters.query}"`)
    }
    if (search.filters.role.length > 0) {
      parts.push(`${search.filters.role.length} role${search.filters.role.length > 1 ? 's' : ''}`)
    }
    if (search.filters.sectors.length > 0) {
      parts.push(`${search.filters.sectors.length} sector${search.filters.sectors.length > 1 ? 's' : ''}`)
    }
    if (search.filters.skills.length > 0) {
      parts.push(`${search.filters.skills.length} skill${search.filters.skills.length > 1 ? 's' : ''}`)
    }
    if (search.filters.experience) {
      parts.push(`${search.filters.experience} experience`)
    }
    if (search.filters.location) {
      parts.push(search.filters.location)
    }
    
    return parts.join(", ") || "No filters applied"
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SearchNavbar 
        credits={credits}
        shortlistCount={shortlistCount}
        savedSearchCount={savedSearchCount}
      />
      
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Searches</h1>
          <p className="text-gray-600">
            Quickly access your saved search criteria and stay updated on new matches.
          </p>
        </div>
        
        {/* Saved Searches Grid */}
        {searches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches yet</h3>
              <p className="text-gray-600 mb-6">
                Save your search criteria to quickly find matching profiles later.
              </p>
              <Button 
                onClick={() => router.push('/search')}
                className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
              >
                Start Searching
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searches.map((search) => (
              <Card 
                key={search.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleApplySearch(search.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{search.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Saved {format(new Date(search.createdAt), 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(search.id)
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Filter Summary */}
                    <div className="text-sm text-gray-600">
                      <Filter className="h-3 w-3 inline mr-1" />
                      {getFilterSummary(search)}
                    </div>
                    
                    {/* Result Count */}
                    {search.resultCount !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {search.resultCount} profiles found
                        </span>
                      </div>
                    )}
                    
                    {/* Filter Tags */}
                    <div className="flex flex-wrap gap-2">
                      {search.filters.query && (
                        <Badge variant="secondary" className="text-xs">
                          <Search className="h-3 w-3 mr-1" />
                          {search.filters.query}
                        </Badge>
                      )}
                      {search.filters.location && (
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {search.filters.location}
                        </Badge>
                      )}
                      {search.filters.experience && (
                        <Badge variant="secondary" className="text-xs">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {search.filters.experience}
                        </Badge>
                      )}
                      {search.filters.availability && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {search.filters.availability}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Apply Button */}
                    <div className="pt-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplySearch(search.id)
                        }}
                      >
                        Apply Search
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Search</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved search? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}