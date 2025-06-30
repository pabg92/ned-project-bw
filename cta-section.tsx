"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { spacing } from "@/lib/typography"

export default function CTASection() {
  return (
    <section className={`${spacing.section.base} bg-white`}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 lg:px-8 text-center">
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-8">
          <Button className="bg-[#454547] hover:bg-[#3a3a3c] text-white px-6 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 min-w-[280px] min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span>I need an <span className="font-bold">expert</span></span>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <Link href="/signup">
            <Button className="bg-[#7394c7] hover:bg-[#6284b6] text-white px-6 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 min-w-[280px] min-h-[48px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <span>I'm <span className="font-bold">available</span> to <span className="font-bold">hire</span></span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Heading with dotted line */}
        <div className="relative mb-8">
          <h2 className="text-4xl md:text-5xl font-normal mb-4">
            <span className="text-[#7394c7]">Winning Expert Talent</span>{" "}
            <span className="text-gray-800">appointments.</span>
          </h2>

          {/* Dotted line decoration */}
          <div className="flex justify-center mt-6">
            <div className="w-full max-w-2xl border-b-2 border-dotted border-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
