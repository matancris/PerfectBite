import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, MenuItem } from '@/types'

interface CartState {
  items: CartItem[]
  eventId: string | null
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateNotes: (itemId: string, notes: string) => void
  clearCart: () => void
  setEventId: (eventId: string | null) => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      eventId: null,

      addItem: (item, quantity = 1, notes = '') => {
        set((state) => {
          const existingItem = state.items.find((i) => i.menuItemId === item.id)

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }

          const cartItem: CartItem = {
            id: crypto.randomUUID(),
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity,
            notes,
            imageUrl: item.imageUrl,
          }

          return { items: [...state.items, cartItem] }
        })
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }))
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }))
      },

      updateNotes: (itemId, notes) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, notes } : i
          ),
        }))
      },

      clearCart: () => {
        set({ items: [], eventId: null })
      },

      setEventId: (eventId) => {
        set({ eventId })
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'perfectbite-cart',
    }
  )
)
