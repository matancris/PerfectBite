import { supabase } from '@/lib/supabase'
import type { PickupSlot, ApiResponse } from '@/types'

const BUSINESS_ID = import.meta.env.VITE_BUSINESS_ID

export const pickupSlotsService = {
  async getPickupSlots(): Promise<ApiResponse<PickupSlot[]>> {
    try {
      const { data, error } = await supabase
        .from('pickup_slots')
        .select('*')
        .eq('business_id', BUSINESS_ID)
        .order('time')

      if (error) {
        return { data: null, error: error.message }
      }

      return {
        data: (data ?? []).map((slot) => ({
          id: slot.id,
          businessId: slot.business_id,
          eventId: slot.event_id,
          time: slot.time,
          maxOrders: slot.max_orders,
          currentOrders: slot.current_orders ?? 0,
        })),
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getAvailableSlots(eventId?: string): Promise<ApiResponse<PickupSlot[]>> {
    try {
      // If event ID is provided, fetch from event_pickup_slots table
      if (eventId) {
        console.log('[PickupSlotsService] Fetching event pickup slots for eventId:', eventId)
        const { data, error } = await supabase
          .from('event_pickup_slots')
          .select('*')
          .eq('event_id', eventId)
          .order('time')

        console.log('[PickupSlotsService] Raw event pickup slots:', { data, error })

        if (error) {
          console.error('[PickupSlotsService] Error:', error.message)
          return { data: null, error: error.message }
        }

        // Filter out slots that have reached their max and map to PickupSlot format
        const availableSlots = (data ?? [])
          .filter((slot) => slot.current_orders < slot.max_orders)
          .map((slot) => ({
            id: slot.id,
            businessId: BUSINESS_ID,
            eventId: slot.event_id,
            time: slot.time,
            maxOrders: slot.max_orders,
            currentOrders: slot.current_orders ?? 0,
          }))

        console.log('[PickupSlotsService] Available slots:', availableSlots)
        return { data: availableSlots, error: null }
      }

      // Otherwise fetch from regular pickup_slots table
      const { data, error } = await supabase
        .from('pickup_slots')
        .select('*')
        .eq('business_id', BUSINESS_ID)
        .is('event_id', null)
        .order('time')

      if (error) {
        return { data: null, error: error.message }
      }

      // Filter out slots that have reached their max
      const availableSlots = (data ?? [])
        .map((slot) => ({
          id: slot.id,
          businessId: slot.business_id,
          eventId: slot.event_id,
          time: slot.time,
          maxOrders: slot.max_orders,
          currentOrders: slot.current_orders ?? 0,
        }))
        .filter((slot) => !slot.maxOrders || slot.currentOrders < slot.maxOrders)

      return { data: availableSlots, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async createPickupSlot(
    time: string,
    maxOrders: number,
    eventId?: string
  ): Promise<ApiResponse<PickupSlot>> {
    try {
      const { data, error } = await supabase
        .from('pickup_slots')
        .insert({
          business_id: BUSINESS_ID,
          event_id: eventId || null,
          time,
          max_orders: maxOrders,
          current_orders: 0,
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return {
        data: {
          id: data.id,
          businessId: data.business_id,
          eventId: data.event_id,
          time: data.time,
          maxOrders: data.max_orders,
          currentOrders: data.current_orders ?? 0,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async updatePickupSlot(
    id: string,
    updates: { time?: string; maxOrders?: number }
  ): Promise<ApiResponse<PickupSlot>> {
    try {
      const { data, error } = await supabase
        .from('pickup_slots')
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

      return {
        data: {
          id: data.id,
          businessId: data.business_id,
          eventId: data.event_id,
          time: data.time,
          maxOrders: data.max_orders,
          currentOrders: data.current_orders ?? 0,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async deletePickupSlot(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('pickup_slots')
        .delete()
        .eq('id', id)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async incrementSlotOrders(slotId: string, isEventSlot = false): Promise<ApiResponse<boolean>> {
    try {
      const tableName = isEventSlot ? 'event_pickup_slots' : 'pickup_slots'
      
      // Get current slot data
      const { data: slot, error: fetchError } = await supabase
        .from(tableName)
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
        .from(tableName)
        .update({ current_orders: (slot.current_orders ?? 0) + 1 })
        .eq('id', slotId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async generateSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number,
    maxOrdersPerSlot: number,
    eventId?: string
  ): Promise<ApiResponse<PickupSlot[]>> {
    try {
      const slots: { time: string; max_orders: number; business_id: string; event_id: string | null }[] = []
      
      // Parse times
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)
      
      let currentMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      while (currentMinutes <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60)
        const mins = currentMinutes % 60
        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
        
        slots.push({
          time: timeStr,
          max_orders: maxOrdersPerSlot,
          business_id: BUSINESS_ID,
          event_id: eventId || null,
        })
        
        currentMinutes += intervalMinutes
      }

      // Delete existing slots first (for this business/event)
      if (eventId) {
        await supabase
          .from('pickup_slots')
          .delete()
          .eq('business_id', BUSINESS_ID)
          .eq('event_id', eventId)
      } else {
        await supabase
          .from('pickup_slots')
          .delete()
          .eq('business_id', BUSINESS_ID)
          .is('event_id', null)
      }

      // Insert new slots
      const { data, error } = await supabase
        .from('pickup_slots')
        .insert(slots)
        .select()

      if (error) {
        return { data: null, error: error.message }
      }

      return {
        data: (data ?? []).map((slot) => ({
          id: slot.id,
          businessId: slot.business_id,
          eventId: slot.event_id,
          time: slot.time,
          maxOrders: slot.max_orders,
          currentOrders: slot.current_orders ?? 0,
        })),
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },
}
