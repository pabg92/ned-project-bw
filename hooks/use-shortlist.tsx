"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShortlistProfile {
  id: string
  name: string
  title: string
  addedAt: Date
  notes?: string
}

interface ShortlistStore {
  profiles: ShortlistProfile[]
  addProfile: (profile: Omit<ShortlistProfile, 'addedAt'>) => void
  removeProfile: (id: string) => void
  updateNotes: (id: string, notes: string) => void
  clearShortlist: () => void
  isInShortlist: (id: string) => boolean
}

export const useShortlist = create<ShortlistStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      
      addProfile: (profile) => set((state) => ({
        profiles: [...state.profiles, { ...profile, addedAt: new Date() }]
      })),
      
      removeProfile: (id) => set((state) => ({
        profiles: state.profiles.filter(p => p.id !== id)
      })),
      
      updateNotes: (id, notes) => set((state) => ({
        profiles: state.profiles.map(p => 
          p.id === id ? { ...p, notes } : p
        )
      })),
      
      clearShortlist: () => set({ profiles: [] }),
      
      isInShortlist: (id) => {
        return get().profiles.some(p => p.id === id)
      }
    }),
    {
      name: 'boardchampions-shortlist'
    }
  )
)