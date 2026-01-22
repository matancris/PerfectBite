import { supabase } from '@/lib/supabase'
import type { MenuItem, MenuCategory, Event, ApiResponse } from '@/types'
import { mapMenuItem, mapCategory, mapEvent } from '@/utils/mappers'

export const menuService = {
  async getMenuItems(eventId?: string): Promise<ApiResponse<MenuItem[]>> {
    try {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (eventId) {
        // If eventId provided, get items linked to that event
        const { data: eventItems } = await supabase
          .from('event_items')
          .select('menu_item_id')
          .eq('event_id', eventId)

        if (eventItems && eventItems.length > 0) {
          const menuItemIds = eventItems.map((ei) => ei.menu_item_id)
          query = query.in('id', menuItemIds)
        }
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapMenuItem), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getCategories(): Promise<ApiResponse<MenuCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapCategory), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date')

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapEvent), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async createMenuItem(
    item: Omit<MenuItem, 'id' | 'createdAt'>
  ): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          business_id: item.businessId,
          category_id: item.categoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.imageUrl,
          is_active: item.isActive,
          available_anytime: item.availableAnytime,
          max_quantity: item.maxQuantity,
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapMenuItem(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async updateMenuItem(
    id: string,
    updates: Partial<MenuItem>
  ): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          image_url: updates.imageUrl,
          category_id: updates.categoryId,
          is_active: updates.isActive,
          available_anytime: updates.availableAnytime,
          max_quantity: updates.maxQuantity,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapMenuItem(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async deleteMenuItem(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },
}
