import { supabase } from '@/lib/supabase'
import type { Event, EventItem, EventPickupSlot, MenuItem, ApiResponse } from '@/types'
import { mapEvent, mapMenuItem, mapEventPickupSlot } from '@/utils/mappers'

const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

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
          start_time: event.startTime,
          end_time: event.endTime,
          order_deadline: event.orderDeadline,
          is_active: event.isActive,
          allow_any_pickup_time: event.allowAnyPickupTime ?? false,
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
          start_time: updates.startTime,
          end_time: updates.endTime,
          order_deadline: updates.orderDeadline,
          is_active: updates.isActive,
          allow_any_pickup_time: updates.allowAnyPickupTime,
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
      // First delete related event items
      await supabase
        .from('event_items')
        .delete()
        .eq('event_id', id)

      // Delete related pickup slots
      await supabase
        .from('event_pickup_slots')
        .delete()
        .eq('event_id', id)

      // Delete the event itself
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  // Event Items Management
  async getEventItems(eventId: string): Promise<ApiResponse<EventItem[]>> {
    try {
      const { data, error } = await supabase
        .from('event_items')
        .select(`
          *,
          menu_items (*)
        `)
        .eq('event_id', eventId)

      if (error) {
        return { data: null, error: error.message }
      }

      return {
        data: (data ?? []).map((item) => ({
          id: item.id,
          eventId: item.event_id,
          menuItemId: item.menu_item_id,
          customPrice: item.custom_price,
          maxQuantity: item.max_quantity,
          currentQuantity: item.current_quantity ?? 0,
          menuItem: item.menu_items ? mapMenuItem(item.menu_items) : undefined,
        })),
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async addEventItem(
    eventId: string,
    menuItemId: string,
    maxQuantity: number,
    customPrice?: number
  ): Promise<ApiResponse<EventItem>> {
    try {
      const { data, error } = await supabase
        .from('event_items')
        .insert({
          event_id: eventId,
          menu_item_id: menuItemId,
          max_quantity: maxQuantity,
          custom_price: customPrice,
          current_quantity: 0,
        })
        .select(`
          *,
          menu_items (*)
        `)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return {
        data: {
          id: data.id,
          eventId: data.event_id,
          menuItemId: data.menu_item_id,
          customPrice: data.custom_price,
          maxQuantity: data.max_quantity,
          currentQuantity: data.current_quantity ?? 0,
          menuItem: data.menu_items ? mapMenuItem(data.menu_items) : undefined,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async updateEventItem(
    id: string,
    updates: { maxQuantity?: number; customPrice?: number }
  ): Promise<ApiResponse<EventItem>> {
    try {
      const { data, error } = await supabase
        .from('event_items')
        .update({
          max_quantity: updates.maxQuantity,
          custom_price: updates.customPrice,
        })
        .eq('id', id)
        .select(`
          *,
          menu_items (*)
        `)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return {
        data: {
          id: data.id,
          eventId: data.event_id,
          menuItemId: data.menu_item_id,
          customPrice: data.custom_price,
          maxQuantity: data.max_quantity,
          currentQuantity: data.current_quantity ?? 0,
          menuItem: data.menu_items ? mapMenuItem(data.menu_items) : undefined,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async removeEventItem(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('event_items')
        .delete()
        .eq('id', id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async incrementEventItemQuantity(
    eventItemId: string,
    quantity: number
  ): Promise<ApiResponse<boolean>> {
    try {
      // Get current quantity
      const { data: item, error: fetchError } = await supabase
        .from('event_items')
        .select('current_quantity, max_quantity')
        .eq('id', eventItemId)
        .single()

      if (fetchError) {
        return { data: null, error: fetchError.message }
      }

      const newQuantity = (item.current_quantity ?? 0) + quantity

      // Check if exceeds max
      if (item.max_quantity && newQuantity > item.max_quantity) {
        return { data: null, error: 'הכמות המבוקשת עולה על המלאי' }
      }

      const { error } = await supabase
        .from('event_items')
        .update({ current_quantity: newQuantity })
        .eq('id', eventItemId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getActiveEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('business_id', BUSINESS_ID)
        .eq('is_active', true)
        .gte('order_deadline', now)
        .order('event_date', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapEvent), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getEventMenuItems(eventId: string): Promise<ApiResponse<(MenuItem & { eventItemId: string; maxQuantity: number; currentQuantity: number; remainingQuantity: number })[]>> {
    try {
      const { data, error } = await supabase
        .from('event_items')
        .select(`
          *,
          menu_items (*)
        `)
        .eq('event_id', eventId)

      if (error) {
        return { data: null, error: error.message }
      }

      const items = (data ?? [])
        .filter((item) => item.menu_items)
        .map((item) => {
          const menuItem = mapMenuItem(item.menu_items)
          const currentQty = item.current_quantity ?? 0
          const maxQty = item.max_quantity ?? 0
          const remaining = maxQty - currentQty

          return {
            ...menuItem,
            price: item.custom_price ?? menuItem.price,
            eventItemId: item.id,
            maxQuantity: maxQty,
            currentQuantity: currentQty,
            remainingQuantity: remaining,
          }
        })
        .filter((item) => item.remainingQuantity > 0) // Only show items with remaining stock

      return { data: items, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  // Event Pickup Slots Management
  async getEventPickupSlots(eventId: string): Promise<ApiResponse<EventPickupSlot[]>> {
    try {
      const { data, error } = await supabase
        .from('event_pickup_slots')
        .select('*')
        .eq('event_id', eventId)
        .order('time', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapEventPickupSlot), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getAvailableEventPickupSlots(eventId: string): Promise<ApiResponse<EventPickupSlot[]>> {
    try {
      const { data, error } = await supabase
        .from('event_pickup_slots')
        .select('*')
        .eq('event_id', eventId)
        .order('time', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      // Filter out full slots
      const availableSlots = (data ?? [])
        .map(mapEventPickupSlot)
        .filter(slot => slot.currentOrders < slot.maxOrders)

      return { data: availableSlots, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async addEventPickupSlot(
    eventId: string,
    time: string,
    maxOrders: number
  ): Promise<ApiResponse<EventPickupSlot>> {
    try {
      const { data, error } = await supabase
        .from('event_pickup_slots')
        .insert({
          event_id: eventId,
          time,
          max_orders: maxOrders,
          current_orders: 0,
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapEventPickupSlot(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async updateEventPickupSlot(
    id: string,
    updates: { time?: string; maxOrders?: number }
  ): Promise<ApiResponse<EventPickupSlot>> {
    try {
      const { data, error } = await supabase
        .from('event_pickup_slots')
        .update({
          time: updates.time,
          max_orders: updates.maxOrders,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapEventPickupSlot(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async removeEventPickupSlot(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('event_pickup_slots')
        .delete()
        .eq('id', id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async incrementEventPickupSlotOrders(slotId: string): Promise<ApiResponse<boolean>> {
    try {
      // Get current slot
      const { data: slot, error: fetchError } = await supabase
        .from('event_pickup_slots')
        .select('current_orders, max_orders')
        .eq('id', slotId)
        .single()

      if (fetchError) {
        return { data: null, error: fetchError.message }
      }

      if (slot.current_orders >= slot.max_orders) {
        return { data: null, error: 'שעת האיסוף מלאה' }
      }

      const { error } = await supabase
        .from('event_pickup_slots')
        .update({ current_orders: slot.current_orders + 1 })
        .eq('id', slotId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async generateEventPickupSlots(
    eventId: string,
    startTime: string,
    endTime: string,
    intervalMinutes: number,
    maxOrdersPerSlot: number
  ): Promise<ApiResponse<EventPickupSlot[]>> {
    try {
      const slots: { event_id: string; time: string; max_orders: number; current_orders: number }[] = []
      
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)
      
      let currentMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      
      while (currentMinutes < endMinutes) {
        const hour = Math.floor(currentMinutes / 60)
        const min = currentMinutes % 60
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        
        slots.push({
          event_id: eventId,
          time: timeStr,
          max_orders: maxOrdersPerSlot,
          current_orders: 0,
        })
        
        currentMinutes += intervalMinutes
      }

      if (slots.length === 0) {
        return { data: [], error: null }
      }

      const { data, error } = await supabase
        .from('event_pickup_slots')
        .insert(slots)
        .select()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapEventPickupSlot), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async clearEventPickupSlots(eventId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('event_pickup_slots')
        .delete()
        .eq('event_id', eventId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },
}
