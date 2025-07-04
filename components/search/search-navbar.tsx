"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { 
  Search, CreditCard, Heart, Bell, User, ChevronDown, 
  Package, TrendingUp, AlertTriangle, Menu, X, History,
  BookmarkCheck, Zap, LogOut, Settings
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
  const router = useRouter()
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Get credits from user metadata or use default
  const userCredits = user?.publicMetadata?.credits as number || credits
  const isLowCredits = userCredits < 5
  
  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-[#4a4a4a] to-[#5a5a5a] text-white sticky top-0 z-50 shadow-lg">
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
                  className="text-white font-medium border-b-2 border-white pb-1"
                >
                  Search
                </Link>
                
                <Link 
                  href="/search/shortlist" 
                  className="text-white/80 hover:text-white font-medium flex items-center gap-2 transition-colors"
                >
                  My Shortlist
                  {shortlistCount > 0 && (
                    <Badge className="bg-white text-[#4a4a4a] text-xs px-1.5 py-0 h-5">
                      {shortlistCount}
                    </Badge>
                  )}
                </Link>
                
                <Link 
                  href="/search/saved" 
                  className="text-white/80 hover:text-white font-medium flex items-center gap-2 transition-colors"
                >
                  Saved Searches
                  {savedSearchCount > 0 && (
                    <Badge className="bg-white/20 text-white border-white/30 text-xs px-1.5 py-0 h-5">
                      {savedSearchCount}
                    </Badge>
                  )}
                </Link>
                
                <Link 
                  href="/search/alerts" 
                  className="text-white/80 hover:text-white font-medium flex items-center gap-1 transition-colors"
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
                isLowCredits ? "bg-red-500/20 border border-red-300/50" : "bg-white/10 border border-white/20"
              )}>
                {isLowCredits && (
                  <AlertTriangle className="h-4 w-4 text-red-300" />
                )}
                <div className="flex items-center gap-2">
                  <CreditCard className={cn(
                    "h-4 w-4",
                    isLowCredits ? "text-red-300" : "text-white"
                  )} />
                  <span className={cn(
                    "font-semibold",
                    isLowCredits ? "text-red-100" : "text-white"
                  )}>
                    {userCredits} Credits
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
              {isLoaded && isSignedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                      {user.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt={user.firstName || "User"} 
                          className="h-5 w-5 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <span className="hidden sm:inline">
                        {user.firstName || "My Account"}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.primaryEmailAddress?.emailAddress}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile/edit")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/billing")}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing & Credits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/search/history")}>
                      <History className="mr-2 h-4 w-4" />
                      Search History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/search/saved")}>
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      Saved Profiles
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => router.push("/sign-in?redirect=/search")}
                  >
                    Sign in
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
                    onClick={() => router.push("/sign-up?redirect=/search")}
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10"
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
          <nav className="fixed right-0 top-16 h-full w-full max-w-sm bg-gradient-to-b from-[#4a4a4a] to-[#5a5a5a] shadow-xl">
            <div className="p-6 space-y-6">
              {/* Mobile Credits Display */}
              <div className={cn(
                "p-4 rounded-lg text-center",
                isLowCredits ? "bg-red-500/20 border border-red-300/50" : "bg-white/10 border border-white/20"
              )}>
                <p className="text-sm text-white/80 mb-1">Available Credits</p>
                <p className={cn(
                  "text-2xl font-bold mb-3",
                  isLowCredits ? "text-red-300" : "text-white"
                )}>
                  {userCredits}
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
                {isSignedIn ? (
                  <>
                    <div className="p-3 bg-white/10 rounded-lg text-white">
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-white/70">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                    <Link
                      href="/profile/edit"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      Profile Settings
                    </Link>
                    <button
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-red-300 w-full text-left"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleSignOut()
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push("/sign-in?redirect=/search")
                      }}
                    >
                      Sign in
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push("/sign-up?redirect=/search")
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}