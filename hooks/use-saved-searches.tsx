"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SearchFilters } from '@/app/search/page'

interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  createdAt: Date
  resultCount?: number
}

interface SavedSearchStore {
  searches: SavedSearch[]
  addSearch: (name: string, filters: SearchFilters, resultCount?: number) => void
  removeSearch: (id: string) => void
  updateSearch: (id: string, updates: Partial<SavedSearch>) => void
  getSearch: (id: string) => SavedSearch | undefined
  clearSearches: () => void
}

export const useSavedSearches = create<SavedSearchStore>()(
  persist(
    (set, get) => ({
      searches: [],
      
      addSearch: (name, filters, resultCount) => {
        const newSearch: SavedSearch = {
          id: `search-${Date.now()}`,
          name,
          filters,
          createdAt: new Date(),
          resultCount
        }
        set((state) => ({
          searches: [...state.searches, newSearch]
        }))
      },
      
      removeSearch: (id) => set((state) => ({
        searches: state.searches.filter(s => s.id !== id)
      })),
      
      updateSearch: (id, updates) => set((state) => ({
        searches: state.searches.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      
      getSearch: (id) => {
        return get().searches.find(s => s.id === id)
      },
      
      clearSearches: () => set({ searches: [] }),
    }),
    {
      name: 'boardchampions-saved-searches'
    }
  )
)