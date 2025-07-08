"use client"

import { useState } from "react"
import { MapPin, Lock, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { getAvatarColor } from "@/lib/utils/profile-transformers"
import { useRouter } from "next/navigation"

interface ProfileCardProps {
  profile: any
  viewMode?: "grid" | "list"
  onUnlock?: (id: string) => void
  onSave?: (id: string) => void
}

export default function ProfileCard({ profile, viewMode = "grid", onUnlock, onSave }: ProfileCardProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const isLocked = profile.isAnonymized && !profile.isUnlocked

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.(profile.id)
  }

  const handleUnlock = () => {
    onUnlock?.(profile.id)
  }

  const handleViewProfile = () => {
    router.push(`/search/${profile.id}`)
  }

  // Format the display name based on lock status
  const displayName = isLocked ? "Executive Profile" : (profile.fullName || profile.name || "Executive Profile")
  const displayTitle = profile.title || "Senior Executive"
  const displayLocation = profile.location || "United Kingdom"
  const displayBio = profile.bio || profile.summary || ""
  const boardCount = profile.boardPositions || 0
  const rating = profile.rating || 4.5

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* Save button */}
      <button
        onClick={handleSave}
        className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
      >
        <Heart 
          className={cn(
            "h-5 w-5 transition-colors",
            isSaved ? "fill-red-500 text-red-500" : "text-gray-400"
          )} 
        />
      </button>

      {/* Blue header background */}
      <div className="h-32 bg-gradient-to-br from-[#6b93ce] to-[#8bb4e8]" />
      
      <CardContent className="pt-0">
        <div className="flex flex-col items-center -mt-16">
          {/* Avatar */}
          <div className="relative">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-semibold border-4 border-white shadow-lg",
              isLocked ? "bg-gray-400" : getAvatarColor(displayName)
            )}>
              {isLocked ? (
                <Lock className="h-10 w-10" />
              ) : (
                profile.initials || displayName.split(' ').map(n => n[0]).join('').toUpperCase()
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Name and title */}
          <h3 className="text-xl font-semibold mt-4 text-center">{displayName}</h3>
          <p className="text-gray-600 text-center">{displayTitle}</p>
          <p className="text-gray-500 text-sm mt-1">{displayLocation}</p>

          {/* Rating and board positions */}
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
            <div className="text-gray-600">
              {boardCount} {boardCount === 1 ? 'Board' : 'Boards'}
            </div>
          </div>

          {/* Bio snippet */}
          {displayBio && (
            <p className="text-gray-600 text-sm mt-4 text-center line-clamp-3 px-4">
              {displayBio}
            </p>
          )}

          {/* Skills/Tags */}
          <div className="flex flex-wrap gap-1 mt-4 justify-center px-4">
            {(profile.skills || profile.coreSkills || []).slice(0, 3).map((skill, index) => (
              <Badge 
                key={typeof skill === 'string' ? index : skill.id} 
                variant="secondary" 
                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                {typeof skill === 'string' ? skill : skill.name}
              </Badge>
            ))}
            {(profile.skills || profile.coreSkills || []).length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{(profile.skills || profile.coreSkills || []).length - 3}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          {isLocked ? (
            <Button 
              onClick={handleUnlock}
              className="mt-6 w-full max-w-xs bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
            >
              <Lock className="h-4 w-4 mr-2" />
              Unlock (1 Credit)
            </Button>
          ) : (
            <div className="mt-6 w-full max-w-xs space-y-2">
              <Button 
                onClick={handleViewProfile}
                className="w-full"
                variant="outline"
              >
                View Profile
              </Button>
              <a 
                href={profile.resumeUrl || '#'} 
                download
                className="block"
                onClick={(e) => {
                  if (!profile.resumeUrl) {
                    e.preventDefault()
                  }
                }}
              >
                <Button 
                  className="w-full"
                  variant="secondary"
                  disabled={!profile.resumeUrl}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CV
                </Button>
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}