"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography, buttonStyles, cn, spacing } from "@/lib/typography"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function CTAButtonsSection() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const userRole = user?.publicMetadata?.role as string

  return (
    <section className={`${spacing.section.compact} bg-gradient-to-b from-white to-gray-50`}>
      <div className={spacing.container}>
        {/* CTA Buttons - Mobile optimized with proper touch targets */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center">
          <Button 
            onClick={() => {
              if (isSignedIn && userRole === 'company') {
                router.push('/search')
              } else {
                router.push('/companies')
              }
            }}
            className={cn("bg-gradient-to-r from-[#454547] to-[#3a3a3c] hover:from-[#3a3a3c] hover:to-[#2f2f31] text-white", buttonStyles.size.large, typography.button.large, "rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto min-w-0 sm:min-w-[280px] group")}
          >
            <span>I need an <span className="font-bold">expert</span></span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          <Link href="/signup" className="w-full sm:w-auto">
            <Button className={cn(buttonStyles.primary, buttonStyles.size.large, typography.button.large, "flex items-center justify-center gap-2 w-full min-w-0 sm:min-w-[280px] group")}>
              <span>I'm <span className="font-bold">available</span> to <span className="font-bold">hire</span></span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}