"use client"

import { typography, spacing } from "@/lib/typography"

export default function FoundationPartnersSection() {
  return (
    <section className={`${spacing.section.base} bg-white`}>
      <div className={spacing.container}>
        {/* Foundation Partners Section */}
        <div className="text-center">
          <h3 className={`${typography.h2.base} text-gray-800 mb-4`}>Our Foundation Partners</h3>
          <p className={`${typography.body.large} text-gray-600 max-w-3xl mx-auto`}>
            We are proud to partner with leading institutions and organisations that share our commitment 
            to excellence in corporate governance and leadership. These partnerships provide our network 
            with unparalleled insights and opportunities.
          </p>
        </div>
      </div>
    </section>
  )
}