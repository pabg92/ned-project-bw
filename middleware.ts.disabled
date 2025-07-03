import { clerkMiddleware } from "@clerk/nextjs/server";

// Simple middleware that just runs Clerk authentication
export default clerkMiddleware({
  // Optional: Configure public routes
  publicRoutes: ["/", "/api/health", "/api/test-db", "/sign-in", "/sign-up"]
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};