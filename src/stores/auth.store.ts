import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: true,
  isAdmin: false,
  isInitialized: false,

  setUser: (user) => {
    set({ user, isAdmin: !!user })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      get().setUser(data.user)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAdmin: false })
  },

  initialize: async () => {
    // Only initialize once
    if (get().isInitialized) {
      return
    }

    set({ isLoading: true })
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      set({ 
        user: session?.user ?? null, 
        isAdmin: !!session?.user,
        isInitialized: true,
      })

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          user: session?.user ?? null, 
          isAdmin: !!session?.user 
        })
      })
    } finally {
      set({ isLoading: false })
    }
  },
}))
