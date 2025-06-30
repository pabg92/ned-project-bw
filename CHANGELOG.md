# Changelog

All notable changes to the BoardChampions project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Signup form component with comprehensive validation using React Hook Form and Zod
- Signup page flow with success confirmation page
- Initial search portal implementation with filter functionality
- Search header component with dynamic filter tags
- Navigation link to search portal in navbar
- Inter font support in Tailwind configuration
- Form validation for email, password strength, and user data
- Dependencies: react-hook-form, @hookform/resolvers, zod

### Changed
- Updated CTA sections to link to new signup flow
- Modified navbar to include search portal navigation
- Enhanced button interactions in integrated CTA process section

### Fixed
- Form submission handling with proper validation feedback
- Navigation flow between signup and success pages

## [1.0.0] - 2025-01-30

### Initial Release
- Next.js 15.2.4 application with App Router
- Component-based architecture using shadcn/ui
- Tailwind CSS styling with custom theme
- Homepage sections: Hero, Stats, Featured Experts, About Us, Testimonials, Client Logos, CTA
- Responsive navigation with mobile menu
- Typography using Bebas Neue and Aktiv Grotesk fonts
- Professional blue and gray color scheme