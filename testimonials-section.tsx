"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { typography, spacing } from "@/lib/typography"

const awards = [
  {
    id: 1,
    name: "1000 Companies to Inspire Britain",
    image: "/board-champions-assets/champions-awards/1000-companies.webp",
    alt: "1000 Companies to Inspire Britain Award",
  },
  {
    id: 2,
    name: "Accelerate",
    image: "/board-champions-assets/champions-awards/accelerate.png",
    alt: "Accelerate Award",
  },
  {
    id: 3,
    name: "Breakthrough 50 Awards",
    image: "/board-champions-assets/champions-awards/breakthrough-50-awards.webp",
    alt: "Breakthrough 50 Awards",
  },
  {
    id: 4,
    name: "Fast Track",
    image: "/board-champions-assets/champions-awards/fast-track.webp",
    alt: "Fast Track Award",
  },
  {
    id: 5,
    name: "Telegraph 1000 Brightest Businesses",
    image: "/board-champions-assets/champions-awards/telegraph-1000-brightest-businesses.webp",
    alt: "Telegraph 1000 Brightest Businesses Award",
  },
  {
    id: 6,
    name: "UK Fast Growth Index",
    image: "/board-champions-assets/champions-awards/uk_fast_growth_index_supported_by_ubs.webp",
    alt: "UK Fast Growth Index Supported by UBS",
  },
]

// Create slides dynamically based on awards per slide
const awardsPerSlide = 3
const awardSlides = []
for (let i = 0; i < awards.length; i += awardsPerSlide) {
  awardSlides.push(awards.slice(i, i + awardsPerSlide))
}


export default function TestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % awardSlides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + awardSlides.length) % awardSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % awardSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  return (
    <section className="py-8 bg-gradient-to-b from-white to-gray-50">
      <div className={spacing.container}>
        {/* Awards Section */}
        <div className="text-center mb-16">
          <h2 className={`${typography.h2.base} text-gray-800 mb-8`}>
            OUR AWARDS AND ACCREDITATIONS
          </h2>

          {/* Carousel Container */}
          <div className="relative">
            {/* Carousel Content */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {awardSlides.map((slide, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="flex justify-center items-center gap-6 md:gap-10 lg:gap-12 px-4">
                      {slide.map((award) => (
                        <div key={award.id} className="flex flex-col items-center">
                          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <Image
                              src={award.image}
                              alt={award.alt}
                              width={240}
                              height={160}
                              className="h-20 md:h-24 lg:h-28 w-auto object-contain mx-auto"
                              priority={slideIndex === 0}
                            />
                          </div>
                          <p className="mt-3 text-sm text-gray-600 text-center max-w-[200px]">{award.name}</p>
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
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Previous awards"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Next awards"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center space-x-3 mt-8">
            {awardSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                  index === currentSlide ? "bg-[#7394c7] scale-125" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
