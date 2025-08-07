"use client"

import Navbar from "../navbar"
import HeroSection from "../hero-section"
import ClientLogoCarousel from "../client-logo-carousel"
import FeaturedExpertsSection from "../featured-experts-section"
import ExpertSearchSection from "../expert-search-section"
import IntegratedCTAProcessSection from "../integrated-cta-process-section"
import TestimonialCarousel from "../testimonial-carousel"
import TestimonialsSection from "../testimonials-section"
import Footer from "../footer"

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ClientLogoCarousel />
      <FeaturedExpertsSection />
      <ExpertSearchSection />
      <IntegratedCTAProcessSection />
      <TestimonialCarousel />
      <TestimonialsSection />
      <Footer />
    </div>
  )
}
