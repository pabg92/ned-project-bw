"use client"

import Navbar from "../navbar"
import HeroSection from "../hero-section"
import IntegratedCTAProcessSection from "../integrated-cta-process-section"
import ExpertSearchSection from "../expert-search-section"
import FeaturedExpertsSection from "../featured-experts-section"
import TestimonialsSection from "../testimonials-section"
import StatsSection from "../stats-section"
import TestimonialCarousel from "../testimonial-carousel"
import ClientLogoCarousel from "../client-logo-carousel"
import Footer from "../footer"

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <IntegratedCTAProcessSection />
      <ExpertSearchSection />
      <StatsSection />
      <FeaturedExpertsSection />
      <ClientLogoCarousel />
      <TestimonialsSection />
      <TestimonialCarousel />
      <Footer />
    </div>
  )
}
