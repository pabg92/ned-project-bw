"use client"

import Image from "next/image"

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

export default function ProcessSection() {
  return (
    <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-normal text-gray-700 mb-8">
            <span className="font-akrive-grotesk font-semibold">The process</span> of finding the best expert for your needs:
          </h2>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {processSteps.map((step) => (
            <div key={step.id} className="flex flex-col">
              {/* Card */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative">
                {/* Step Number */}
                <div className="absolute top-2 right-3 w-5 h-5 bg-[#7394c7] text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm z-10">
                  {step.id}
                </div>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white px-4 py-4 group-hover:from-[#5a5a5a] group-hover:to-[#6a6a6a] transition-all duration-300">
                  <h3 className="font-akrive-grotesk font-bold text-sm sm:text-base text-center leading-tight tracking-wide">{step.title}</h3>
                </div>

                {/* Icon Section */}
                <div className="p-8 flex items-center justify-center min-h-[140px] bg-white">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Image
                      src={step.icon || "/placeholder.svg"}
                      alt={step.iconAlt}
                      width={70}
                      height={70}
                      className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Fees Statement */}
        <div className="text-center">
          <p className="text-lg md:text-xl text-gray-700 bg-gray-100 py-4 px-8 rounded-xl inline-block">
            <span className="font-akrive-grotesk font-bold text-[#7394c7] text-xl md:text-2xl">NO FEES</span> <span className="text-gray-600 text-lg md:text-xl">until you hire your expert.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
