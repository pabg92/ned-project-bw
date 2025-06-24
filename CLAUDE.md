# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Board Champions is a Next.js-based corporate website focused on executive talent and board member recruitment services. The application is built with modern React patterns and a component-based architecture.

## Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom configuration
- **Component Library**: shadcn/ui (built on Radix UI primitives)
- **Icons**: lucide-react
- **Form Management**: React Hook Form with Zod validation
- **Package Manager**: pnpm

## Essential Commands

```bash
# Development
pnpm dev        # Start development server with hot-reloading

# Building
pnpm build      # Create production build
pnpm start      # Run production server (requires build first)

# Code Quality
pnpm lint       # Run Next.js linting
```

**⚠️ Important**: Both ESLint and TypeScript errors are currently ignored during builds (`next.config.mjs`). When making changes, manually check for TypeScript errors and lint issues.

## Architecture & Structure

### Component Organization

The project uses a dual organization pattern:

1. **Root-level components** (`/`): Major page sections
   - `hero-section.tsx`, `navbar.tsx`, `footer.tsx`, etc.
   - These are self-contained sections with their own data and state

2. **UI components** (`/components/ui/`): Reusable shadcn/ui primitives
   - Button, Card, Dialog, Dropdown, etc.
   - Follow shadcn/ui patterns with `cn()` utility for styling

### Key Patterns

- **Client Components**: All components use "use client" directive
- **Local State**: Each component manages its own state (no global state management)
- **Static Data**: All content is hardcoded within components
- **Styling**: Tailwind CSS classes with custom theme colors (blues, grays)
- **No Testing**: Currently no test framework is configured

### Main Page Structure

The home page (`app/page.tsx`) is composed of these sections in order:
1. Navbar
2. HeroSection (carousel)
3. StatsSection
4. FeaturedExpertsSection
5. AboutUsSection
6. TestimonialsSection
7. ClientLogoScroll
8. IntegratedCTAProcessSection
9. Footer

Each section is independent and can be modified without affecting others.

### Development Notes

- Use the existing component patterns when creating new sections
- Follow the kebab-case naming convention for new section components
- Utilize the extensive shadcn/ui component library in `/components/ui/`
- Maintain the Tailwind-first styling approach
- Check TypeScript types manually as build-time checking is disabled