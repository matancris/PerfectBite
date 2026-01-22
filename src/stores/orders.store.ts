import { create } from 'zustand'
import type { Order, OrderStatus } from '@/types'
import { orderService } from '@/services/order.service'
import { supabase } from '@/lib/supabase'

interface OrdersState {
  orders: Order[]
  isLoading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  subscribeToOrders: () => () => void
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await orderService.getOrders()
      if (result.error) {
        set({ error: result.error, isLoading: false })
        return
      }
      set({ orders: result.data ?? [], isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, status)
      if (result.data) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  subscribeToOrders: () => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Refetch to get full order with relations
            get().fetchOrders()
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              orders: state.orders.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              ),
            }))
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              orders: state.orders.filter(
                (order) => order.id !== payload.old.id
              ),
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
