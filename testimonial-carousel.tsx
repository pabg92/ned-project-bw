"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { typography, spacing } from "@/lib/typography"

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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section className="py-12 bg-gradient-to-r from-[#444444] to-[#525252] text-white">
      <div className={spacing.container}>
        <h2 className={`${typography.h2.base} text-center mb-12 text-white font-bold`}>DON'T JUST TAKE OUR WORD FOR IT</h2>

        <div className="relative">
          {/* Carousel Content */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className={`grid grid-cols-1 md:grid-cols-2 ${spacing.grid.base} max-w-6xl mx-auto items-center`}>
                    {/* Image on Left */}
                    <div className="rounded-xl overflow-hidden shadow-2xl order-1">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt="Client testimonial"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Testimonial Content on Right */}
                    <div className="bg-white text-gray-800 p-8 md:p-10 rounded-xl flex flex-col shadow-2xl order-2">
                      <div className="flex-grow">
                        {/* Logo at top */}
                        <div className="mb-8">
                          <Image
                            src={testimonial.logo || "/placeholder.svg"}
                            alt={testimonial.logoAlt}
                            width={180}
                            height={60}
                            className="h-14 w-auto object-contain"
                          />
                        </div>
                        
                        {/* Highlight */}
                        {testimonial.highlight && (
                          <h3 className={`${typography.h3.base} mb-6 text-gray-800 font-bold`}>
                            {testimonial.highlight}
                          </h3>
                        )}
                        
                        {/* Quote */}
                        <p className={`${typography.body.large} mb-8 text-gray-700 italic`}>
                          "{testimonial.text}"
                        </p>
                        
                        {/* Author */}
                        {testimonial.author && (
                          <div>
                            <p className={`${typography.body.base} font-bold text-gray-800`}>
                              {testimonial.author}
                            </p>
                            <p className={`${typography.body.base} text-gray-600`}>
                              {testimonial.company}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-3 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-3 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center space-x-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                index === currentSlide ? "bg-white scale-125 shadow-white/50" : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
