"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
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
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Button className={cn("bg-gradient-to-r from-[#454547] to-[#3a3a3c] hover:from-[#3a3a3c] hover:to-[#2f2f31] text-white", buttonStyles.size.large, typography.button.large, "rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 min-w-[260px] sm:min-w-[280px] group")}>
            I need an expert
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>

          <Button className={cn(buttonStyles.primary, buttonStyles.size.large, typography.button.large, "flex items-center gap-3 min-w-[260px] sm:min-w-[280px] group")}>
            I'm available to hire
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
            <span>The process</span> of finding the best expert for your needs:
          </h3>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {processSteps.map((step) => (
            <div key={step.id} className="flex flex-col">
              {/* Card */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative">
                {/* Step Number */}
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#7394c7] text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm z-10">
                  {step.id}
                </div>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white px-4 py-4 group-hover:from-[#5a5a5a] group-hover:to-[#6a6a6a] transition-all duration-300">
                  <h4 className={`${typography.label.base} text-center text-white`}>{step.title}</h4>
                </div>

                {/* Icon Section */}
                <div className="p-8 flex items-center justify-center min-h-[140px]">
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-full group-hover:bg-[#7394c7]/10 transition-all duration-300">
                    <Image
                      src={step.icon || "/placeholder.svg"}
                      alt={step.iconAlt}
                      width={60}
                      height={60}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Fees Statement */}
        <div className="text-center">
          <p className={`${typography.h2.base} text-gray-800 bg-gradient-to-r from-gray-100 to-gray-50 py-6 px-8 rounded-2xl inline-block shadow-inner`}>
            <span className="text-[#7394c7]">NO FEES</span> <span className="text-gray-600 font-medium">until you hire your expert.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
