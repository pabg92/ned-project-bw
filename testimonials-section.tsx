"use client"

import Image from "next/image"
import { typography, spacing } from "@/lib/typography"
import Section from "@/components/layout/Section"

const awards = [
  {
    id: 1,
    name: "1000 Companies to Inspire Britain",
    image: "/board-champions-assets/champions-awards/1000-companies.webp",
    alt: "1000 Companies to Inspire Britain Award",
    caption: "Recognized for business excellence and innovation"
  },
  {
    id: 2,
    name: "Accelerate",
    image: "/board-champions-assets/champions-awards/accelerate.png",
    alt: "Accelerate Award",
    caption: "Fast-growth business recognition"
  },
  {
    id: 3,
    name: "Breakthrough 50 Awards",
    image: "/board-champions-assets/champions-awards/breakthrough-50-awards.webp",
    alt: "Breakthrough 50 Awards",
    caption: "Top 50 breakthrough companies"
  },
  {
    id: 4,
    name: "Fast Track",
    image: "/board-champions-assets/champions-awards/fast-track.webp",
    alt: "Fast Track Award",
    caption: "Sunday Times Fast Track 100"
  },
  {
    id: 5,
    name: "Telegraph 1000 Brightest Businesses",
    image: "/board-champions-assets/champions-awards/telegraph-1000-brightest-businesses.webp",
    alt: "Telegraph 1000 Brightest Businesses Award",
    caption: "UK's brightest business recognition"
  },
  {
    id: 6,
    name: "UK Fast Growth Index",
    image: "/board-champions-assets/champions-awards/uk_fast_growth_index_supported_by_ubs.webp",
    alt: "UK Fast Growth Index Supported by UBS",
    caption: "Sustained high-growth achievement"
  },
]

export default function TestimonialsSection() {
  return (
    <Section variant="subtle">
      <div className={spacing.container}>
        {/* Awards Section */}
        <div className="text-center mb-10">
          <h2 className="fluid-h2 font-display text-[var(--ink)]">
            OUR AWARDS AND ACCREDITATIONS
          </h2>
          <p className={`${typography.body.large} mt-4 max-w-3xl mx-auto`}>
            Recognized for excellence in executive search and board appointments
          </p>
        </div>

        {/* Static Grid of Awards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {awards.map((award) => (
            <div 
              key={award.id} 
              className="rounded-card p-6 [background:var(--awards-grad)] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="h-20 flex items-center justify-center mb-4">
                <Image
                  src={award.image}
                  alt={award.alt}
                  width={180}
                  height={80}
                  className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <h3 className="text-sm font-semibold text-[var(--ink)] text-center mb-2">
                {award.name}
              </h3>
              <p className="text-xs text-[var(--muted)] text-center">
                {award.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}