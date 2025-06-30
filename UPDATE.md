# UPDATE.md - Development Guidelines

This document provides guidelines for ongoing development of the BoardChampions project.

## Git Workflow

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/search-portal`)
- `fix/` - Bug fixes (e.g., `fix/navbar-mobile-menu`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)
- `refactor/` - Code refactoring (e.g., `refactor/component-structure`)

### Commit Message Format
Follow the Conventional Commits specification:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(search): Add advanced filter options
fix(navbar): Resolve mobile menu overflow issue
docs: Update README with deployment instructions
```

### Development Process
1. Create a feature branch from `main`
2. Make changes and commit regularly with descriptive messages
3. Keep commits atomic (one logical change per commit)
4. Update CHANGELOG.md for significant changes
5. Create a pull request when ready for review
6. Merge to `main` after approval

## Code Standards

### Component Development
- Use TypeScript for all new components
- Follow the existing "use client" pattern for client components
- Place major sections in root directory with kebab-case naming
- Place reusable UI components in `/components/ui/`
- Maintain self-contained components with local state

### Styling Guidelines
- Use Tailwind CSS classes exclusively
- Follow the existing color scheme (blues and grays)
- Utilize the `cn()` utility for conditional classes
- Maintain responsive design patterns

### File Naming Conventions
- Components: `kebab-case.tsx` (e.g., `search-header.tsx`)
- Pages: Follow Next.js App Router conventions
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)

## Testing Strategy
Currently, no testing framework is configured. When implementing tests:
- Consider adding Jest and React Testing Library
- Focus on critical user flows first
- Test form validations and API interactions
- Add E2E tests for key user journeys

## Performance Considerations
- Lazy load heavy components
- Optimize images using Next.js Image component
- Minimize client-side JavaScript where possible
- Use static generation for marketing pages

## Security Best Practices
- Validate all form inputs on both client and server
- Sanitize user-generated content
- Use environment variables for sensitive data
- Implement proper authentication for protected routes

## Documentation
- Update CLAUDE.md when adding new patterns or dependencies
- Keep CHANGELOG.md current with all notable changes
- Document complex logic with inline comments
- Update component props with TypeScript interfaces

## Deployment Checklist
Before deploying to production:
- [ ] Run `pnpm build` successfully
- [ ] Check for TypeScript errors manually
- [ ] Run `pnpm lint` and fix any issues
- [ ] Test all forms and interactive elements
- [ ] Verify responsive design on multiple devices
- [ ] Update environment variables if needed
- [ ] Tag release in git with version number

## Common Tasks

### Adding a New Page Section
1. Create component file in root directory
2. Import and add to `app/page.tsx`
3. Follow existing section patterns
4. Ensure responsive design

### Adding Form Validation
1. Define Zod schema for form data
2. Use React Hook Form with zodResolver
3. Add error states and messages
4. Test all validation scenarios

### Updating Dependencies
1. Review breaking changes in release notes
2. Update one major dependency at a time
3. Run full test suite after updates
4. Update CHANGELOG.md with dependency changes

## Troubleshooting

### Build Errors
- Check for TypeScript errors (build ignores them)
- Verify all imports are correct
- Clear `.next` cache if needed

### Style Issues
- Ensure Tailwind classes are not dynamically constructed
- Check for CSS specificity conflicts
- Verify responsive breakpoints

### Form Problems
- Console log form errors for debugging
- Check Zod schema matches form fields
- Verify server-side validation matches client