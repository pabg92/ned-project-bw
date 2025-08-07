"use client"

import Image from "next/image"
import { typography, cn, spacing } from "@/lib/typography"
import { useState, useEffect, useRef } from "react"
import React from "react"

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
  const [isVisible, setIsVisible] = useState(false)
  const processRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (processRef.current) {
      observer.observe(processRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className={`${spacing.section.base} bg-gradient-to-b from-white to-gray-50 relative z-10`}>
      <div className={spacing.container}>
        {/* Process Section Header */}
        <div className="text-center mb-12">
          <h3 className={`${typography.h2.base} text-gray-700 mb-4`}>
            Our Bespoke Appointment Process
          </h3>
          <p className={`${typography.body.large} text-gray-600 max-w-3xl mx-auto`}>
            A rigorous, confidential, and tailored approach to ensure a perfect alignment 
            of expertise, culture, and strategic goals.
          </p>
        </div>

        {/* Process Steps */}
        <div 
          ref={processRef}
          className="max-w-7xl mx-auto"
        >
          {/* Desktop layout with integrated arrows */}
          <div className="hidden md:grid md:grid-cols-9 gap-0 items-center relative">
            {/* Background connecting line */}
            <div className={cn(
              "absolute top-1/2 left-20 right-20 h-px bg-gradient-to-r from-transparent via-[#7394c7]/15 to-transparent -z-10 transition-all duration-2500 ease-out transform -translate-y-1/2",
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )} 
            style={{
              transitionDelay: isVisible ? '200ms' : '0ms'
            }}
            />
            
            {processSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step Card */}
                <div 
                  className={cn(
                    "col-span-1 transition-all duration-1000 ease-out",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  style={{
                    transitionDelay: isVisible ? `${index * 250 + 300}ms` : '0ms'
                  }}
                >
                  <div className="process-step-card bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-400 group relative w-full h-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white px-3 py-3 group-hover:from-[#5a5a5a] group-hover:to-[#6a6a6a] transition-all duration-300 min-h-[52px] flex items-center justify-center">
                      <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-center text-white leading-tight">{step.title}</h4>
                    </div>

                    {/* Icon Section */}
                    <div className="p-5 sm:p-4 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-14 sm:h-14 flex items-center justify-center bg-[#7394c7]/5 rounded-full group-hover:bg-[#7394c7]/20 transition-all duration-300 ring-1 ring-[#7394c7]/10 group-hover:ring-[#7394c7]/30">
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
                
                {/* Arrow Connector - Only between steps */}
                {index < processSteps.length - 1 && (
                  <div 
                    className={cn(
                      "col-span-1 flex items-center justify-center transition-all duration-1000 ease-out",
                      isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    )}
                    style={{
                      transitionDelay: isVisible ? `${index * 250 + 500}ms` : '0ms'
                    }}
                  >
                    <div className="relative w-full flex items-center">
                      {/* Dotted line */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dotted border-[#7394c7]/30"></div>
                      </div>
                      {/* Arrow */}
                      <div className="relative bg-gradient-to-r from-white via-gray-50 to-white px-3 py-1 rounded-full">
                        <Image
                          src="/board-champions-assets/Arrow Charcoal.svg"
                          alt="Next step"
                          width={26}
                          height={26}
                          className="arrow-connector"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Mobile/Tablet Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:hidden gap-4 sm:gap-6">
            {processSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={cn(
                  "relative transition-all duration-1000 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{
                  transitionDelay: isVisible ? `${index * 200 + 300}ms` : '0ms'
                }}
              >
                {/* Mobile arrows - only show between rows */}
                {index === 1 && (
                  <div className="block sm:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 rotate-90 z-10">
                    <Image
                      src="/board-champions-assets/Arrow Charcoal.svg"
                      alt="Next step"
                      width={20}
                      height={20}
                      className="opacity-50"
                    />
                  </div>
                )}
                {index === 3 && (
                  <div className="block sm:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 rotate-90 z-10">
                    <Image
                      src="/board-champions-assets/Arrow Charcoal.svg"
                      alt="Next step"
                      width={20}
                      height={20}
                      className="opacity-50"
                    />
                  </div>
                )}
                
                {/* Card */}
                <div className="process-step-card bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-400 group relative w-full h-full">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white px-3 py-3 group-hover:from-[#5a5a5a] group-hover:to-[#6a6a6a] transition-all duration-300 min-h-[52px] flex items-center justify-center">
                    <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-center text-white leading-tight">{step.title}</h4>
                  </div>

                  {/* Icon Section */}
                  <div className="p-5 sm:p-4 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-14 sm:h-14 flex items-center justify-center bg-[#7394c7]/5 rounded-full group-hover:bg-[#7394c7]/20 transition-all duration-300 ring-1 ring-[#7394c7]/10 group-hover:ring-[#7394c7]/30">
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
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}