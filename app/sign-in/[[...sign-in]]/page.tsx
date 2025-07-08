"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Users, Loader2 } from "lucide-react";

/**
 * Sign In Page with Role-Based Redirects
 * 
 * Purpose: Handle user authentication with intelligent routing based on user role
 * 
 * Redirect Logic:
 * - Company users → /search (to browse candidates)
 * - Admin users → /admin (dashboard)
 * - Candidate users → /profile (future feature)
 * - Unknown role → / (homepage)
 * 
 * URL Parameters:
 * - ?redirect_url: Where to go after sign in (if authorized)
 * 
 * Access: Public page
 */
export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  // Get user role for display
  const userRole = user?.publicMetadata?.role as string;
  
  // Log for debugging
  useEffect(() => {
    if (isLoaded) {
      console.log("[SignIn] Page loaded:", {
        isSignedIn,
        userRole,
        redirectUrl,
        publicMetadata: user?.publicMetadata
      });
    }
  }, [isLoaded, isSignedIn, userRole, redirectUrl, user]);
  
  // Handle manual redirect when user clicks continue
  const handleContinue = () => {
    // If there's a specific redirect URL, use it
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    
    // Otherwise, redirect based on role
    switch (userRole) {
      case "company":
        router.push("/search");
        break;
      case "admin":
        router.push("/admin");
        break;
      case "candidate":
        router.push("/profile");
        break;
      default:
        router.push("/");
    }
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b93ce] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already signed in, show a different UI
  if (isSignedIn && user) {
    const roleDisplay = userRole === 'company' ? 'Company Account' : 
                       userRole === 'admin' ? 'Administrator' : 
                       userRole === 'candidate' ? 'Board Member' : 'User';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <h1 className="text-2xl font-bebas-neue text-[#4a4a4a]">
                  Already Signed In
                </h1>
                <p className="text-gray-600">
                  You're signed in as <strong>{user.emailAddresses[0]?.emailAddress}</strong>
                </p>
                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <Users className="h-4 w-4 text-[#6b93ce]" />
                  <span className="text-sm font-medium">{roleDisplay}</span>
                </div>
                
                <div className="pt-4 space-y-3">
                  {userRole === 'company' || userRole === 'admin' ? (
                    <Button 
                      onClick={handleContinue}
                      className="w-full bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
                    >
                      Continue to {userRole === 'company' ? 'Search' : 'Admin Dashboard'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                        <p className="font-medium mb-1">Need a company account?</p>
                        <p>To search for board members, you need to upgrade to a company account.</p>
                      </div>
                      
                      <Button 
                        onClick={async () => {
                          setIsUpgrading(true);
                          try {
                            const response = await fetch('/api/user/upgrade-role', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            
                            if (response.ok) {
                              // Reload to get updated metadata
                              window.location.href = '/search';
                            } else {
                              console.error('Failed to upgrade role');
                              alert('Failed to upgrade account. Please try again.');
                            }
                          } catch (error) {
                            console.error('Error upgrading role:', error);
                            alert('An error occurred. Please try again.');
                          } finally {
                            setIsUpgrading(false);
                          }
                        }}
                        disabled={isUpgrading}
                        className="w-full bg-[#6b93ce] hover:bg-[#5a82bd] text-white"
                      >
                        {isUpgrading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Upgrading...
                          </>
                        ) : (
                          <>
                            Upgrade to Company Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    Go to Homepage
                  </Button>
                  
                  {/* Development mode: Set role manually */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/set-admin')}
                      className="w-full text-sm"
                    >
                      Set Admin Role (Dev Only)
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show sign-in form for non-authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bebas-neue text-[#4a4a4a]">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to your Board Champions account
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary: "bg-[#6b93ce] hover:bg-[#5a82bd]",
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
          path="/sign-in"
          signUpUrl="/sign-up"
          // Let our custom logic handle redirects
          afterSignInUrl="/"
        />
        
        {/* Help text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Don't have an account?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <a 
              href="/sign-up?role=company" 
              className="text-[#6b93ce] hover:underline"
            >
              Sign up as a company
            </a>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <a 
              href="/signup" 
              className="text-[#6b93ce] hover:underline"
            >
              Apply as a board member
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}