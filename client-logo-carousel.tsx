"use client"

import Image from "next/image"
import { typography, spacing } from "@/lib/typography"
import Section from "@/components/layout/Section"

// Single row of logos
const clientLogos = [
  {
    id: 1,
    name: "PwC",
    image: "/Company Logos/Logo-pwc.png",
    alt: "PwC logo",
  },
  {
    id: 2,
    name: "McKinsey & Company",
    image: "/Company Logos/McKinsey_&_Company-Logo.wine.svg",
    alt: "McKinsey & Company logo",
  },
  {
    id: 3,
    name: "Sky",
    image: "/Company Logos/Sky_Group_logo_2020.svg.webp",
    alt: "Sky logo",
  },
  {
    id: 4,
    name: "Experian",
    image: "/Company Logos/experian-main-horizontal-brand-logo-blue-pink-square-icon-design-1.png",
    alt: "Experian logo",
  },
  {
    id: 5,
    name: "Hargreaves Lansdown",
    image: "/Company Logos/hargreaves-lansdown.png",
    alt: "Hargreaves Lansdown logo",
  },
  {
    id: 6,
    name: "HSBC UK",
    image: "/Company Logos/hsbc-uk2966.logowik.com.webp",
    alt: "HSBC UK logo",
  },
]

export default function ClientLogoCarousel() {
  return (
    <Section variant="subtle" className="py-16">
      <div className={spacing.container}>
        <h2 className={`${typography.label.base} text-center mb-8`}>TRUSTED BY INDUSTRY LEADERS</h2>

        {/* Single row of logos with horizontal scroll on mobile */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex justify-start lg:justify-center items-center gap-6 lg:gap-12 min-w-fit px-4 lg:px-0">
            {clientLogos.map((logo) => (
              <div key={logo.id} className="flex-shrink-0 w-28 lg:w-32 h-14 lg:h-16 flex items-center justify-center">
                <Image
                  src={logo.image || "/placeholder.svg"}
                  alt={logo.alt}
                  width={128}
                  height={64}
                  className="w-auto h-auto max-h-[32px] lg:max-h-[36px] object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
