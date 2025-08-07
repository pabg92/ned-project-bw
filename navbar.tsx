"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Menu, X, CreditCard, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser, UserButton } from "@clerk/nextjs"
import { useRouter, usePathname } from "next/navigation"

/**
 * Main Navigation Bar
 * 
 * This navbar adapts based on user authentication state and role:
 * - Public users: See marketing navigation and CTAs
 * - Company users: See search link and credit balance
 * - Admin users: See admin dashboard link
 * - All authenticated users: See user button for account management
 */
export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  
  // Get user role and credits from metadata
  const userRole = user?.publicMetadata?.role as string
  const userCredits = (user?.publicMetadata?.credits as number) || 0
  
  // Check if we're on pages where company nav should be hidden
  const shouldHideCompanyNav = pathname === '/' || pathname === '/signup'
  
  // Ensure component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigationItems = [
    { name: "BOARD", hasDropdown: true },
    { name: "FRACTIONAL", hasDropdown: true },
    { name: "NED", hasDropdown: true },
    { name: "SECTORS", hasDropdown: true, isActive: true },
    { name: "PROJECT/CONTRACT", hasDropdown: true },
    { name: "ABOUT US", hasDropdown: true },
    { name: "CONTACT US", hasDropdown: true },
  ]

  // Don't render auth-dependent content until mounted to prevent flicker
  const showAuthContent = mounted && isLoaded

  return (
    <>
      <nav className="text-white shadow-lg overflow-hidden" style={{ background: 'linear-gradient(to bottom, #4a4a4a, #5a5a5a)' }} suppressHydrationWarning>
        <div className="w-full max-w-[100vw] overflow-hidden">
          <div className="px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="flex items-center h-20 gap-6 max-w-[1920px] mx-auto">
            {/* Logo */}
            <div className="flex-shrink-0 min-w-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="BoardChampions - Winning Expert Talent"
                  width={260}
                  height={52}
                  className="h-12 sm:h-14 lg:h-16 w-auto max-w-[200px] sm:max-w-[240px] lg:max-w-[280px] object-contain"
                />
              </Link>
            </div>

            {/* Navigation Menu - Desktop Only */}
            <div className="hidden xl:flex items-center flex-1 justify-between min-w-0">
              <div className="flex items-center justify-center flex-1 space-x-1 xl:space-x-2 2xl:space-x-3 min-w-0">
                {navigationItems.map((item) => (
                  <div key={item.name} className="relative">
                    {item.hasDropdown ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`text-white hover:bg-white/20 hover:scale-105 px-2 xl:px-3 py-2 text-sm xl:text-base font-bebas-neue tracking-wider flex items-center gap-1 xl:gap-2 justify-center transition-all duration-300 rounded-md ${
                              item.isActive ? "bg-[#6b93ce] hover:bg-[#5a82bd] shadow-lg" : ""
                            }`}
                          >
                            <span className="whitespace-nowrap">{item.name}</span>
                            <ChevronDown className="h-3 w-3 xl:h-4 xl:w-4 transition-transform duration-300 group-hover:rotate-180 flex-shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gradient-to-b from-[#6b93ce] to-[#5a82bd] border-none shadow-xl rounded-lg mt-2">
                          <DropdownMenuItem className="text-white hover:bg-white/20 font-medium px-4 py-3 transition-all duration-300">{item.name}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link
                        href="#"
                        className={`text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-bebas-neue tracking-wider ${
                          item.isActive ? "bg-[#6b93ce]" : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Right Side - Dynamic based on auth state */}
              <div className="flex items-center space-x-4 ml-auto flex-shrink-0">
                {/* Auth buttons with consistent spacing */}
                {!showAuthContent ? (
                  // Show placeholder while loading to prevent flicker
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-10 bg-white/10 rounded-md animate-pulse"></div>
                    <div className="w-24 h-10 bg-white/10 rounded-md animate-pulse"></div>
                  </div>
                ) : isSignedIn ? (
                  <>
                    {/* Company User: Show Search and Credits (not on homepage or signup) */}
                    {userRole === 'company' && !shouldHideCompanyNav && (
                      <>
                        <Link href="/search">
                          <Button 
                            variant="ghost" 
                            className="text-white hover:bg-white/20 flex items-center gap-2"
                          >
                            <Search className="h-4 w-4" />
                            Search Candidates
                          </Button>
                        </Link>
                        <Link href="/credits">
                          <Button 
                            variant="outline" 
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20 flex items-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            {userCredits} Credits
                          </Button>
                        </Link>
                      </>
                    )}
                    
                    {/* Admin User: Show Admin Link */}
                    {userRole === 'admin' && (
                      <Link href="/admin">
                        <Button 
                          variant="ghost" 
                          className="text-white hover:bg-white/20 flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    
                    {/* User Button for all authenticated users */}
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10"
                        }
                      }}
                    />
                  </>
                ) : (
                  <>
                    {/* Non-authenticated users */}
                    <div className="flex items-center space-x-3">
                      <Link href="/companies">
                        <Button 
                          variant="outline" 
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-medium transition-all duration-300"
                        >
                          For Companies
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button 
                          variant="outline" 
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-medium transition-all duration-300"
                        >
                          Join as Board Member
                        </Button>
                      </Link>
                      <Link href="/sign-in">
                        <Button className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white px-6 py-2 text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-full">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
              
              {/* Divider */}
              <div className="h-8 w-px bg-white/20 mx-3" />
              
              {/* Social Media Icons - Desktop Only */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#6b93ce] transition-all duration-300 group"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </Link>
                  <Link
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#6b93ce] transition-all duration-300 group"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </Link>
                  <Link
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#6b93ce] transition-all duration-300 group"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </Link>
                </div>
            </div>

            {/* Mobile menu button - Accessible 48x48px touch target */}
            <div className="xl:hidden flex-shrink-0 ml-auto">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-3 rounded-lg transition-all duration-300 min-w-[48px] min-h-[48px]" 
                size="icon"
                aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-sm shadow-xl" style={{ background: 'linear-gradient(to bottom, #4a4a4a, #5a5a5a)' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <Image
                src="/logo.svg"
                alt="BoardChampions"
                width={180}
                height={36}
                className="h-10 w-auto"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  <Button
                    variant="ghost"
                    className={`w-full text-left text-white hover:bg-white/10 px-4 py-3 text-lg font-bebas-neue tracking-wider justify-between ${
                      item.isActive ? "bg-[#6b93ce]" : ""
                    }`}
                    onClick={() => {
                      if (!item.hasDropdown) {
                        setIsMobileMenuOpen(false)
                      }
                    }}
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>
              ))}
              
              {/* Auth-specific mobile menu items */}
              <div className="border-t border-white/10 mt-6 pt-6">
                {!showAuthContent ? (
                  // Show loading state
                  <div className="space-y-3">
                    <div className="w-full h-12 bg-white/10 rounded-md animate-pulse"></div>
                    <div className="w-full h-12 bg-white/10 rounded-md animate-pulse"></div>
                  </div>
                ) : isSignedIn ? (
                  <>
                    {userRole === 'company' && !shouldHideCompanyNav && (
                      <>
                        <Link href="/search" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full text-left text-white hover:bg-white/10 px-4 py-3 justify-start gap-3">
                            <Search className="h-5 w-5" />
                            Search Candidates
                          </Button>
                        </Link>
                        <Link href="/credits" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full text-left text-white hover:bg-white/10 px-4 py-3 justify-start gap-3">
                            <CreditCard className="h-5 w-5" />
                            {userCredits} Credits
                          </Button>
                        </Link>
                      </>
                    )}
                    {userRole === 'admin' && (
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full text-left text-white hover:bg-white/10 px-4 py-3 justify-start gap-3">
                          <Users className="h-5 w-5" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button 
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        // Sign out logic handled by UserButton
                      }}
                      className="w-full text-left text-white hover:bg-white/10 px-4 py-3 justify-start mt-4"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full text-left text-white hover:bg-white/10 px-4 py-3 justify-start">
                        For Companies
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full text-left text-white hover:bg-white/10 px-4 py-3 justify-start">
                        Join as Board Member
                      </Button>
                    </Link>
                    <Link href="/sign-in" className="block mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white px-8 py-3 text-lg font-bold shadow-lg">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              
              {/* Social Icons */}
              <div className="flex items-center justify-center space-x-4 mt-8">
                <Link
                  href="#"
                  className="w-12 h-12 bg-[#6b93ce] rounded-full flex items-center justify-center hover:bg-[#5a82bd]"
                >
                  <Image src="/linkedin-icon.svg" alt="LinkedIn" width={20} height={20} />
                </Link>
                <Link
                  href="#"
                  className="w-12 h-12 bg-[#6b93ce] rounded-full flex items-center justify-center hover:bg-[#5a82bd]"
                >
                  <Image src="/x-icon.svg" alt="X" width={20} height={20} />
                </Link>
                <Link
                  href="#"
                  className="w-12 h-12 bg-[#6b93ce] rounded-full flex items-center justify-center hover:bg-[#5a82bd]"
                >
                  <Image src="/youtube-icon.svg" alt="YouTube" width={20} height={20} />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
