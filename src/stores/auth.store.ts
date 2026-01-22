import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAdmin: false,

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

      checkSession: async () => {
        set({ isLoading: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          set({ user: session?.user ?? null, isAdmin: !!session?.user })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'perfectbite-auth',
      partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin }),
    }
  )
)
