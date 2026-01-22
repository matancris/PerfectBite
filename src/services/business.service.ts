import { supabase } from '@/lib/supabase'
import type { Business, ApiResponse } from '@/types'

export const businessService = {
  async getBusiness(businessId: string): Promise<ApiResponse<Business>> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .maybeSingle() // Use maybeSingle to handle 0 rows gracefully

      if (error) {
        return { data: null, error: error.message }
      }

      if (!data) {
        return { data: null, error: `No business found with ID: ${businessId}` }
      }

      return {
        data: {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          settings: data.settings as Business['settings'],
          createdAt: data.created_at,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async updateBusiness(
    businessId: string,
    updates: Partial<Business>
  ): Promise<ApiResponse<Business>> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: updates.name,
          phone: updates.phone,
          email: updates.email,
          settings: updates.settings,
        })
        .eq('id', businessId)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return {
        data: {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          settings: data.settings as Business['settings'],
          createdAt: data.created_at,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },
}
