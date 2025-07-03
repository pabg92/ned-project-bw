"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, Download, Trash2, Edit2, Save, X, 
  Search, Filter, SortAsc, Users, FileText, Mail,
  Calendar, CheckSquare, Square, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useShortlist } from "@/hooks/use-shortlist"
import SearchNavbar from "@/components/search/search-navbar"
import { cn } from "@/lib/utils"

interface ProfileNote {
  id: string
  notes: string
  isEditing: boolean
}

export default function ShortlistPage() {
  const router = useRouter()
  const { profiles, removeProfile, updateNotes, clearShortlist } = useShortlist()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [profileNotes, setProfileNotes] = useState<ProfileNote[]>(
    profiles.map(p => ({ id: p.id, notes: p.notes || "", isEditing: false }))
  )
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Filter and sort profiles
  const filteredProfiles = profiles
    .filter(profile =>
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        case "oldest":
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const handleSelectProfile = (id: string) => {
    setSelectedProfiles(prev =>
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedProfiles.length === filteredProfiles.length) {
      setSelectedProfiles([])
    } else {
      setSelectedProfiles(filteredProfiles.map(p => p.id))
    }
  }

  const handleRemoveSelected = () => {
    selectedProfiles.forEach(id => removeProfile(id))
    setSelectedProfiles([])
  }

  const handleEditNote = (id: string) => {
    setProfileNotes(prev =>
      prev.map(p => ({ ...p, isEditing: p.id === id ? true : false }))
    )
  }

  const handleSaveNote = (id: string) => {
    const note = profileNotes.find(p => p.id === id)
    if (note) {
      updateNotes(id, note.notes)
      setProfileNotes(prev =>
        prev.map(p => ({ ...p, isEditing: false }))
      )
    }
  }

  const handleCancelEdit = (id: string) => {
    const profile = profiles.find(p => p.id === id)
    setProfileNotes(prev =>
      prev.map(p => 
        p.id === id 
          ? { ...p, notes: profile?.notes || "", isEditing: false }
          : p
      )
    )
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    // Simulate export
    setTimeout(() => {
      const data = selectedProfiles.length > 0
        ? filteredProfiles.filter(p => selectedProfiles.includes(p.id))
        : filteredProfiles

      if (format === 'csv') {
        const csv = [
          ['Name', 'Title', 'Added Date', 'Notes'],
          ...data.map(p => [
            p.name,
            p.title,
            new Date(p.addedAt).toLocaleDateString(),
            p.notes || ''
          ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'shortlist.csv'
        a.click()
      }

      setIsExporting(false)
    }, 1000)
  }

  return (
    <>
      <SearchNavbar 
        credits={10}
        shortlistCount={profiles.length}
        savedSearchCount={0}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/search')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Shortlist</h1>
              <p className="text-gray-600 mt-1">
                {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} saved
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(true)}
                disabled={profiles.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>

              <div className="relative">
                <Button
                  onClick={() => handleExport('csv')}
                  disabled={filteredProfiles.length === 0 || isExporting}
                  className="bg-[#6b93ce] hover:bg-[#5a82bd]"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search shortlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            {filteredProfiles.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedProfiles.length === filteredProfiles.length ? (
                  <CheckSquare className="h-4 w-4 mr-2" />
                ) : (
                  <Square className="h-4 w-4 mr-2" />
                )}
                Select All
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProfiles.length > 0 && (
          <div className="bg-[#6b93ce] text-white rounded-lg p-4 mb-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedProfiles.length} profiles selected
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  className="text-white hover:bg-white/20"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="text-white hover:bg-white/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Profile List */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching profiles' : 'No profiles in shortlist'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start adding executives to your shortlist from the search results'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push('/search')}>
                Browse Executives
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProfiles.map((profile) => {
              const note = profileNotes.find(n => n.id === profile.id)
              return (
                <div
                  key={profile.id}
                  className={cn(
                    "bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all",
                    selectedProfiles.includes(profile.id) && "ring-2 ring-[#6b93ce]"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleSelectProfile(profile.id)}
                      className="mt-1"
                    >
                      {selectedProfiles.includes(profile.id) ? (
                        <CheckSquare className="h-5 w-5 text-[#6b93ce]" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {profile.name}
                          </h3>
                          <p className="text-gray-600">{profile.title}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Added {new Date(profile.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProfile(profile.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Notes Section */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Notes
                          </label>
                          {note?.isEditing ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveNote(profile.id)}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelEdit(profile.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditNote(profile.id)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>

                        {note?.isEditing ? (
                          <Textarea
                            value={note.notes}
                            onChange={(e) => setProfileNotes(prev =>
                              prev.map(p =>
                                p.id === profile.id
                                  ? { ...p, notes: e.target.value }
                                  : p
                              )
                            )}
                            placeholder="Add notes about this executive..."
                            className="min-h-[80px]"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 min-h-[40px]">
                            {profile.notes || 
                              <span className="text-gray-400 italic">
                                No notes added yet
                              </span>
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Clear All Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear entire shortlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {profiles.length} profiles from your shortlist. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearShortlist()
                setSelectedProfiles([])
                setShowClearDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}