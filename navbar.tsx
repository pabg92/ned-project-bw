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
    { name: "BOARD", hasDropdown: true },
    { name: "FRACTIONAL", hasDropdown: true },
    { name: "NED", hasDropdown: true },
    { name: "SECTORS", hasDropdown: true, isActive: true },
    { name: "PROJECT/CONTRACT", hasDropdown: true },
    { name: "ABOUT US", hasDropdown: true },
    { name: "CONTACT US", hasDropdown: true },
  ]

  return (
    <nav className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white w-full shadow-lg">
      <div className="w-full">
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
                            item.isActive ? "bg-[#6b93ce] hover:bg-[#5a82bd] shadow-lg" : ""
                          }`}
                        >
                          {item.name}
                          <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
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

            {/* Right Side - Social Icons and Button */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Social Media Icons */}
              <div className="flex items-center space-x-2">
                <Link
                  href="#"
                  className="w-10 h-10 bg-[#6b93ce] rounded-full flex items-center justify-center hover:bg-[#5a82bd] hover:scale-110 transition-all duration-300 shadow-lg"
                >
                  <Image src="/linkedin-icon.svg" alt="LinkedIn" width={16} height={16} className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 bg-[#6b93ce] rounded-full flex items-center justify-center hover:bg-[#5a82bd] hover:scale-110 transition-all duration-300 shadow-lg"
                >
                  <Image src="/x-icon.svg" alt="X (formerly Twitter)" width={16} height={16} className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 bg-[#6b93ce] rounded-full flex items-center justify-center hover:bg-[#5a82bd] hover:scale-110 transition-all duration-300 shadow-lg"
                >
                  <Image src="/youtube-icon.svg" alt="YouTube" width={16} height={16} className="w-4 h-4" />
                </Link>
              </div>

              {/* MY EXPERTS Button */}
              <Button className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white px-8 py-3 text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-full">
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
