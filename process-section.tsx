"use client"

import { typography, spacing } from "@/lib/typography"
import Section from "@/components/layout/Section"

const processSteps = [
  {
    id: 1,
    number: "01",
    title: "Consultation",
    description: "Discuss needs",
  },
  {
    id: 2,
    number: "02",
    title: "Screening",
    description: "Vet candidates",
  },
  {
    id: 3,
    number: "03",
    title: "Shortlist",
    description: "Top matches",
  },
  {
    id: 4,
    number: "04",
    title: "Interview",
    description: "Meet experts",
  },
  {
    id: 5,
    number: "05",
    title: "Appoint",
    description: "Final placement",
  },
]

export default function ProcessSection() {
  return (
    <Section variant="stats">
      <div className={spacing.container}>
        {/* Subtle visual separator */}
        <div className="w-32 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[rgba(115,148,199,0.15)] to-transparent mb-8" />
        
        {/* Process Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-[36px] tracking-[var(--track-display)] leading-[var(--lh-display-tight)]">
            OUR BESPOKE APPOINTMENT PROCESS
          </h2>
          <p className={`${typography.body.large} mt-4 max-w-3xl mx-auto`}>
            A rigorous, confidential approach to ensure perfect alignment
          </p>
        </div>

        {/* Process Steps with decorative line */}
        <div className="relative">
          {/* Decorative process line behind steps */}
          <div className="process-line absolute left-0 right-0 top-1/2 -translate-y-1/2 hidden lg:block" />
          
          <div className="relative flex flex-wrap justify-center items-start gap-8 lg:gap-12">
            {processSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center relative">
                {/* Step number with background to mask line */}
                <div className="w-10 h-10 mb-4 rounded-full flex items-center justify-center text-white bg-white relative z-10"
                     style={{ background: "var(--accent-strong)" }}>
                  <span className="font-display text-lg leading-[var(--lh-display-tight)] text-white">
                    {step.number}
                  </span>
                </div>
                
                {/* Step card with reduced copy */}
                <div className="rounded-card p-4 [background:var(--awards-grad)] shadow-sm hover:shadow-md transition-shadow duration-200 max-w-[160px]">
                  <h3 className="text-[14px] font-semibold text-[var(--ink)] mb-1">{step.title}</h3>
                  <p className="text-[12px] text-[var(--muted)]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}