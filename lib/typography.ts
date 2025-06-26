// Typography System for Board Champions
// This file defines consistent typography classes to be used across the application

export const typography = {
  // Main headings (H1) - Used for hero sections and main page titles
  h1: {
    base: "font-bebas-neue font-normal text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-wide",
    compact: "font-bebas-neue font-normal text-3xl sm:text-4xl md:text-5xl leading-tight tracking-wide"
  },
  
  // Section headings (H2) - Used for major section titles
  h2: {
    base: "font-bebas-neue font-normal text-3xl sm:text-4xl md:text-5xl leading-tight tracking-wide",
    compact: "font-bebas-neue font-normal text-2xl sm:text-3xl md:text-4xl leading-tight tracking-wide"
  },
  
  // Subsection headings (H3) - Used for card titles, smaller sections
  h3: {
    base: "font-aktiv-grotesk font-semibold text-lg sm:text-xl md:text-2xl leading-snug",
    compact: "font-aktiv-grotesk font-semibold text-base sm:text-lg md:text-xl leading-snug"
  },
  
  // Body text - Standardized for better readability
  body: {
    large: "text-base sm:text-lg font-medium leading-relaxed",
    base: "text-sm sm:text-base font-medium leading-relaxed",
    small: "text-xs sm:text-sm font-medium leading-relaxed"
  },
  
  // Button text - Consistent across all buttons
  button: {
    large: "text-sm sm:text-base font-semibold",
    base: "text-xs sm:text-sm font-semibold",
    small: "text-xs font-semibold"
  },
  
  // Navigation - Special case for navbar
  nav: {
    primary: "font-bebas-neue text-base tracking-wider",
    secondary: "font-aktiv-grotesk text-sm font-medium"
  },
  
  // Labels and captions
  label: {
    base: "text-xs sm:text-sm font-semibold uppercase tracking-wide",
    compact: "text-xs font-semibold uppercase tracking-wide"
  }
}

// Consistent spacing system
export const spacing = {
  // Section padding - consistent 60px (py-16) top/bottom
  section: {
    base: "py-16",
    compact: "py-12",
    large: "py-20"
  },
  // Container padding
  container: "max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8",
  // Grid gaps
  grid: {
    tight: "gap-4",
    base: "gap-6",
    loose: "gap-8",
    carousel: "gap-8 lg:gap-12" // Increased gutter for carousels
  }
}

// Standardized button styles
export const buttonStyles = {
  // Primary button (filled)
  primary: "bg-[#7394c7] hover:bg-[#6284b6] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
  // Secondary button (outlined)
  secondary: "bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105",
  // Button sizes with consistent padding
  size: {
    small: "px-4 py-2",
    base: "px-6 py-3",
    large: "px-8 py-4"
  }
}

// Helper function to combine typography classes with custom classes
export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}