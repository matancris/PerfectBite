import { supabase, BUSINESS_ID } from '@/lib/supabase'
import type { Order, OrderStatus, OrderFormData, CartItem, ApiResponse } from '@/types'
import { mapOrder } from '@/utils/mappers'
import { pickupSlotsService } from './pickupSlots.service'
import { eventService } from './event.service'

export const orderService = {
  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
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

  /**
   * Create an order atomically using database function
   * This prevents race conditions for pickup slots and event item quantities
   */
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

      // Prepare items for the database function
      const orderItems = items.map((item) => ({
        menu_item_id: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || null,
      }))

      // Try to use atomic function first (if migration is applied)
      const { data: orderId, error: rpcError } = await supabase
        .rpc('create_order_atomic', {
          p_business_id: BUSINESS_ID,
          p_event_id: eventId || null,
          p_customer_name: formData.customerName,
          p_customer_phone: formData.customerPhone,
          p_customer_email: formData.customerEmail || null,
          p_fulfillment_type: formData.fulfillmentType,
          p_pickup_slot_id: formData.pickupSlotId || null,
          p_notes: formData.notes || null,
          p_total_amount: totalAmount,
          p_items: orderItems,
        })

      if (rpcError) {
        // Check if it's a "function not found" error - fallback to legacy method
        if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
          return this.createOrderLegacy(formData, items, eventId, totalAmount)
        }

        // Handle specific error codes from the function
        if (rpcError.code === 'P0001') {
          return { data: null, error: 'שעת האיסוף שנבחרה מלאה. אנא בחרו שעה אחרת.' }
        }
        if (rpcError.code === 'P0002') {
          return { data: null, error: rpcError.message }
        }

        return { data: null, error: rpcError.message }
      }

      // Fetch the complete order with relations
      return this.getOrder(orderId as string)
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  /**
   * Legacy order creation (fallback when atomic function is not available)
   * Note: This method has race condition vulnerabilities
   * @deprecated Use create_order_atomic database function instead
   */
  async createOrderLegacy(
    formData: OrderFormData,
    items: CartItem[],
    eventId: string | null | undefined,
    totalAmount: number
  ): Promise<ApiResponse<Order>> {
    try {
      // VALIDATION 1: Check pickup slot availability
      if (formData.pickupSlotId) {
        const isEventSlot = !!eventId
        const tableName = isEventSlot ? 'event_pickup_slots' : 'pickup_slots'
        
        const { data: slot, error: slotError } = await supabase
          .from(tableName)
          .select('current_orders, max_orders')
          .eq('id', formData.pickupSlotId)
          .single()

        if (slotError) {
          return { data: null, error: 'שעת האיסוף שנבחרה אינה זמינה' }
        }

        if (slot.current_orders >= slot.max_orders) {
          return { data: null, error: 'שעת האיסוף שנבחרה מלאה. אנא בחרו שעה אחרת.' }
        }
      }

      // VALIDATION 2: Check item stock for event orders
      if (eventId) {
        const eventItemsResult = await eventService.getEventMenuItems(eventId)
        if (eventItemsResult.data) {
          for (const cartItem of items) {
            const eventItem = eventItemsResult.data.find((ei) => ei.id === cartItem.menuItemId)
            if (eventItem && cartItem.quantity > eventItem.remainingQuantity) {
              return {
                data: null,
                error: `הפריט "${cartItem.name}" אזל מהמלאי. נותרו רק ${eventItem.remainingQuantity} יחידות.`,
              }
            }
          }
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: BUSINESS_ID,
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
        const isEventSlot = !!eventId
        const incrementResult = await pickupSlotsService.incrementSlotOrders(formData.pickupSlotId, isEventSlot)
        if (incrementResult.error) {
          // Rollback if slot is full (race condition)
          await supabase.from('order_items').delete().eq('order_id', order.id)
          await supabase.from('orders').delete().eq('id', order.id)
          return { data: null, error: incrementResult.error }
        }
      }

      // Increment event item quantities
      if (eventId) {
        const eventItemsResult = await eventService.getEventItems(eventId)
        if (eventItemsResult.data) {
          for (const cartItem of items) {
            const eventItem = eventItemsResult.data.find((ei) => ei.menuItemId === cartItem.menuItemId)
            if (eventItem) {
              await eventService.incrementEventItemQuantity(eventItem.id, cartItem.quantity)
            }
          }
        }
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
