"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="pt-16 pb-8 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button className="bg-[#454547] hover:bg-[#3a3a3c] text-white px-8 py-4 rounded-lg text-lg font-medium flex items-center gap-3 min-w-[280px] h-[60px]">
            I need an <span className="font-bold">expert</span>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <Button className="bg-[#7394c7] hover:bg-[#6284b6] text-white px-8 py-4 rounded-lg text-lg font-medium flex items-center gap-3 min-w-[280px] h-[60px]">
            I'm <span className="font-bold">available</span> to hire
            <ChevronRight className="h-5 w-5" />
          </Button>
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
