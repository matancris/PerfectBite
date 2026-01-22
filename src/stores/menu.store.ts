import { create } from 'zustand'
import type { MenuItem, MenuCategory, Event } from '@/types'
import { menuService } from '@/services/menu.service'

interface MenuState {
  items: MenuItem[]
  categories: MenuCategory[]
  events: Event[]
  isLoading: boolean
  error: string | null
  fetchMenu: (eventId?: string) => Promise<void>
  fetchCategories: () => Promise<void>
  fetchEvents: () => Promise<void>
  addItem: (item: Omit<MenuItem, 'id' | 'createdAt'>) => Promise<void>
  updateItem: (id: string, item: Partial<MenuItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

export const useMenuStore = create<MenuState>((set) => ({
  items: [],
  categories: [],
  events: [],
  isLoading: false,
  error: null,

  fetchMenu: async (eventId) => {
    set({ isLoading: true, error: null })
    try {
      const result = await menuService.getMenuItems(eventId)
      if (result.error) {
        set({ error: result.error, isLoading: false })
        return
      }
      set({ items: result.data ?? [], isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const result = await menuService.getCategories()
      if (result.data) {
        set({ categories: result.data })
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  },

  fetchEvents: async () => {
    try {
      const result = await menuService.getEvents()
      if (result.data) {
        set({ events: result.data })
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  },

  addItem: async (item) => {
    set({ isLoading: true })
    try {
      const result = await menuService.createMenuItem(item)
      if (result.data) {
        set((state) => ({
          items: [...state.items, result.data!],
          isLoading: false,
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateItem: async (id, updates) => {
    set({ isLoading: true })
    try {
      const result = await menuService.updateMenuItem(id, updates)
      if (result.data) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...result.data } : item
          ),
          isLoading: false,
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true })
    try {
      await menuService.deleteMenuItem(id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
