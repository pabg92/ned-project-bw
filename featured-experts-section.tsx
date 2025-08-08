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
      <div className="container max-w-[1140px]">
        <div className="text-center mb-12">
          <h2 className="fluid-h2 font-display text-[var(--ink)]">OUR ELITE NETWORK OF EXPERTS</h2>
          <p className="text-body font-ui text-[var(--muted)] mt-4 max-w-3xl mx-auto">
            Seasoned leaders who have navigated complex challenges and delivered exceptional results
          </p>
        </div>

        {/* Expert Cards - Tighter grid with reduced gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
          {featuredExperts.map((expert) => (
            <div key={expert.id} className="flex flex-col bg-white rounded-card p-5 xl:p-4 border border-[var(--border)] shadow-card h-full">
              {/* Responsive image with clamp for better density */}
              <div className="w-full overflow-hidden rounded-lg bg-[var(--bg-subtle)]" style={{ height: 'clamp(190px, 20vw, 230px)' }}>
                <Image
                  src={expert.image || "/placeholder.svg"}
                  alt={expert.name}
                  width={300}
                  height={375}
                  className="object-cover object-top w-full h-full hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content with premium vertical rhythm */}
              <div className="flex flex-col flex-grow">
                <h3 className="mt-4 font-display text-[22px] tracking-tight text-[var(--ink)] line-clamp-1">{expert.name}</h3>
                <p className="mt-1 text-[var(--muted)] text-[14px] leading-[22px] line-clamp-2 flex-grow">{expert.title}</p>
                
                {/* Premium CTA row */}
                <div className="flex items-center gap-3 mt-4">
                  <button className="h-10 px-4 flex-1 rounded-lg border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] font-medium text-sm transition-colors">
                    Enquire
                  </button>
                  <Link href="#" className="text-[var(--accent)] flex items-center hover:underline text-sm group whitespace-nowrap">
                    View profile
                    <span className="ml-1 group-hover:translate-x-0.5 transition-transform inline-block">→</span>
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
