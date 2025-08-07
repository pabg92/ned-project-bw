"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { typography, buttonStyles, spacing } from "@/lib/typography"

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
    <section className={`${spacing.section.base} bg-white`}>
      <div className="container container-narrow">
        <div className="text-center mb-12">
          <h2 className="fluid-h2 font-display text-[var(--ink)]">OUR ELITE NETWORK OF EXPERTS</h2>
          <p className={`${typography.body.large} mt-4 max-w-3xl mx-auto`}>
            Seasoned leaders who have navigated complex challenges and delivered exceptional results
          </p>
        </div>

        {/* Expert Cards - 3 columns with consistent height */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
          {featuredExperts.map((expert) => (
            <div key={expert.id} className="flex flex-col bg-white border border-[var(--border)] rounded-card p-5 xl:p-4 hover:shadow-lg transition-all duration-200 h-full">
              {/* Responsive image with clamp */}
              <div className="w-full overflow-hidden rounded-lg bg-[var(--bg-subtle)]" style={{ height: 'clamp(200px, 22vw, 250px)' }}>
                <Image
                  src={expert.image || "/placeholder.svg"}
                  alt={expert.name}
                  width={300}
                  height={375}
                  className="object-cover object-top w-full h-full hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content with flex-grow for consistent card height */}
              <div className="flex flex-col flex-grow">
                <h3 className="mt-3 text-[20px] md:text-[22px] font-semibold text-[var(--ink)]">{expert.name}</h3>
                <p className="mt-1 text-[var(--muted)] text-[14px] leading-6 flex-grow">{expert.title}</p>
                
                {/* Action buttons - smaller */}
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" className="h-10 px-4 text-[14px]">
                    Enquire
                  </Button>
                  <Link href="#" className="text-[var(--cta-end)] hover:text-[var(--hover-start)] text-[14px] font-medium flex items-center gap-1">
                    View profile
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
