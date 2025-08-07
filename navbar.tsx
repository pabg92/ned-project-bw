"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Menu, X, Phone, Mail, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser, UserButton } from "@clerk/nextjs"
import { useRouter, usePathname } from "next/navigation"

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  
  const userRole = user?.publicMetadata?.role as string
  const userCredits = (user?.publicMetadata?.credits as number) || 0
  const shouldHideCompanyNav = pathname === '/' || pathname === '/signup'
  
  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { 
      name: "BOARD APPOINTMENTS", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Non-Executive Directors", href: "/board/ned" },
        { name: "Board Advisors", href: "/board/advisors" },
        { name: "Board Chairs", href: "/board/chairs" },
      ]
    },
    { 
      name: "FRACTIONAL EXECUTIVES", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Fractional CFO", href: "/fractional/cfo" },
        { name: "Fractional CMO", href: "/fractional/cmo" },
        { name: "Fractional COO", href: "/fractional/coo" },
        { name: "Fractional CTO", href: "/fractional/cto" },
      ]
    },
    { 
      name: "SECTORS", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Technology", href: "/sectors/technology" },
        { name: "Financial Services", href: "/sectors/financial" },
        { name: "Healthcare", href: "/sectors/healthcare" },
        { name: "Manufacturing", href: "/sectors/manufacturing" },
        { name: "Retail", href: "/sectors/retail" },
      ]
    },
    { 
      name: "ABOUT US", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Our Story", href: "/about/story" },
        { name: "Our Team", href: "/about/team" },
        { name: "Our Process", href: "/about/process" },
        { name: "Case Studies", href: "/about/cases" },
      ]
    },
    { name: "CONTACT", hasDropdown: false, href: "/contact" },
  ]

  const socialLinks = [
    { name: "LinkedIn", icon: "linkedin", url: "https://linkedin.com" },
    { name: "Twitter", icon: "twitter", url: "https://x.com" },
    { name: "Facebook", icon: "facebook", url: "https://facebook.com" },
    { name: "YouTube", icon: "youtube", url: "https://youtube.com" },
  ]

  const showAuthContent = mounted && isLoaded

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-gray-50 border-b border-gray-200 hidden xl:block">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between h-10">
            {/* Left side - Tagline */}
            <div className="text-sm text-gray-700">
              Your Growth Partner in Executive Excellence
            </div>
            
            {/* Right side - Contact and Social */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">Need help? Call us</span>
                <a href="tel:08453313031" className="font-semibold text-[#7394c7] hover:text-[#5a82bd] transition-colors flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  0845 331 3031
                </a>
              </div>
              
              <div className="flex items-center gap-1 border-l border-gray-300 pl-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon === 'linkedin' && (
                      <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    )}
                    {social.icon === 'twitter' && (
                      <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    )}
                    {social.icon === 'facebook' && (
                      <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    {social.icon === 'youtube' && (
                      <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-white sticky top-0 z-50 transition-shadow ${isScrolled ? 'shadow-lg' : 'shadow-md'}`} suppressHydrationWarning>
        <div className="max-w-[1920px] mx-auto px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-tna.svg"
                alt="TNA - Expert Talent Network"
                width={180}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-6">
              {/* Main Menu Items */}
              <nav className="flex items-center gap-1">
                {navigationItems.map((item) => (
                  <div key={item.name} className="relative">
                    {item.hasDropdown ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#7394c7] transition-colors flex items-center gap-1 rounded-lg hover:bg-gray-50"
                          >
                            {item.name}
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border-gray-200 shadow-xl rounded-lg mt-2 min-w-[200px]">
                          {item.dropdownItems?.map((subItem) => (
                            <DropdownMenuItem key={subItem.name} asChild>
                              <Link
                                href={subItem.href}
                                className="px-4 py-2.5 text-sm text-gray-700 hover:text-[#7394c7] hover:bg-gray-50 cursor-pointer"
                              >
                                {subItem.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#7394c7] transition-colors rounded-lg hover:bg-gray-50"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Search Button */}
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <Search className="h-5 w-5 text-gray-600" />
                </button>

                {/* Favorites */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-[#7394c7] hover:bg-gray-50 transition-all">
                  <Star className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Saved</span>
                </button>

                {/* Auth/CTA Button */}
                {showAuthContent && isSignedIn ? (
                  <div className="flex items-center gap-4">
                    {userRole === 'company' && !shouldHideCompanyNav && (
                      <Link href="/search">
                        <Button className="bg-[#7394c7] hover:bg-[#5a82bd] text-white px-6 py-2.5 text-sm font-semibold rounded-lg">
                          Search Experts
                        </Button>
                      </Link>
                    )}
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <Link href="/companies">
                    <Button className="bg-[#7394c7] hover:bg-[#5a82bd] text-white px-6 py-2.5 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                      Book Consultation
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden fixed inset-0 top-[80px] z-50 bg-white">
            <div className="p-6 space-y-4 overflow-y-auto h-full">
              {/* Mobile contact info */}
              <div className="pb-4 border-b border-gray-200">
                <a href="tel:08453313031" className="flex items-center gap-2 text-[#7394c7] font-semibold">
                  <Phone className="h-5 w-5" />
                  0845 331 3031
                </a>
              </div>

              {/* Mobile navigation items */}
              {navigationItems.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                  {item.dropdownItems && (
                    <div className="pl-4 space-y-2">
                      {item.dropdownItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block py-2 text-sm text-gray-600 hover:text-[#7394c7]"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  {!item.hasDropdown && (
                    <Link
                      href={item.href || '#'}
                      className="block py-2 text-sm text-gray-600 hover:text-[#7394c7]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      View {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile CTA */}
              <div className="pt-4 border-t border-gray-200">
                <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#7394c7] hover:bg-[#5a82bd] text-white py-3 text-base font-semibold rounded-lg">
                    Book Consultation
                  </Button>
                </Link>
              </div>

              {/* Mobile social links */}
              <div className="flex justify-center gap-4 pt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <span className="sr-only">{social.name}</span>
                    {/* Social icons here - simplified for mobile */}
                    <span className="text-xs font-bold text-gray-600">
                      {social.name.charAt(0)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}