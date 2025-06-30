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
        {/* Left Column - Blue Background - 50% width */}
        <div className="bg-gradient-to-br from-[#9eb4d8] to-[#8ea4c8] text-white p-8 md:p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="max-w-xl">
            <p className={`${typography.label.large} mb-3 relative z-10 text-white/80 uppercase tracking-wide`}>
              Get a <span className="font-bold">FREE</span> consultation now
            </p>
            <h2 className={`${typography.h2.base} mb-4 relative z-10`}>
              The Board of Champions is the only place you ever need look for your next EXPERT appointment.
            </h2>

            <ul className={`${typography.body.base} mb-6 relative z-10 text-white/90 space-y-2`}>
              <li className="flex items-start">
                <span className="text-[#ffd700] mr-2">✓</span>
                <span>CMO's, CFO's, COO's – Industry leading experts</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ffd700] mr-2">✓</span>
                <span>Significant career successes & proven track records</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#ffd700] mr-2">✓</span>
                <span className="font-semibold">CV's to be enviable of</span>
              </li>
            </ul>

            <div className="flex gap-4">
              <Button className={cn(buttonStyles.secondary, buttonStyles.size.large, typography.button.large, "inline-flex items-center gap-2 group relative z-10 shadow-lg hover:shadow-xl")}>
                SEARCH NOW
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button className={cn("bg-white text-[#9eb4d8] hover:bg-gray-100", buttonStyles.size.large, typography.button.large, "inline-flex items-center gap-2 group relative z-10 shadow-lg hover:shadow-xl font-bold")}>
                JOIN AS TALENT
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Purple Background - 50% width */}
        <div className="bg-gradient-to-br from-[#9595d5] to-[#8585c5] text-white p-8 md:p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <h2 className={`${typography.h2.base} mb-6 text-center relative z-10`}>THIS MONTH'S FEATURED EXPERTS</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 relative z-10">
            {featuredExperts.map((expert) => (
              <div key={expert.id} className="flex flex-col items-center group bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                <div className="mb-3 w-28 h-36 md:w-32 md:h-40 lg:w-36 lg:h-44 overflow-hidden rounded-lg shadow-lg bg-white group-hover:shadow-xl transition-all duration-300 ring-2 ring-white/30">
                  <Image
                    src={expert.image || "/placeholder.svg"}
                    alt={expert.name}
                    width={144}
                    height={176}
                    quality={95}
                    className="object-cover object-top w-full h-full transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>

                <h3 className={`${typography.h3.compact} mb-2 text-center font-bold`}>{expert.name}</h3>
                <p className={`${typography.body.small} mb-3 text-center px-2 opacity-90 line-clamp-2`}>{expert.title}</p>

                <Button className={cn(buttonStyles.secondary, buttonStyles.size.base, typography.button.base, "inline-flex items-center gap-2 min-w-[100px] group/btn mt-auto")}>
                  ENQUIRE
                  <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
