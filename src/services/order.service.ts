import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus, OrderFormData, CartItem, ApiResponse } from '@/types'
import { mapOrder } from '@/utils/mappers'
import { pickupSlotsService } from './pickupSlots.service'

export const orderService = {
  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          pickup_slots (*),
          payments (*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapOrder), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          pickup_slots (*),
          payments (*)
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapOrder(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async createOrder(
    formData: OrderFormData,
    items: CartItem[],
    eventId?: string | null
  ): Promise<ApiResponse<Order>> {
    try {
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: import.meta.env.VITE_BUSINESS_ID || 'default',
          event_id: eventId,
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone,
          customer_email: formData.customerEmail,
          fulfillment_type: formData.fulfillmentType,
          pickup_slot_id: formData.pickupSlotId,
          notes: formData.notes,
          status: 'pending',
          total_amount: totalAmount,
        })
        .select()
        .single()

      if (orderError) {
        return { data: null, error: orderError.message }
      }

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        // Rollback order if items failed
        await supabase.from('orders').delete().eq('id', order.id)
        return { data: null, error: itemsError.message }
      }

      // Increment pickup slot order count
      if (formData.pickupSlotId) {
        await pickupSlotsService.incrementSlotOrders(formData.pickupSlotId)
      }

      // Fetch complete order
      return this.getOrder(order.id)
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: mapOrder(data), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getPickupSlots(eventId?: string): Promise<ApiResponse<{ id: string; time: string }[]>> {
    try {
      let query = supabase
        .from('pickup_slots')
        .select('id, time')
        .order('time')

      if (eventId) {
        query = query.eq('event_id', eventId)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data ?? [], error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },
}
