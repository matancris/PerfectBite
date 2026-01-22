import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Business } from '@/types'
import { businessService } from '@/services/business.service'

interface BusinessState {
  business: Business | null
  isLoading: boolean
  error: string | null
  fetchBusiness: () => Promise<void>
  updateBusiness: (updates: Partial<Business>) => Promise<void>
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      business: null,
      isLoading: false,
      error: null,

      fetchBusiness: async () => {
        const businessId = import.meta.env.VITE_BUSINESS_ID
        
        if (!businessId || businessId === 'default' || businessId === 'your-business-uuid') {
          set({ business: null, isLoading: false })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const result = await businessService.getBusiness(businessId)
          
          if (result.error) {
            set({ error: result.error, isLoading: false })
            return
          }
          set({ business: result.data, isLoading: false })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      updateBusiness: async (updates) => {
        const businessId = import.meta.env.VITE_BUSINESS_ID
        if (!businessId) return

        set({ isLoading: true })
        try {
          const result = await businessService.updateBusiness(businessId, updates)
          if (result.data) {
            set({ business: result.data, isLoading: false })
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },
    }),
    {
      name: 'perfectbite-business',
      partialize: (state) => ({ business: state.business }),
    }
  )
)
