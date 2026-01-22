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

// Helper to map snake_case realtime payload to camelCase Order
function mapRealtimePayload(payload: Record<string, unknown>): Partial<Order> {
  return {
    id: payload.id as string,
    businessId: payload.business_id as string,
    eventId: payload.event_id as string | undefined,
    customerId: payload.customer_id as string | undefined,
    customerName: payload.customer_name as string,
    customerPhone: payload.customer_phone as string,
    customerEmail: payload.customer_email as string | undefined,
    fulfillmentType: payload.fulfillment_type as 'pickup' | 'dine_in',
    pickupSlotId: payload.pickup_slot_id as string | undefined,
    notes: payload.notes as string | undefined,
    status: payload.status as OrderStatus,
    totalAmount: payload.total_amount as number,
    createdAt: payload.created_at as string,
  }
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
    // Optimistically update the UI
    const previousOrders = get().orders
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
      error: null,
    }))

    try {
      const result = await orderService.updateOrderStatus(orderId, status)
      if (result.error) {
        // Rollback on error
        set({ orders: previousOrders, error: result.error })
      }
    } catch (error) {
      // Rollback on error
      set({ orders: previousOrders, error: (error as Error).message })
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
            // Refetch to get full order with relations (items, payment, etc.)
            get().fetchOrders()
          } else if (payload.eventType === 'UPDATE') {
            // Map the snake_case payload to camelCase
            const mappedPayload = mapRealtimePayload(payload.new as Record<string, unknown>)
            set((state) => ({
              orders: state.orders.map((order) =>
                order.id === mappedPayload.id
                  ? { ...order, ...mappedPayload }
                  : order
              ),
            }))
          } else if (payload.eventType === 'DELETE') {
            const oldPayload = payload.old as { id?: string }
            if (oldPayload.id) {
              set((state) => ({
                orders: state.orders.filter(
                  (order) => order.id !== oldPayload.id
                ),
              }))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
