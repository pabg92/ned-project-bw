"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { typography, spacing } from "@/lib/typography"

const logoSlides = [
  [
    {
      id: 1,
      name: "PwC",
      image: "/Company Logos/Logo-pwc.png",
      alt: "PwC logo",
      needsBackground: false,
    },
    {
      id: 2,
      name: "McKinsey & Company",
      image: "/Company Logos/McKinsey_&_Company-Logo.wine.svg",
      alt: "McKinsey & Company logo",
      needsBackground: false,
    },
    {
      id: 3,
      name: "Sky",
      image: "/Company Logos/Sky_Group_logo_2020.svg.webp",
      alt: "Sky logo",
      needsBackground: false,
    },
    {
      id: 4,
      name: "Experian",
      image: "/Company Logos/experian-main-horizontal-brand-logo-blue-pink-square-icon-design-1.png",
      alt: "Experian logo",
      needsBackground: true,
    },
    {
      id: 5,
      name: "Hargreaves Lansdown",
      image: "/Company Logos/hargreaves-lansdown.png",
      alt: "Hargreaves Lansdown logo",
      needsBackground: false,
    },
    {
      id: 6,
      name: "HSBC UK",
      image: "/Company Logos/hsbc-uk2966.logowik.com.webp",
      alt: "HSBC UK logo",
      needsBackground: false,
    },
  ],
  [
    {
      id: 7,
      name: "PwC",
      image: "/Company Logos/Logo-pwc.png",
      alt: "PwC logo",
      needsBackground: false,
    },
    {
      id: 8,
      name: "McKinsey & Company",
      image: "/Company Logos/McKinsey_&_Company-Logo.wine.svg",
      alt: "McKinsey & Company logo",
      needsBackground: false,
    },
    {
      id: 9,
      name: "Sky",
      image: "/Company Logos/Sky_Group_logo_2020.svg.webp",
      alt: "Sky logo",
      needsBackground: false,
    },
    {
      id: 10,
      name: "Experian",
      image: "/Company Logos/experian-main-horizontal-brand-logo-blue-pink-square-icon-design-1.png",
      alt: "Experian logo",
      needsBackground: true,
    },
    {
      id: 11,
      name: "Hargreaves Lansdown",
      image: "/Company Logos/hargreaves-lansdown.png",
      alt: "Hargreaves Lansdown logo",
      needsBackground: false,
    },
    {
      id: 12,
      name: "HSBC UK",
      image: "/Company Logos/hsbc-uk2966.logowik.com.webp",
      alt: "HSBC UK logo",
      needsBackground: false,
    },
  ],
]

export default function ClientLogoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % logoSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + logoSlides.length) % logoSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % logoSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  return (
    <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className={spacing.container}>
        <h2 className={`${typography.h2.base} text-center mb-12 text-gray-800`}>WE'VE APPOINTED EXPERTS FOR:</h2>

        <div className="relative">
          {/* Carousel Content */}
          <div className="overflow-hidden px-12">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {logoSlides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className={`flex justify-center items-center ${spacing.grid.carousel}`}>
                    {slide.map((logo) => (
                      <div key={logo.id} className="flex-shrink-0 flex items-center justify-center w-40 md:w-48 h-20 md:h-24">
                        <div className={`flex items-center justify-center w-full h-full ${logo.needsBackground ? 'bg-white rounded-lg p-3' : ''}`}>
                          <Image
                            src={logo.image || "/placeholder.svg"}
                            alt={logo.alt}
                            width={200}
                            height={100}
                            className="max-h-full max-w-full w-auto h-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                            style={{ maxHeight: '60px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Previous logos"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Next logos"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center space-x-3 mt-10">
          {logoSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                index === currentSlide ? "bg-[#7394c7] scale-125 shadow-lg" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
