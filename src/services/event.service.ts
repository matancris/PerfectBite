import { supabase } from '@/lib/supabase'
import type { Event, ApiResponse } from '@/types'
import { mapEvent } from '@/utils/mappers'

export const eventService = {
  async getEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapEvent), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getEvent(eventId: string): Promise<ApiResponse<Event>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapEvent(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async createEvent(
    event: Omit<Event, 'id' | 'createdAt'>
  ): Promise<ApiResponse<Event>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          business_id: event.businessId,
          title: event.title,
          description: event.description,
          event_date: event.eventDate,
          order_deadline: event.orderDeadline,
          is_active: event.isActive,
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapEvent(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async updateEvent(
    id: string,
    updates: Partial<Event>
  ): Promise<ApiResponse<Event>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          title: updates.title,
          description: updates.description,
          event_date: updates.eventDate,
          order_deadline: updates.orderDeadline,
          is_active: updates.isActive,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapEvent(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('events')
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
