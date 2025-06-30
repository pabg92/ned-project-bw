"use client"

import { useState } from "react"
import { Lock, Unlock, MapPin, Briefcase, Calendar, Star, Download, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export interface Profile {
  id: string
  name: string
  title: string
  location: string
  experience: string
  sectors: string[]
  skills: string[]
  bio: string
  imageUrl?: string
  isUnlocked: boolean
  boardPositions: number
  availability: string
  rating: number
  profileViews: number
}

interface ProfileCardProps {
  profile: Profile
  viewMode: "grid" | "list"
  onUnlock: (id: string) => void
  onSave: (id: string) => void
}

export default function ProfileCard({ profile, viewMode, onUnlock, onSave }: ProfileCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave(profile.id)
  }

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 p-6">
        <div className="flex items-start gap-6">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            {profile.isUnlocked && profile.imageUrl ? (
              <Image
                src={profile.imageUrl}
                alt={profile.name}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-gray-500" />
              </div>
            )}
            {profile.isUnlocked && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <Unlock className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.isUnlocked ? profile.name : "Executive Profile"}
                </h3>
                <p className="text-gray-600 font-medium">{profile.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {profile.experience} experience
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {profile.availability}
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className={cn(
                    "text-gray-500 hover:text-red-500",
                    isSaved && "text-red-500"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                </Button>
                {!profile.isUnlocked && (
                  <Button
                    onClick={() => onUnlock(profile.id)}
                    className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock Profile (1 Credit)
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-600 mt-3 line-clamp-2">{profile.bio}</p>

            {/* Skills & Sectors */}
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                {profile.sectors.slice(0, 3).map((sector) => (
                  <Badge key={sector} variant="secondary" className="bg-gray-100 text-gray-700">
                    {sector}
                  </Badge>
                ))}
                {profile.sectors.length > 3 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    +{profile.sectors.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill} className="bg-[#e8f0fe] text-[#6b93ce] border-0">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 4 && (
                  <Badge className="bg-[#e8f0fe] text-[#6b93ce] border-0">
                    +{profile.skills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{profile.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">
                {profile.boardPositions} Board Positions
              </span>
              <span className="text-gray-500 flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {profile.profileViews} views
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Header with Image */}
      <div className="relative h-32 bg-gradient-to-br from-[#6b93ce] to-[#5a82bd]">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={cn(
              "text-white hover:bg-white/20",
              isSaved && "text-red-400"
            )}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
          {profile.isUnlocked && profile.imageUrl ? (
            <Image
              src={profile.imageUrl}
              alt={profile.name}
              width={80}
              height={80}
              className="rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full border-4 border-white flex items-center justify-center">
              <Lock className="h-8 w-8 text-gray-500" />
            </div>
          )}
          {profile.isUnlocked && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
              <Unlock className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 px-6 pb-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {profile.isUnlocked ? profile.name : "Executive Profile"}
          </h3>
          <p className="text-gray-600 font-medium">{profile.title}</p>
          <p className="text-sm text-gray-500 mt-1">{profile.location}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="font-medium">{profile.rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500">
            {profile.boardPositions} Boards
          </span>
        </div>

        {/* Bio */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{profile.bio}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {profile.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} className="bg-[#e8f0fe] text-[#6b93ce] border-0 text-xs">
              {skill}
            </Badge>
          ))}
          {profile.skills.length > 3 && (
            <Badge className="bg-[#e8f0fe] text-[#6b93ce] border-0 text-xs">
              +{profile.skills.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        {profile.isUnlocked ? (
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/search/${profile.id}`}>
              <Button variant="outline" className="w-full" size="sm">
                View Profile
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              CV
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => onUnlock(profile.id)}
            className="w-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
          >
            <Unlock className="h-4 w-4 mr-2" />
            Unlock (1 Credit)
          </Button>
        )}
      </div>
    </div>
  )
}