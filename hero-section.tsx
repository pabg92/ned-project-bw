"use client"

import { typography } from "@/lib/typography"
import HeroFilterBar from "@/components/sections/HeroFilterBar"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="pt-24 pb-20 bg-white">
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
            
            {/* Left Column: Value Proposition & Filters */}
            <div className="text-left">
              <h1 className="fluid-h1 font-display text-[var(--ink)] mb-4">
                STRATEGIC APPOINTMENTS THAT<br />
                DRIVE PERFORMANCE & VALUE
              </h1>
              
              <p className={`${typography.body.large} mb-8 max-w-2xl`}>
                Access our exclusive network of board-level executives, vetted for their real-world experience in non-executive and advisory roles.
              </p>

              {/* Advanced Filter Bar */}
              <HeroFilterBar />
            </div>

            {/* Right Column: Compact Awards Card */}
            <div className="mt-8 lg:mt-0">
              <div className="[background:var(--awards-grad)] rounded-card p-6 border border-[var(--border)]">
                <div className="text-center mb-4">
                  <h3 className="text-overline text-[var(--muted)] font-semibold">
                    TRUSTED BY LEADERS
                  </h3>
                </div>

                {/* Stats Grid */}
                <div className="space-y-3">
                  {/* Primary Stat */}
                  <div className="bg-white rounded-lg p-4 text-center border border-[var(--border)]">
                    <div className="text-[var(--cta-start)] text-3xl font-bold mb-1">2,500+</div>
                    <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Board Appointments</p>
                  </div>

                  {/* Secondary Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center border border-[var(--border)]">
                      <div className="text-[var(--cta-start)] text-2xl font-bold">500+</div>
                      <p className="text-xs text-[var(--muted)]">PE Portfolio</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-[var(--border)]">
                      <div className="text-[var(--cta-start)] text-2xl font-bold">100+</div>
                      <p className="text-xs text-[var(--muted)]">FTSE Listed</p>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex justify-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-[#E8EFFA] text-[var(--cta-start)] rounded-full text-xs font-semibold">
                      Verified Network
                    </span>
                    <span className="px-3 py-1 bg-[#F1F5F9] text-[var(--muted)] rounded-full text-xs font-semibold">
                      Due Diligence
                    </span>
                  </div>
                </div>

                {/* Awards Logos */}
                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center justify-center h-12">
                      <Image
                        src="/board-champions-assets/champions-awards/fast-track.webp"
                        alt="Fast Track Award"
                        width={60}
                        height={30}
                        className="h-8 w-auto object-contain grayscale opacity-60"
                      />
                    </div>
                    <div className="flex items-center justify-center h-12">
                      <Image
                        src="/board-champions-assets/champions-awards/1000-companies.webp"
                        alt="1000 Companies Award"
                        width={60}
                        height={30}
                        className="h-8 w-auto object-contain grayscale opacity-60"
                      />
                    </div>
                    <div className="flex items-center justify-center h-12">
                      <Image
                        src="/board-champions-assets/champions-awards/breakthrough-50-awards.webp"
                        alt="Breakthrough 50 Award"
                        width={60}
                        height={30}
                        className="h-8 w-auto object-contain grayscale opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}