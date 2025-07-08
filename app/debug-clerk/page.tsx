"use client";

export default function DebugClerkPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk Debug Page</h1>
      <div className="space-y-2">
        <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists: {clerkKey ? "Yes" : "No"}</p>
        <p>Key starts with: {clerkKey ? clerkKey.substring(0, 10) + "..." : "N/A"}</p>
        <p>Sign In URL: {process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "Not set"}</p>
        <p>Sign Up URL: {process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "Not set"}</p>
      </div>
    </div>
  );
}