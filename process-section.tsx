"use client"

import { typography, spacing } from "@/lib/typography"
import Section from "@/components/layout/Section"

const processSteps = [
  {
    id: 1,
    number: "01",
    title: "Risk-Free Consultation",
    description: "Discuss your needs",
  },
  {
    id: 2,
    number: "02",
    title: "Screening",
    description: "Evaluate candidates",
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
    description: "Meet candidates",
  },
  {
    id: 5,
    number: "05",
    title: "Hire",
    description: "Onboard expert",
  },
]

export default function ProcessSection() {
  return (
    <Section variant="stats" className="mb-16">
      <div className={spacing.container}>
        {/* Decorative line at top */}
        <div className="h-[2px] rounded-full [background:var(--process-line)] mb-8" />
        
        {/* Process Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-[36px] tracking-[var(--track-display)] leading-[var(--lh-display-tight)]">
            OUR BESPOKE APPOINTMENT PROCESS
          </h2>
          <p className={`${typography.body.large} mt-4 max-w-3xl mx-auto`}>
            A rigorous, confidential approach to ensure perfect alignment
          </p>
        </div>

        {/* Process Steps - 5 steps with numbered icons */}
        <div className="flex flex-wrap justify-center items-start gap-8 lg:gap-12">
          {processSteps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              {/* Step number balloon */}
              <div className="w-10 h-10 mb-4 rounded-full flex items-center justify-center text-white"
                   style={{ background: "var(--hover-start)" }}>
                <span className="font-display text-lg leading-[var(--lh-display-tight)]">
                  {step.number}
                </span>
              </div>
              
              {/* Step card */}
              <div className="rounded-card border border-[var(--border)] p-4 [background:var(--awards-grad)] shadow-card max-w-[160px]">
                <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">{step.title}</h3>
                <p className="text-xs text-[var(--muted)]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}