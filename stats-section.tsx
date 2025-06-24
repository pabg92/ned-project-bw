"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StatsSection() {
  return (
    <section className="py-8 bg-gradient-to-r from-[#8db3e5] to-[#7ca3d5] shadow-md">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[80px] gap-8">
          <h2 className="text-lg md:text-2xl font-akrive-grotesk font-bold text-white">Get a FREE consultation now</h2>

          <Button className="bg-white hover:bg-gray-50 text-gray-800 px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 group">
            I'M IN!
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  )
}
