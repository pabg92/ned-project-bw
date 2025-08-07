"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { 
  Search, Mic, X, Clock, TrendingUp, Sparkles, 
  ChevronDown, Filter, Save, Command
} from "lucide-react"
import { Input } from "@/components/ui/input"
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

interface Props {
  value: string
  onChange: (value: string) => void
  onSaveSearch: () => void
  onDebouncedChange?: (value: string) => void
}

// Recent searches will be stored in localStorage
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('boardchampions-recent-searches')
  return stored ? JSON.parse(stored).slice(0, 5) : []
}

const saveRecentSearch = (search: string) => {
  if (typeof window === 'undefined' || !search.trim()) return
  const current = getRecentSearches()
  const updated = [search, ...current.filter(s => s !== search)].slice(0, 10)
  localStorage.setItem('boardchampions-recent-searches', JSON.stringify(updated))
}

const searchTemplates = [
  { 
    name: "Digital CFO", 
    query: "CFO AND (Digital OR Technology) AND Financial Services",
    icon: "💰"
  },
  { 
    name: "ESG Board Expert", 
    query: "Board AND (ESG OR Sustainability) AND Experience:20+",
    icon: "🌱"
  },
  { 
    name: "Tech Scale-up Advisor", 
    query: "Advisor AND Technology AND (Startup OR Scale-up)",
    icon: "🚀"
  },
  { 
    name: "Healthcare NED", 
    query: "Non-Executive Director AND Healthcare AND (NHS OR Private)",
    icon: "🏥"
  }
]

export default function EnhancedSearchBar({ value, onChange, onSaveSearch, onDebouncedChange }: Props) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{ type: string; value: string }>>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])
  
  // Fetch suggestions when input changes
  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current)
    }
    
    if (value.length > 1) {
      setIsLoadingSuggestions(true)
      suggestionTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`)
          const data = await response.json()
          if (data.success) {
            setSearchSuggestions(data.data)
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        } finally {
          setIsLoadingSuggestions(false)
        }
      }, 200) // 200ms delay for suggestions
    } else {
      setSearchSuggestions([])
      setIsLoadingSuggestions(false)
    }
    
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current)
      }
    }
  }, [value])

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    saveRecentSearch(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
    // Update recent searches
    setRecentSearches(getRecentSearches())
  }

  const handleTemplateClick = (template: typeof searchTemplates[0]) => {
    onChange(template.query)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "/" && e.metaKey) {
      e.preventDefault()
      inputRef.current?.focus()
    }
  }

  // Debounced change handler
  const handleInputChange = useCallback((newValue: string) => {
    onChange(newValue) // Immediate update for UI
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    // Set new timeout for debounced callback
    if (onDebouncedChange) {
      debounceTimeoutRef.current = setTimeout(() => {
        onDebouncedChange(newValue)
        if (newValue.trim()) {
          saveRecentSearch(newValue)
        }
      }, 300) // 300ms delay
    }
  }, [onChange, onDebouncedChange])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown as any)
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any)
      // Clean up timeout on unmount
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="relative">
        {/* Main Search Input */}
        <div className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && "ring-2 ring-[#6b93ce] ring-offset-2"
        )}>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              setShowSuggestions(true)
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsFocused(false)
                setShowSuggestions(false)
              }, 200)
            }}
            placeholder="Search by name, role, skills, company, or try 'CFO in London with M&A experience'"
            className="pl-12 pr-48 py-5 text-lg rounded-2xl border-gray-200 shadow-sm focus:ring-0 focus:border-transparent"
          />

          {/* Right side actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {value && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange("")}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            <div className="h-6 w-px bg-gray-300" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Advanced
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Search Tips</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 text-sm text-gray-600 space-y-2">
                  <p><strong>Basic Search:</strong> Enter keywords to search across all fields</p>
                  <p><strong>Multiple Terms:</strong> "CEO London" finds profiles with both CEO AND London</p>
                  <p><strong>OR Search:</strong> "CEO | CFO" finds profiles with CEO OR CFO</p>
                  <p><strong>Exact Phrase:</strong> "Chief Executive Officer" searches for exact phrase</p>
                  <p><strong>Field Search:</strong> Use filters on the left for specific criteria</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowAdvanced(!showAdvanced)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showAdvanced ? 'Hide' : 'Show'} Search Templates
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Voice Search"
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={onSaveSearch}
              disabled={!value}
              className="bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="absolute -right-2 -top-2">
          <Badge variant="secondary" className="text-xs bg-gray-100">
            <Command className="h-3 w-3 mr-1" />
            /
          </Badge>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (value || isFocused) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Search Templates */}
            {!value && (
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Quick Search Templates
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {searchTemplates.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => handleTemplateClick(template)}
                      className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-colors"
                    >
                      <span className="text-xl">{template.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{template.query}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!value && recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </h3>
                <div className="space-y-1">
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={`${search}-${index}`}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {value && (
              <div className="p-4">
                {isLoadingSuggestions ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6b93ce]"></div>
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Suggestions
                    </h3>
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion.value)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Badge variant="outline" className="text-xs capitalize">
                            {suggestion.type}
                          </Badge>
                          <span className="text-sm text-gray-700">{suggestion.value}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No suggestions found
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Advanced Search Panel */}
        {showAdvanced && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-40 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Advanced Search</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Use these operators to refine your search:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono text-[#6b93ce]">AND</code>
                    <p className="text-xs text-gray-600 mt-1">Both terms must be present</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono text-[#6b93ce]">OR</code>
                    <p className="text-xs text-gray-600 mt-1">Either term can be present</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono text-[#6b93ce]">NOT</code>
                    <p className="text-xs text-gray-600 mt-1">Exclude terms</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono text-[#6b93ce]">"quotes"</code>
                    <p className="text-xs text-gray-600 mt-1">Exact phrase match</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Field-specific searches:</p>
                <div className="space-y-2 text-sm">
                  <p><code className="font-mono bg-gray-100 px-2 py-1 rounded">role:CFO</code> - Search by specific role</p>
                  <p><code className="font-mono bg-gray-100 px-2 py-1 rounded">sector:"Financial Services"</code> - Search by sector</p>
                  <p><code className="font-mono bg-gray-100 px-2 py-1 rounded">location:London</code> - Search by location</p>
                  <p><code className="font-mono bg-gray-100 px-2 py-1 rounded">experience:20+</code> - Search by years of experience</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}