import { create } from 'zustand'
import type { PickupSlot } from '@/types'
import { pickupSlotsService } from '@/services/pickupSlots.service'

interface PickupSlotsState {
  slots: PickupSlot[]
  isLoading: boolean
  error: string | null
  fetchSlots: () => Promise<void>
  createSlot: (time: string, maxOrders: number, eventId?: string) => Promise<void>
  updateSlot: (id: string, updates: { time?: string; maxOrders?: number }) => Promise<void>
  deleteSlot: (id: string) => Promise<void>
  generateSlots: (
    startTime: string,
    endTime: string,
    intervalMinutes: number,
    maxOrdersPerSlot: number,
    eventId?: string
  ) => Promise<void>
}

export const usePickupSlotsStore = create<PickupSlotsState>((set) => ({
  slots: [],
  isLoading: false,
  error: null,

  fetchSlots: async () => {
    set({ isLoading: true, error: null })
    const result = await pickupSlotsService.getPickupSlots()
    
    if (result.error) {
      set({ error: result.error, isLoading: false })
      return
    }
    
    set({ slots: result.data ?? [], isLoading: false })
  },

  createSlot: async (time, maxOrders, eventId) => {
    const result = await pickupSlotsService.createPickupSlot(time, maxOrders, eventId)
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    if (result.data) {
      set((state) => ({
        slots: [...state.slots, result.data!].sort((a, b) => a.time.localeCompare(b.time)),
      }))
    }
  },

  updateSlot: async (id, updates) => {
    const result = await pickupSlotsService.updatePickupSlot(id, updates)
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    if (result.data) {
      set((state) => ({
        slots: state.slots
          .map((slot) => (slot.id === id ? result.data! : slot))
          .sort((a, b) => a.time.localeCompare(b.time)),
      }))
    }
  },

  deleteSlot: async (id) => {
    const result = await pickupSlotsService.deletePickupSlot(id)
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    set((state) => ({
      slots: state.slots.filter((slot) => slot.id !== id),
    }))
  },

  generateSlots: async (startTime, endTime, intervalMinutes, maxOrdersPerSlot, eventId) => {
    set({ isLoading: true })
    const result = await pickupSlotsService.generateSlots(
      startTime,
      endTime,
      intervalMinutes,
      maxOrdersPerSlot,
      eventId
    )
    
    if (result.error) {
      set({ isLoading: false })
      throw new Error(result.error)
    }
    
    set({ slots: result.data ?? [], isLoading: false })
  },
}))
