"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { typography, buttonStyles, cn } from "@/lib/typography"

const carouselSlides = [
  {
    id: 1,
    type: "video",
    video: "/CliveWoodward.mp4",
    poster: "/placeholder.svg?height=600&width=1200",
    title: "Sir Clive Woodward",
    subtitle: "Board excellence delivered.",
    description: "Strategic leadership for your most important decisions.",
  },
  {
    id: 2,
    type: "video",
    video: "/Piers-Talk.mp4",
    poster: "/placeholder.svg?height=600&width=1200",
    title: "Piers Linney",
    subtitle: "AI and Technology Expert",
    description: "Transforming businesses through cutting-edge innovation and digital strategy.",
  },
  {
    id: 3,
    type: "video",
    video: "/Matt-Talk.mp4",
    poster: "/placeholder.svg?height=600&width=1200",
    title: "Matthew Hayes",
    subtitle: "Strategic Marketing Leader",
    description: "Driving brand excellence through innovative marketing strategies and digital transformation.",
  },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] min-h-[350px] max-h-[550px] overflow-hidden">
      {/* Carousel Background */}
      <div className="absolute inset-0">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {slide.type === "video" ? (
              <>
                {/* Blurred Background Video */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70"
                  key={`video-bg-${slide.id}`}
                >
                  <source src={slide.video} type="video/mp4" />
                </video>
                
                {/* Main Video - No Distortion */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={slide.poster}
                  className="absolute inset-0 w-full h-full object-contain"
                  key={`video-${slide.id}`}
                >
                  <source src={slide.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Enhanced dark overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </>
            ) : (
              /* Image Background */
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${slide.image}')`,
                }}
              />
            )}
          </div>
        ))}
      </div>


      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-start items-center h-full">
            {/* Text box positioned on the left with proper spacing to avoid arrow overlap */}
            <div className="bg-black/60 backdrop-blur-sm p-6 sm:p-8 md:p-10 lg:p-12 rounded-lg w-full max-w-md lg:max-w-lg shadow-2xl border border-white/20 ml-12 sm:ml-16 lg:ml-20">
              <h1 className={`${typography.h1.compact} mb-3 text-white uppercase tracking-wide leading-tight`}>
                {carouselSlides[currentSlide]?.title}
              </h1>
              <h2 className={`${typography.h2.compact} mb-4 text-white/90 leading-tight`}>
                {carouselSlides[currentSlide]?.subtitle}
              </h2>
              <p className={`${typography.body.large} mb-6 sm:mb-8 text-white/80 leading-relaxed`}>
                {carouselSlides[currentSlide]?.description}
              </p>

              {/* Modernized CTA Button */}
              <Button className={cn(buttonStyles.primary, buttonStyles.size.large, typography.button.large, "inline-flex items-center gap-3 group whitespace-nowrap")}>
                SEARCH NOW
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Carousel Navigation */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 h-2 bg-white rounded-full" 
                  : "w-2 h-2 bg-white/50 hover:bg-white/70 rounded-full"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modern Arrow Controls */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-xl border border-white/10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-xl border border-white/10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </section>
  )
}
