"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const navigationItems = [
    { 
      name: "BOARD", 
      hasDropdown: true,
      dropdownItems: [
        { label: "Board Appointments", href: "#" },
        { label: "Board Assessment", href: "#" },
        { label: "Board Development", href: "#" },
        { label: "Board Diversity", href: "#" },
        { label: "Board Evaluation", href: "#" },
        { label: "Board Recruitment", href: "#" },
        { label: "Board Search", href: "#" },
        { label: "Board Strategy", href: "#" }
      ]
    },
    { 
      name: "FRACTIONAL", 
      hasDropdown: true,
      dropdownItems: [
        { label: "Fractional CEO", href: "#" },
        { label: "Fractional CFO", href: "#" },
        { label: "Fractional CMO", href: "#" },
        { label: "Fractional COO", href: "#" },
        { label: "Fractional CTO", href: "#" },
        { label: "Fractional CHRO", href: "#" },
        { label: "Fractional CIO", href: "#" },
        { label: "Fractional CPO", href: "#" }
      ]
    },
    { 
      name: "NED", 
      hasDropdown: true,
      dropdownItems: [
        { label: "Non-Executive Director", href: "#" },
        { label: "Independent Director", href: "#" },
        { label: "Advisory Board", href: "#" },
        { label: "Board Advisor", href: "#" },
        { label: "Senior Advisor", href: "#" },
        { label: "Strategic Advisor", href: "#" }
      ]
    },
    { 
      name: "SECTORS", 
      hasDropdown: true, 
      isActive: true,
      dropdownItems: [
        { label: "Technology", href: "#" },
        { label: "Financial Services", href: "#" },
        { label: "Healthcare", href: "#" },
        { label: "Retail & Consumer", href: "#" },
        { label: "Manufacturing", href: "#" },
        { label: "Energy & Utilities", href: "#" },
        { label: "Real Estate", href: "#" },
        { label: "Professional Services", href: "#" },
        { label: "Media & Entertainment", href: "#" },
        { label: "Education", href: "#" },
        { label: "Non-Profit", href: "#" },
        { label: "Government", href: "#" }
      ]
    },
    { 
      name: "PROJECT/CONTRACT", 
      hasDropdown: true,
      dropdownItems: [
        { label: "Interim Management", href: "#" },
        { label: "Project Leadership", href: "#" },
        { label: "Transformation", href: "#" },
        { label: "Turnaround", href: "#" },
        { label: "Change Management", href: "#" },
        { label: "Digital Transformation", href: "#" },
        { label: "M&A Integration", href: "#" },
        { label: "Crisis Management", href: "#" }
      ]
    },
    { 
      name: "ABOUT US", 
      hasDropdown: true,
      dropdownItems: [
        { label: "Our Story", href: "#" },
        { label: "Our Team", href: "#" },
        { label: "Our Values", href: "#" },
        { label: "Our Process", href: "#" },
        { label: "Testimonials", href: "#" },
        { label: "Case Studies", href: "#" },
        { label: "News & Insights", href: "#" },
        { label: "Careers", href: "#" }
      ]
    },
    { 
      name: "CONTACT US", 
      hasDropdown: true,
      dropdownItems: [
        { label: "Get In Touch", href: "#" },
        { label: "Book Consultation", href: "#" },
        { label: "Office Locations", href: "#" },
        { label: "Support", href: "#" }
      ]
    },
  ]

  return (
    <nav className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white w-full shadow-lg overflow-x-hidden">
      <div className="w-full overflow-x-hidden">
        <div className="container max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center h-20 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="BoardChampions - Winning Expert Talent"
                width={200}
                height={40}
                className="h-10 sm:h-12 w-auto max-w-[160px] sm:max-w-[200px] lg:max-w-[240px] object-contain"
              />
            </Link>
          </div>

          {/* Navigation Menu - Desktop Only */}
          <div className="hidden xl:flex items-center flex-1 justify-end">
            <div className="flex items-center justify-center flex-1 max-w-4xl mx-auto space-x-1">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`text-white hover:bg-white/20 hover:scale-105 px-3 py-2 text-base font-bebas-neue tracking-wider flex items-center gap-2 min-w-[100px] justify-center transition-all duration-300 rounded-md ${
                            item.isActive ? "bg-[#9eb4d8] hover:bg-[#8ea4c8] shadow-lg" : ""
                          }`}
                        >
                          {item.name}
                          <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="bg-white border-none shadow-2xl rounded-lg mt-2 p-6"
                        style={{ 
                          minWidth: item.name === "SECTORS" ? "600px" : "280px",
                          maxWidth: item.name === "SECTORS" ? "800px" : "400px"
                        }}
                      >
                        <div className={item.name === "SECTORS" ? "grid grid-cols-3 gap-4" : "space-y-1"}>
                          {item.dropdownItems?.map((dropdownItem, index) => (
                            <Link 
                              key={index} 
                              href={dropdownItem.href} 
                              className="block px-3 py-2 text-gray-700 hover:bg-[#9eb4d8]/10 hover:text-[#9eb4d8] rounded-md transition-all duration-200 font-medium"
                            >
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
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

            {/* Right Side - Social Icons and Button */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Social Media Icons */}
              <div className="flex items-center space-x-2">
                <Link
                  href="#"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300"
                >
                  <Image src="/linkedin-icon.svg" alt="LinkedIn" width={40} height={40} className="w-10 h-10" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300"
                >
                  <Image src="/x-icon.svg" alt="X (formerly Twitter)" width={40} height={40} className="w-10 h-10" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-all duration-300"
                >
                  <Image src="/youtube-icon.svg" alt="YouTube" width={40} height={40} className="w-10 h-10" />
                </Link>
              </div>

              {/* MY EXPERTS Button */}
              <Button className="bg-[#9eb4d8] hover:bg-[#8ea4c8] text-white px-8 py-3 text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-full">
                MY EXPERTS
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex-shrink-0 ml-auto">
            <Button variant="ghost" className="text-white hover:bg-white/20 p-3 rounded-lg transition-all duration-300" size="sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
