"use client"

import Navbar from "../navbar"
import HeroSection from "../hero-section"
import ClientLogoCarousel from "../client-logo-carousel"
import FeaturedExpertsSection from "../featured-experts-section"
import ExpertSearchSection from "../expert-search-section"
import CTAButtonsSection from "../cta-buttons-section"
import ProcessSection from "../process-section"
import TestimonialCarousel from "../testimonial-carousel"
import MainCTASection from "../main-cta-section"
import FoundationPartnersSection from "../foundation-partners-section"
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
      <CTAButtonsSection />
      <ProcessSection />
      <TestimonialCarousel />
      <MainCTASection />
      <FoundationPartnersSection />
      <TestimonialsSection />
      <Footer />
    </div>
  )
}
