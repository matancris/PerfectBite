import { create } from 'zustand'
import type { Event } from '@/types'
import { eventService } from '@/services/event.service'

interface EventsState {
  events: Event[]
  isLoading: boolean
  error: string | null
  fetchEvents: () => Promise<void>
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await eventService.getEvents()
      if (result.error) {
        set({ error: result.error, isLoading: false })
        return
      }
      set({ events: result.data ?? [], isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addEvent: async (event) => {
    set({ isLoading: true })
    try {
      const result = await eventService.createEvent(event)
      if (result.data) {
        set((state) => ({
          events: [...state.events, result.data!],
          isLoading: false,
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateEvent: async (id, updates) => {
    set({ isLoading: true })
    try {
      const result = await eventService.updateEvent(id, updates)
      if (result.data) {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...result.data } : event
          ),
          isLoading: false,
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true })
    try {
      await eventService.deleteEvent(id)
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
