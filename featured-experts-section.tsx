"use client"

import ExpertCard from "@/components/cards/ExpertCard"
import { spacing } from "@/lib/typography"

const featuredExperts = [
  {
    id: 1,
    name: "Alex Ely",
    title: "CFO · ICI, IBM, Amazon, EY",
    image: "/board-champions-assets/alex-ely_orig.jpg",
  },
  {
    id: 2,
    name: "Emma Tolhurst",
    title: "People & HR · Accenture, KPMG",
    image: "/board-champions-assets/Emma Tolhurst.png",
  },
  {
    id: 3,
    name: "Matthew Hayes",
    title: "CMO · Red Umbrella, Protocol",
    image: "/board-champions-assets/MatthewHayes01 2.jpg",
  },
]

export default function FeaturedExpertsSection() {
  return (
    <section className={`${spacing.section.base} bg-white`}>
      <div className="container max-w-[1140px]">
        <div className="text-center mb-12">
          <h2 className="fluid-h2 font-display text-[var(--ink)]">OUR ELITE NETWORK OF EXPERTS</h2>
          <p className="text-body font-ui text-[var(--muted)] mt-4 max-w-3xl mx-auto">
            Seasoned leaders who have navigated complex challenges and delivered exceptional results
          </p>
        </div>

        {/* Expert Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
          {featuredExperts.map((expert) => (
            <ExpertCard
              key={expert.id}
              {...expert}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
