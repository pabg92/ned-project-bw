"use client"

import { useState } from "react"
import { X, Zap, TrendingUp, Users, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  credits: number
}

const banners = [
  {
    id: 1,
    type: "low-credits",
    minCredits: 0,
    maxCredits: 5,
    content: {
      icon: Zap,
      title: "Running low on credits?",
      description: "Get 20% off credit packages today only",
      cta: "Buy Credits",
      link: "/pricing",
      color: "bg-gradient-to-r from-red-500 to-orange-500"
    }
  },
  {
    id: 2,
    type: "bulk-unlock",
    minCredits: 6,
    maxCredits: 20,
    content: {
      icon: Users,
      title: "Unlock all search results",
      description: "Save 30% when you unlock 10+ profiles at once",
      cta: "Unlock All",
      link: "#bulk-unlock",
      color: "bg-gradient-to-r from-[#6b93ce] to-[#5a82bd]"
    }
  },
  {
    id: 3,
    type: "subscription",
    minCredits: 0,
    maxCredits: 100,
    content: {
      icon: TrendingUp,
      title: "Upgrade to unlimited access",
      description: "Get unlimited profile views and advanced features",
      cta: "View Plans",
      link: "/pricing",
      color: "bg-gradient-to-r from-purple-600 to-indigo-600"
    }
  },
  {
    id: 4,
    type: "demo",
    minCredits: 0,
    maxCredits: 100,
    content: {
      icon: Calendar,
      title: "Need help finding the right executive?",
      description: "Our experts can help with managed search services",
      cta: "Schedule Demo",
      link: "/contact",
      color: "bg-gradient-to-r from-green-600 to-teal-600"
    }
  }
]

export default function SearchCTABanner({ credits }: Props) {
  const [dismissedBanners, setDismissedBanners] = useState<number[]>([])
  
  // Select appropriate banner based on credits
  const activeBanner = banners.find(
    banner => 
      credits >= banner.minCredits && 
      credits <= banner.maxCredits && 
      !dismissedBanners.includes(banner.id)
  )

  if (!activeBanner) return null

  const handleDismiss = () => {
    setDismissedBanners(prev => [...prev, activeBanner.id])
  }

  const Icon = activeBanner.content.icon

  return (
    <div className={`${activeBanner.content.color} text-white`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icon className="h-6 w-6 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <span className="font-semibold">{activeBanner.content.title}</span>
              <span className="text-sm opacity-90">{activeBanner.content.description}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href={activeBanner.content.link}>
              <Button 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                {activeBanner.content.cta}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}