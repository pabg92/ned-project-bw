"use client"

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Sign Up Page with Role Management
 * 
 * Purpose: Handle user registration with role-based setup
 * 
 * URL Parameters:
 * - ?role=company: Creates a company account (can search/unlock profiles)
 * - No role param: Creates standard user account
 * 
 * Flow:
 * 1. Check for role parameter in URL
 * 2. Pass role to Clerk as unsafeMetadata
 * 3. Webhook will process and set proper publicMetadata
 * 4. Redirect based on role after signup
 * 
 * Access: Public page
 */
export default function SignUpPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  
  // Determine redirect URL based on role
  const getAfterSignUpUrl = () => {
    if (role === "company") {
      return "/company-onboarding"; // Companies go to onboarding first
    }
    return "/"; // Default redirect
  };

  // Log role for debugging
  useEffect(() => {
    if (role) {
      console.log("[SignUp] Role parameter detected:", role);
    }
  }, [role]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4">
        {/* Role-specific messaging */}
        {role === "company" && (
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bebas-neue text-[#1e3a5f]">
              Create Your Company Account
            </h1>
            <p className="text-gray-600 mt-2">
              Start searching for board members immediately
            </p>
          </div>
        )}
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl",
              headerTitle: "hidden", // Hide default title when we have custom
              headerSubtitle: "hidden",
            },
            variables: {
              colorPrimary: "#6b93ce", // Match brand color
              colorBackground: "#ffffff",
              colorText: "#111827",
              colorTextSecondary: "#6b7280",
              colorInputBackground: "#f9fafb",
              colorInputText: "#111827",
              borderRadius: "0.5rem",
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl={getAfterSignUpUrl()}
          // Pass role as unsafeMetadata for webhook processing
          unsafeMetadata={{
            role: role || "user",
            signupSource: role === "company" ? "company-landing" : "direct"
          }}
        />
        
        {/* Additional help text */}
        <div className="text-center text-sm text-gray-500 mt-4">
          {role === "company" ? (
            <p>
              Looking to join as a board member?{" "}
              <a href="/signup" className="text-[#6b93ce] hover:underline">
                Apply here instead
              </a>
            </p>
          ) : (
            <p>
              Are you a company looking for board members?{" "}
              <a href="/companies" className="text-[#6b93ce] hover:underline">
                Learn more
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}