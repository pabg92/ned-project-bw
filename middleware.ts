import { clerkMiddleware } from "@clerk/nextjs/server";

// Simple middleware that just runs Clerk authentication
export default clerkMiddleware({
  // Configure public routes - expand this for initial deployment
  publicRoutes: [
    "/",
    "/search",
    "/search/(.*)",
    "/signup",
    "/signup/(.*)",
    "/api/health",
    "/api/test-db",
    "/sign-in",
    "/sign-up",
    // Temporarily make admin routes public if in dev mode
    ...(process.env.DEV_MODE === 'true' ? ["/admin", "/admin/(.*)", "/api/admin/(.*)"] : [])
  ]
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};