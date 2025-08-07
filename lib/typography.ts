// Typography System for The NED Advisor
// Premium B2B design system with unified color palette and typography

export const typography = {
  // Main headings (H1) - 44px, font-display (BebasNeue)
  h1: {
    base: "text-h1 font-display text-ink",
    compact: "text-h2 font-display text-ink"
  },
  
  // Section headings (H2) - 36px, font-display (BebasNeue) 
  h2: {
    base: "text-h2 font-display text-ink",
    compact: "text-h3 font-display text-ink"
  },
  
  // Subsection headings (H3) - 24px, font-ui (AkrivGrotesk)
  h3: {
    base: "text-h3 font-ui text-ink",
    compact: "text-body font-ui font-semibold text-ink"
  },
  
  // Body text - 17px, font-ui (AkrivGrotesk)
  body: {
    large: "text-body font-ui text-muted",
    base: "text-body font-ui text-muted",
    small: "text-caption font-ui text-muted"
  },
  
  // Button text - Consistent across all buttons
  button: {
    large: "text-base font-semibold",
    base: "text-sm font-semibold",
    small: "text-xs font-semibold"
  },
  
  // Navigation - Special case for navbar
  nav: {
    primary: "text-base font-medium text-brand-ink",
    secondary: "text-sm font-medium text-brand-muted"
  },
  
  // Labels and captions
  label: {
    base: "text-overline text-brand-muted",
    compact: "text-caption font-semibold uppercase tracking-wide text-brand-muted"
  }
}

// Consistent spacing system
export const spacing = {
  // Section padding - standardized for consistency
  section: {
    base: "pt-section pb-section-bottom",  // 96px top, 72px bottom
    compact: "pt-16 pb-12",                 // 64px top, 48px bottom
    large: "pt-32 pb-24"                    // 128px top, 96px bottom
  },
  // Container padding
  container: "max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8",
  // Grid gaps
  grid: {
    tight: "gap-4",
    base: "gap-6",
    loose: "gap-8",
    carousel: "gap-8 lg:gap-12"
  }
}

// Unified button styles - single accent color system
export const buttonStyles = {
  // Primary button (filled with accent color)
  primary: "bg-accent hover:bg-accent-hover text-white rounded-card px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
  // Secondary button (outlined)
  secondary: "bg-white hover:bg-accent-light text-accent border-2 border-accent rounded-card px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
  // Ghost button (minimal)
  ghost: "text-accent hover:text-accent-hover hover:bg-accent-light rounded-card px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
  // Button sizes with consistent padding
  size: {
    small: "px-4 py-2 text-sm",
    base: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg"
  }
}

// Helper function to combine typography classes with custom classes
export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}