"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography, buttonStyles, cn } from "@/lib/typography"

const featuredExperts = [
  {
    id: 1,
    name: "Alex Ely",
    title: "CFO: ICI, IBM, Amazon, EY, Dains, 3M",
    image: "/board-champions-assets/alex-ely_orig.jpg",
  },
  {
    id: 2,
    name: "Emma Tolhurst",
    title: "People & HR: Accenture, Champions (UK) plc, KPMG",
    image: "/board-champions-assets/Emma Tolhurst.png",
  },
  {
    id: 3,
    name: "Matthew Hayes",
    title: "CMO: Red Umbrella, Protocol, Apari",
    image: "/board-champions-assets/MatthewHayes01 2.jpg",
  },
]

export default function FeaturedExpertsSection() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left Column - Blue Background */}
        <div className="bg-gradient-to-br from-[#7394c7] to-[#6284b6] text-white p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="max-w-xl">
            <h2 className={`${typography.h3.base} mb-2 relative z-10`}>
              The Board of Champions is the only place you ever<br className="hidden lg:block" /> need look for your next EXPERT appointment.
            </h2>

            <p className={`${typography.body.base} mb-4 relative z-10 text-white/90`}>
              CMO's, CFO's, COO's – we have them all. Industry leading experts with significant career successes.{" "}
              <span className="font-semibold">CV's to be enviable of.</span>
            </p>

            <Button className={cn(buttonStyles.secondary, buttonStyles.size.small, typography.button.small, "inline-flex items-center gap-2 group relative z-10")}>
              SEARCH NOW
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>

        {/* Right Column - Purple Background */}
        <div className="bg-gradient-to-br from-[#a0a0dc] to-[#9090cc] text-white p-6 md:p-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <h2 className={`${typography.h3.base} mb-4 text-center relative z-10`}>THIS MONTH'S FEATURED EXPERTS</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 relative z-10">
            {featuredExperts.map((expert) => (
              <div key={expert.id} className="flex flex-col items-center group">
                <div className="mb-2 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 overflow-hidden rounded-lg shadow-sm bg-white group-hover:shadow-md transition-all duration-300">
                  <Image
                    src={expert.image || "/placeholder.svg"}
                    alt={expert.name}
                    width={128}
                    height={128}
                    quality={95}
                    className="object-cover object-top w-full h-full transition-transform duration-500 group-hover:scale-110"
                    priority
                  />
                </div>

                <h3 className={`${typography.h3.compact} mb-1 text-center`}>{expert.name}</h3>
                <p className={`${typography.body.small} mb-2 text-center px-1 opacity-90`}>{expert.title}</p>

                <Button className={cn(buttonStyles.secondary, buttonStyles.size.small, typography.button.small, "inline-flex items-center gap-1 min-w-[80px] group/btn")}>
                  ENQUIRE
                  <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
