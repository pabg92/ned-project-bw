"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Search, CreditCard, Heart, Bell, User, ChevronDown, 
  Package, TrendingUp, AlertTriangle, Menu, X, History,
  BookmarkCheck, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface SearchNavbarProps {
  credits: number
  shortlistCount: number
  savedSearchCount: number
}

export default function SearchNavbar({ 
  credits = 10, 
  shortlistCount = 0,
  savedSearchCount = 0 
}: SearchNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isLowCredits = credits < 5

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo - Smaller for search context */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="BoardChampions"
                  width={180}
                  height={36}
                  className="h-8 w-auto"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-6">
                <Link 
                  href="/search" 
                  className="text-[#6b93ce] font-medium border-b-2 border-[#6b93ce] pb-1"
                >
                  Search
                </Link>
                
                <Link 
                  href="/search/shortlist" 
                  className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
                >
                  My Shortlist
                  {shortlistCount > 0 && (
                    <Badge className="bg-[#6b93ce] text-white text-xs px-1.5 py-0 h-5">
                      {shortlistCount}
                    </Badge>
                  )}
                </Link>
                
                <Link 
                  href="/search/saved" 
                  className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
                >
                  Saved Searches
                  {savedSearchCount > 0 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                      {savedSearchCount}
                    </Badge>
                  )}
                </Link>
                
                <Link 
                  href="/search/alerts" 
                  className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                >
                  <Bell className="h-4 w-4" />
                  Alerts
                </Link>
              </nav>
            </div>

            {/* Right side - Credits and User */}
            <div className="flex items-center gap-4">
              {/* Credits Display - More prominent */}
              <div className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-full",
                isLowCredits ? "bg-red-50 border border-red-200" : "bg-gray-50"
              )}>
                {isLowCredits && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <div className="flex items-center gap-2">
                  <CreditCard className={cn(
                    "h-4 w-4",
                    isLowCredits ? "text-red-500" : "text-[#6b93ce]"
                  )} />
                  <span className={cn(
                    "font-semibold",
                    isLowCredits ? "text-red-700" : "text-gray-700"
                  )}>
                    {credits} Credits
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className={cn(
                        "text-xs px-3 py-1 h-7",
                        isLowCredits 
                          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                          : "bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
                      )}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Buy Credits
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Choose a package</p>
                        <p className="text-xs text-gray-500">Unlock more executive profiles</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Credit Packages */}
                    <DropdownMenuItem className="flex items-center justify-between py-3 cursor-pointer">
                      <div>
                        <p className="font-medium">Starter</p>
                        <p className="text-sm text-gray-500">5 Credits</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">£49</p>
                        <p className="text-xs text-gray-500">£9.80/credit</p>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="flex items-center justify-between py-3 cursor-pointer bg-blue-50">
                      <div>
                        <p className="font-medium">Professional</p>
                        <p className="text-sm text-gray-500">20 Credits</p>
                        <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                          Most Popular
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">£149</p>
                        <p className="text-xs text-gray-500">£7.45/credit</p>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="flex items-center justify-between py-3 cursor-pointer">
                      <div>
                        <p className="font-medium">Enterprise</p>
                        <p className="text-sm text-gray-500">50 Credits</p>
                        <Badge className="mt-1 bg-purple-100 text-purple-800 text-xs">
                          Best Value
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">£299</p>
                        <p className="text-xs text-gray-500">£5.98/credit</p>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center py-3">
                      <Link href="/pricing" className="text-[#6b93ce] font-medium w-full">
                        View All Plans & Subscribe →
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">My Account</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>john.doe@example.com</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing & Credits
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <History className="mr-2 h-4 w-4" />
                    Search History
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                    Saved Profiles
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/30" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="fixed right-0 top-16 h-full w-full max-w-sm bg-white shadow-xl">
            <div className="p-6 space-y-6">
              {/* Mobile Credits Display */}
              <div className={cn(
                "p-4 rounded-lg text-center",
                isLowCredits ? "bg-red-50 border border-red-200" : "bg-gray-50"
              )}>
                <p className="text-sm text-gray-600 mb-1">Available Credits</p>
                <p className={cn(
                  "text-2xl font-bold mb-3",
                  isLowCredits ? "text-red-600" : "text-gray-900"
                )}>
                  {credits}
                </p>
                <Button className="w-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white">
                  <Package className="h-4 w-4 mr-2" />
                  Buy More Credits
                </Button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                <Link
                  href="/search"
                  className="flex items-center justify-between p-3 rounded-lg bg-blue-50 text-[#6b93ce] font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Search
                  <Search className="h-5 w-5" />
                </Link>
                
                <Link
                  href="/search/shortlist"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    My Shortlist
                    {shortlistCount > 0 && (
                      <Badge className="bg-[#6b93ce] text-white">
                        {shortlistCount}
                      </Badge>
                    )}
                  </span>
                  <Heart className="h-5 w-5 text-gray-400" />
                </Link>
                
                <Link
                  href="/search/saved"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    Saved Searches
                    {savedSearchCount > 0 && (
                      <Badge variant="outline">
                        {savedSearchCount}
                      </Badge>
                    )}
                  </span>
                  <BookmarkCheck className="h-5 w-5 text-gray-400" />
                </Link>
                
                <Link
                  href="/search/alerts"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Alerts
                  <Bell className="h-5 w-5 text-gray-400" />
                </Link>
              </div>

              {/* Mobile User Actions */}
              <div className="border-t pt-6 space-y-3">
                <Link
                  href="/account"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 text-gray-400" />
                  Account Settings
                </Link>
                <button
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-red-600 w-full text-left"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log out
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}