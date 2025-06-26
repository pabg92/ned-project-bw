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
  {
    id: 2,
    image: "/placeholder.svg?height=400&width=600",
    text: "Voluptate iusto quidem rerum sit dolorem. Quia non sequi est voluptatem quia. Quibusdam neque aperiam dolor. Molestiae aut occaecati dolorem sed et enim qui incidunt. Qui autem et est perferendis.\n\nEt aut aut qui est et. Nihil quis consequatur quis ea. Quam quisquam qui beatae ut qui consequatur qui. Consequatur et eum enim beatae.",
    logo: "/placeholder.svg?height=60&width=200",
    logoAlt: "Microsoft",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=400&width=600",
    text: "Eum et est aperiam et dolor repellendus. Tempore aut iure vel. Laborum et voluptatem ut sit est dolor. Dolorem asperiores ut occaecati.\n\nEt aut aut qui est et. Nihil quis consequatur quis ea. Quam quisquam qui beatae ut qui consequatur qui. Consequatur et eum enim beatae.",
    logo: "/placeholder.svg?height=60&width=200",
    logoAlt: "Amazon",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=400&width=600",
    text: "Voluptatem quia provident tempora. Voluptatibus molestiae qui sit. Recusandae est aut aut. Libero ut accusantium voluptatem aliquid.\n\nEt aut aut qui est et. Nihil quis consequatur quis ea. Quam quisquam qui beatae ut qui consequatur qui. Consequatur et eum enim beatae.",
    logo: "/placeholder.svg?height=60&width=200",
    logoAlt: "Google",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=400&width=600",
    text: "Aut et voluptatem ut sit est dolor. Dolorem asperiores ut occaecati. Eum et est aperiam et dolor repellendus. Tempore aut iure vel. Laborum et voluptatem.\n\nEt aut aut qui est et. Nihil quis consequatur quis ea. Quam quisquam qui beatae ut qui consequatur qui. Consequatur et eum enim beatae.",
    logo: "/placeholder.svg?height=60&width=200",
    logoAlt: "Apple",
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
        <h2 className={`${typography.h2.base} text-center mb-12 text-white`}>DON'T JUST TAKE OUR WORD FOR IT</h2>

        <div className="relative">
          {/* Carousel Content */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className={`grid grid-cols-1 md:grid-cols-2 ${spacing.grid.base} max-w-5xl mx-auto`}>
                    {/* Image */}
                    <div className="rounded-xl overflow-hidden shadow-2xl">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt="Client testimonial"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    {/* Testimonial Content */}
                    <div className="bg-white text-gray-800 p-6 md:p-8 rounded-xl flex flex-col shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                      <div className="flex-grow">
                        {testimonial.highlight && (
                          <h3 className={`${typography.h3.base} mb-4 text-gray-800`}>
                            {testimonial.highlight}
                          </h3>
                        )}
                        <p className={`${typography.body.base} mb-6 text-gray-700`}>
                          "{testimonial.text}"
                        </p>
                        {testimonial.author && (
                          <div className="mb-6">
                            <p className={`${typography.body.base} font-semibold text-gray-800`}>
                              {testimonial.author}
                            </p>
                            <p className={`${typography.body.small} text-gray-600`}>
                              {testimonial.company}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto">
                        <Image
                          src={testimonial.logo || "/placeholder.svg"}
                          alt={testimonial.logoAlt}
                          width={200}
                          height={60}
                          className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                        />
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
