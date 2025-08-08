"use client"

import Navbar from "../navbar"
import HeroSection from "../hero-section"
import StickyChips from "@/components/sections/StickyChips"
import ClientLogoCarousel from "../client-logo-carousel"
import FeaturedExpertsSection from "../featured-experts-section"
import ProcessSection from "../process-section"
import TestimonialCarousel from "../testimonial-carousel"
import IntegratedCTAProcessSection from "../integrated-cta-process-section"
import TestimonialsSection from "../testimonials-section"
import Footer from "../footer"

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StickyChips />
      <ClientLogoCarousel />
      <FeaturedExpertsSection />
      <ProcessSection />
      <TestimonialCarousel />
      <IntegratedCTAProcessSection />
      <TestimonialsSection />
      <Footer />
    </div>
  )
}
