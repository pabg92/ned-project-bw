"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { typography, spacing } from "@/lib/typography"

const awardSlides = [
  [
    {
      id: 1,
      name: "London Stock Exchange 1000",
      image: "/placeholder.svg?height=120&width=200",
      alt: "1000 Companies to Inspire Britain",
    },
    {
      id: 2,
      name: "Sunday Times Tech Track 100",
      image: "/placeholder.svg?height=120&width=200",
      alt: "The Sunday Times Tech Track 100",
    },
    {
      id: 3,
      name: "Google Partner",
      image: "/placeholder.svg?height=120&width=200",
      alt: "Google Partner",
    },
    {
      id: 4,
      name: "Accelerate 250",
      image: "/placeholder.svg?height=120&width=200",
      alt: "Accelerate 250",
    },
    {
      id: 5,
      name: "Award Badge",
      image: "/placeholder.svg?height=120&width=200",
      alt: "Award Badge",
    },
  ],
  [
    {
      id: 6,
      name: "Certification 1",
      image: "/placeholder.svg?height=120&width=200",
      alt: "Business Certification",
    },
    {
      id: 7,
      name: "Certification 2",
      image: "/placeholder.svg?height=120&width=200",
      alt: "Professional Accreditation",
    },
    {
      id: 8,
      name: "Industry Award",
      image: "/placeholder.svg?height=120&width=200",
      alt: "Industry Excellence Award",
    },
  ],
]

const statistics = [
  {
    id: 1,
    iconPath: "/board-champions-assets/2000 Experts.svg",
    number: "OVER 2,000",
    text: "EXPERTS APPOINTED",
    color: "text-[#7394c7]",
  },
  {
    id: 2,
    iconPath: "/board-champions-assets/70Awards.svg",
    number: "RECEIVED OVER",
    subNumber: "70 AWARDS",
    text: "",
    color: "text-[#7394c7]",
  },
  {
    id: 3,
    iconPath: "/board-champions-assets/23Years.svg",
    number: "23 YEARS",
    text: "OF EXPERIENCE",
    color: "text-[#7394c7]",
  },
  {
    id: 4,
    iconPath: "/board-champions-assets/80Team.svg",
    number: "80+ STRONG TEAM",
    text: "OF EXPERTS",
    color: "text-[#7394c7]",
  },
]

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
    <section className={`${spacing.section.base} bg-gradient-to-b from-white to-gray-50`}>
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
                    <div className={`flex justify-center items-center ${spacing.grid.carousel} px-8`}>
                      {slide.map((award) => (
                        <div key={award.id} className="flex-shrink-0">
                          <Image
                            src={award.image || "/placeholder.svg"}
                            alt={award.alt}
                            width={180}
                            height={120}
                            className="h-28 md:h-32 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                          />
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

        {/* Statistics Section */}
        <div className="bg-white rounded-2xl shadow-lg py-12 px-6 mt-16">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${spacing.grid.base} max-w-6xl mx-auto`}>
            {statistics.map((stat) => {
              return (
                <div key={stat.id} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-4">
                    <Image
                      src={stat.iconPath}
                      alt={stat.text || stat.number}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <div className={`font-akrive-grotesk font-bold text-xl md:text-2xl mb-2 ${stat.color}`}>
                    {stat.number}
                    {stat.subNumber && <div className="text-lg md:text-xl mt-1">{stat.subNumber}</div>}
                  </div>
                  {stat.text && <div className="font-medium text-sm md:text-base text-gray-700">{stat.text}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
