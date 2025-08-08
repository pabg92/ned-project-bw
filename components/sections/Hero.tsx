"use client"

import { typography } from "@/lib/typography"
import HeroFilterBar from "@/components/sections/HeroFilterBar"
import HeroQuickPresets from "@/components/sections/HeroQuickPresets"
import HeroRightRail from "@/components/sections/HeroRightRail"

export default function Hero() {
  return (
    <section className="pt-24 pb-12 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:items-end">
          {/* Left Column: Hero Dock with Filters */}
          <div className="flex flex-col gap-5">
            {/* Heading and subhead above dock */}
            <div>
              <h1 className="fluid-h1 font-display text-[var(--ink)] mb-4">
                STRATEGIC APPOINTMENTS THAT<br />
                DRIVE PERFORMANCE & VALUE
              </h1>
              
              <p className={`${typography.body.large} max-w-2xl`}>
                Access vetted board-level executives with proven track records in PE-backed and listed companies.
              </p>
            </div>

            {/* Premium Filter Dock */}
            <div className="relative hero-dock p-5">
              <HeroFilterBar />
              <HeroQuickPresets />
            </div>
          </div>

          {/* Right Column: Accolades + Expert Teaser */}
          <aside className="hidden lg:block justify-self-end w-full max-w-[420px]">
            <HeroRightRail />
          </aside>
        </div>
      </div>
    </section>
  )
}