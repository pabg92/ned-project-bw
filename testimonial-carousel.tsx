"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { typography, spacing } from "@/lib/typography"
import Section from "@/components/layout/Section"

const testimonials = [
  {
    id: 1,
    image: "/testimonials/testomonial.png",
    text: "Champions – you were amazing. And, the responsiveness on very short notice was incredible. Having worked with many agencies over the years, I can say from experience, Champions are a step above.",
    logo: "/testimonials/coke.png",
    logoAlt: "Coca-Cola",
    author: "Keith Sanders",
    company: "Coca Cola",
    highlight: "THE RESPONSIVENESS ON VERY SHORT NOTICE WAS INCREDIBLE.",
  },
]

export default function TestimonialCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <Section variant="subtle">
      <div className="container container-narrow">
        <h2 className="fluid-h2 font-display text-[var(--ink)] text-center mb-10">DRIVING TANGIBLE RESULTS</h2>

        {/* 2 Cards per viewport */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Show 2 testimonials at a time */}
            {testimonials.slice(currentSlide, currentSlide + 2).concat(
              testimonials.slice(0, Math.max(0, (currentSlide + 2) - testimonials.length))
            ).map((testimonial, index) => (
              <div key={`${testimonial.id}-${index}`} className="bg-white rounded-card p-6 shadow-sm hover:shadow-md transition-shadow duration-200 max-w-[560px] mx-auto">
                {/* Company Logo */}
                <div className="mb-6">
                  <Image
                    src={testimonial.logo || "/placeholder.svg"}
                    alt={testimonial.logoAlt}
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain grayscale opacity-60"
                  />
                </div>
                
                {/* Quote - Compact text */}
                <p className="text-base text-[var(--ink)] mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                {/* Author - Simplified */}
                <div className="mt-3 pt-2">
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {testimonial.author}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Outside cards */}
          <button
            onClick={goToPrevious}
            className="absolute -left-12 top-1/2 transform -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] bg-white hover:bg-[var(--bg-subtle)] rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[rgba(90,130,189,0.9)]"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)] bg-white hover:bg-[var(--bg-subtle)] rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[rgba(90,130,189,0.9)]"
            aria-label="Next testimonials"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </Section>
  )
}
