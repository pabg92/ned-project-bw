"use client"

import { typography } from "@/lib/typography"
import HeroFilterBar from "@/components/sections/HeroFilterBar"
import HeroRightRail from "@/components/sections/HeroRightRail"

export default function Hero() {
  return (
    <section className="pt-24 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-end">
          {/* Left Column: Value Proposition & Filters */}
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="fluid-h1 font-display text-[var(--ink)] mb-4">
                STRATEGIC APPOINTMENTS THAT<br />
                DRIVE PERFORMANCE & VALUE
              </h1>
              
              <p className={`${typography.body.large} max-w-2xl`}>
                Access our exclusive network of board-level executives, vetted for their real-world experience in non-executive and advisory roles.
              </p>
            </div>

            {/* Advanced Filter Bar */}
            <HeroFilterBar />
          </div>

          {/* Right Column: Accolades + Expert Teaser - Hidden on mobile, baseline aligned on desktop */}
          <aside className="hidden lg:block justify-self-end w-full max-w-[420px]">
            <HeroRightRail />
          </aside>
        </div>
      </div>
    </section>
  )
}