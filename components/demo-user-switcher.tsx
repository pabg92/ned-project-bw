"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useUser, useClerk } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DemoUser {
  id: string
  name: string
  role: string
  credits?: number
  description: string
  color: string
}

const DEMO_USERS: DemoUser[] = [
  {
    id: "guest",
    name: "Guest User",
    role: "public",
    description: "Not logged in - limited access",
    color: "bg-gray-500"
  },
  {
    id: "company-with-credits",
    name: "Company User",
    role: "company",
    credits: 10,
    description: "Has credits to unlock profiles",
    color: "bg-blue-500"
  },
  {
    id: "company-no-credits",
    name: "Company User (No Credits)",
    role: "company", 
    credits: 0,
    description: "Needs to purchase credits",
    color: "bg-orange-500"
  },
  {
    id: "admin",
    name: "Admin User",
    role: "admin",
    description: "Full access to all features",
    color: "bg-purple-500"
  }
]

export default function DemoUserSwitcher() {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const [isLoading, setIsLoading] = useState(false)
  
  // Only show in development or demo mode
  const isDemoMode = process.env.NODE_ENV === 'development' || 
                     window.location.hostname.includes('demo') ||
                     window.location.search.includes('demo=true')
  
  if (!isDemoMode) return null
  
  // Get current user type
  const currentUserType = !isSignedIn 
    ? "guest"
    : user?.publicMetadata?.role === 'admin'
    ? "admin"
    : user?.publicMetadata?.role === 'company' && (user?.publicMetadata?.credits as number) > 0
    ? "company-with-credits"
    : "company-no-credits"
    
  const currentUser = DEMO_USERS.find(u => u.id === currentUserType) || DEMO_USERS[0]
  
  const handleUserSwitch = async (demoUser: DemoUser) => {
    setIsLoading(true)
    
    try {
      // If switching to guest, sign out
      if (demoUser.id === "guest") {
        await signOut()
        window.location.reload()
        return
      }
      
      // For other users, we'd need to implement a demo auth system
      // For now, just show an alert with instructions
      alert(`To demo as ${demoUser.name}:\n\n1. ${!isSignedIn ? 'Sign in with a test account' : 'Stay signed in'}\n2. Your account needs the "${demoUser.role}" role${demoUser.credits !== undefined ? ` and ${demoUser.credits} credits` : ''}\n\nContact admin to set up demo accounts.`)
      
    } catch (error) {
      console.error('Error switching demo user:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white/95 backdrop-blur-sm shadow-lg border-2"
            disabled={isLoading}
          >
            <div className={cn("w-3 h-3 rounded-full mr-2", currentUser.color)} />
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline-block mr-2">Demo Mode: {currentUser.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Switch Demo User</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {DEMO_USERS.map((demoUser) => (
            <DropdownMenuItem
              key={demoUser.id}
              onClick={() => handleUserSwitch(demoUser)}
              className={cn(
                "cursor-pointer",
                currentUser.id === demoUser.id && "bg-gray-100"
              )}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={cn("w-3 h-3 rounded-full mt-1.5", demoUser.color)} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{demoUser.name}</span>
                    {demoUser.credits !== undefined && (
                      <Badge variant="secondary" className="ml-2">
                        {demoUser.credits} credits
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {demoUser.description}
                  </p>
                </div>
                {currentUser.id === demoUser.id && (
                  <Badge variant="default" className="ml-2">Current</Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-xs text-gray-500">
              Demo mode helps showcase different user perspectives. 
              In production, users would have proper authentication.
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}