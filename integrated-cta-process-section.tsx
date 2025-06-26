"use client"

import Image from "next/image"
import { ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography, buttonStyles, cn } from "@/lib/typography"

const processSteps = [
  {
    id: 1,
    title: "RISK-FREE CONSULTATION",
    icon: "/RFC.svg",
    iconAlt: "Consultation icon",
  },
  {
    id: 2,
    title: "SCREENING",
    icon: "/Screen.svg",
    iconAlt: "Screening icon",
  },
  {
    id: 3,
    title: "TALENT SHORTLIST",
    icon: "/talent-shortlist-icon.svg",
    iconAlt: "Talent shortlist icon",
  },
  {
    id: 4,
    title: "INTERVIEW",
    icon: "/interview-icon.svg",
    iconAlt: "Interview icon",
  },
  {
    id: 5,
    title: "HIRE",
    icon: "/hire-icon.svg",
    iconAlt: "Hire icon",
  },
]

export default function IntegratedCTAProcessSection() {
  return (
    <section className="pt-16 pb-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Button className={cn("bg-gradient-to-r from-[#454547] to-[#3a3a3c] hover:from-[#3a3a3c] hover:to-[#2f2f31] text-white", buttonStyles.size.large, typography.button.large, "rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 min-w-[260px] sm:min-w-[280px] group")}>
            <span>I need an <span className="font-bold">expert</span></span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          <Button className={cn(buttonStyles.primary, buttonStyles.size.large, typography.button.large, "flex items-center justify-center gap-2 min-w-[260px] sm:min-w-[280px] group")}>
            <span>I'm <span className="font-bold">available</span> to <span className="font-bold">hire</span></span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-12">
          <h2 className={`${typography.h1.base} mb-6`}>
            <span className="text-[#7394c7]">Winning Expert Talent</span>{" "}
            <span className="text-gray-800">appointments.</span>
          </h2>

          {/* Dotted line decoration */}
          <div className="flex justify-center mb-10">
            <div className="w-full max-w-3xl border-b-3 border-dotted border-gray-400 opacity-50"></div>
          </div>
        </div>

        {/* Process Section */}
        <div className="text-center mb-12">
          <h3 className={`${typography.h2.base} text-gray-700`}>
            <span className="font-bold">The Process</span> of finding the best expert for your needs:
          </h3>
        </div>

        {/* Process Steps */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-16 max-w-7xl mx-auto px-4">
          {processSteps.map((step, index) => (
            <>
              <div key={step.id} className="flex flex-col h-full">
                {/* Card */}
                <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative w-36 sm:w-40 lg:w-44 h-full">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white px-2 py-2.5 group-hover:from-[#5a5a5a] group-hover:to-[#6a6a6a] transition-all duration-300 min-h-[48px] flex items-center justify-center">
                    <h4 className={`text-[11px] font-semibold tracking-tight text-center text-white leading-tight`}>{step.title}</h4>
                  </div>

                  {/* Icon Section */}
                  <div className="p-4 flex items-center justify-center">
                    <div className="w-14 h-14 flex items-center justify-center bg-[#7394c7]/5 rounded-full group-hover:bg-[#7394c7]/20 transition-all duration-300 ring-1 ring-[#7394c7]/10 group-hover:ring-[#7394c7]/30">
                      <Image
                        src={step.icon || "/placeholder.svg"}
                        alt={step.iconAlt}
                        width={35}
                        height={35}
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Arrow between cards */}
              {index < processSteps.length - 1 && (
                <ArrowRight className="h-6 w-6 text-[#7394c7] animate-pulse hidden lg:block" />
              )}
            </>
          ))}
        </div>

        {/* No Fees Statement */}
        <div className="text-center mb-16">
          <p className={`${typography.h2.base} text-gray-800 bg-gradient-to-r from-gray-100 to-gray-50 py-6 px-8 rounded-2xl inline-block shadow-inner`}>
            <span className="text-[#7394c7] font-bold tracking-wider">NO FEES</span> <span className="text-gray-600 font-medium">until you hire your expert.</span>
          </p>
        </div>

        {/* CTA Section - Moved from expert search */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-[#7394c7] to-[#8595d5] text-white rounded-2xl p-6 text-center shadow-xl">
            <h3 className={`${typography.h3.base} mb-2`}>Get a <span className="font-bold">FREE</span> consultation now</h3>
            <Button className={cn("bg-white text-[#7394c7] hover:bg-gray-100", buttonStyles.size.large, typography.button.large, "inline-flex items-center gap-2 shadow-lg hover:shadow-xl font-bold")}>
              I'M IN!
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
