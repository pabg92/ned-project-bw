"use client"

import { useState } from "react"
import { CreditCard, Package, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SearchHeader() {
  // Mock credits data - will be replaced with actual user data
  const [credits, setCredits] = useState(10)
  
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Page Title */}
          <div>
            <h1 className="text-2xl font-bebas-neue text-gray-900">
              Executive Search Portal
            </h1>
          </div>
          
          {/* Right side - Credits and User Info */}
          <div className="flex items-center gap-6">
            {/* Credits Display */}
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
              <CreditCard className="h-4 w-4 text-[#6b93ce]" />
              <span className="text-sm font-medium text-gray-700">
                {credits} Credits
              </span>
              <Button
                size="sm"
                className="ml-2 bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white text-xs px-3 py-1 h-7"
              >
                <Package className="h-3 w-3 mr-1" />
                Buy More
              </Button>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">My Account</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}