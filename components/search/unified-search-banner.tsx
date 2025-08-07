"use client"

import { useState, useEffect } from "react"
import { X, Info, Zap, CreditCard, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Props {
  isSignedIn: boolean
  isCompanyUser: boolean
  credits: number
}

export default function UnifiedSearchBanner({ isSignedIn, isCompanyUser, credits }: Props) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)

  // Load dismissed state from localStorage
  useEffect(() => {
    const key = getBannerKey()
    const dismissed = localStorage.getItem(`banner-dismissed-${key}`)
    if (dismissed === 'true') {
      setIsDismissed(true)
      setDismissedKey(key)
    }
  }, [isSignedIn, isCompanyUser, credits])

  // Determine which banner to show based on user state
  const getBannerKey = () => {
    if (!isSignedIn) return 'guest'
    if (!isCompanyUser) return 'upgrade'
    if (credits === 0) return 'no-credits'
    if (credits <= 5) return 'low-credits'
    return 'none'
  }

  const handleDismiss = () => {
    const key = getBannerKey()
    localStorage.setItem(`banner-dismissed-${key}`, 'true')
    setIsDismissed(true)
    setDismissedKey(key)
  }

  // Reset dismissed state if user state changes
  const currentKey = getBannerKey()
  if (dismissedKey && dismissedKey !== currentKey) {
    setIsDismissed(false)
    setDismissedKey(null)
  }

  if (isDismissed || currentKey === 'none') return null

  // Guest user banner
  if (!isSignedIn) {
    return (
      <div className="bg-gradient-to-r from-[#7394c7] to-[#8595d5] text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">You're browsing as a guest.</span>
                {' '}Sign up to unlock profiles and save searches.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sign-in?redirect_url=/search">
                <Button size="sm" variant="secondary" className="bg-white text-[#7394c7] hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up?role=company">
                <Button size="sm" className="bg-white/20 text-white border border-white/30 hover:bg-white/30">
                  Sign Up
                </Button>
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors ml-2"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Non-company user banner
  if (!isCompanyUser) {
    return (
      <div className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Upgrade to a company account</span>
                {' '}to unlock full profiles and contact candidates.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/companies">
                <Button size="sm" className="bg-white/20 text-white border border-white/30 hover:bg-white/30">
                  Learn More
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Company user with no credits
  if (credits === 0) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">You're out of credits!</span>
                {' '}Purchase more to continue unlocking profiles.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/credits">
                <Button size="sm" className="bg-white text-orange-600 hover:bg-gray-100">
                  Buy Credits
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Company user with low credits
  if (credits <= 5) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Running low on credits?</span>
                {' '}Get 20% off credit packages today only
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/credits">
                <Button size="sm" className="bg-white/20 text-white border border-white/30 hover:bg-white/30">
                  Buy Credits
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}