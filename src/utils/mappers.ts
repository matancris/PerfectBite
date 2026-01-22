import type {
  MenuItem,
  MenuCategory,
  Event,
  Order,
  OrderItem,
  PickupSlot,
  EventPickupSlot,
  Payment,
} from '@/types'

// Database row types (snake_case)
interface MenuItemRow {
  id: string
  business_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
  available_anytime: boolean
  max_quantity: number | null
  created_at: string
}

interface CategoryRow {
  id: string
  business_id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
}

interface EventRow {
  id: string
  business_id: string
  title: string
  description: string | null
  event_date: string
  start_time: string
  end_time: string
  order_deadline: string
  is_active: boolean
  allow_any_pickup_time: boolean | null
  created_at: string
}

interface OrderRow {
  id: string
  business_id: string
  event_id: string | null
  customer_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  fulfillment_type: 'pickup' | 'dine_in'
  pickup_slot_id: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_amount: number
  created_at: string
  order_items?: OrderItemRow[]
  pickup_slots?: PickupSlotRow | null
  payments?: PaymentRow[]
}

interface OrderItemRow {
  id: string
  order_id: string
  menu_item_id: string
  name: string
  price: number
  quantity: number
  notes: string | null
}

interface PickupSlotRow {
  id: string
  business_id: string
  event_id: string | null
  time: string
  max_orders: number | null
  current_orders: number
}

interface PaymentRow {
  id: string
  order_id: string
  provider: string
  transaction_id: string | null
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  metadata: Record<string, unknown> | null
  created_at: string
}

export function mapMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    businessId: row.business_id,
    categoryId: row.category_id ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    price: row.price,
    imageUrl: row.image_url ?? undefined,
    isActive: row.is_active,
    availableAnytime: row.available_anytime ?? false,
    maxQuantity: row.max_quantity ?? undefined,
    createdAt: row.created_at,
  }
}

export function mapCategory(row: CategoryRow): MenuCategory {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }
}

export function mapEvent(row: EventRow): Event {
  return {
    id: row.id,
    businessId: row.business_id,
    title: row.title,
    description: row.description ?? undefined,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    orderDeadline: row.order_deadline,
    isActive: row.is_active,
    allowAnyPickupTime: row.allow_any_pickup_time ?? false,
    createdAt: row.created_at,
  }
}

export function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    menuItemId: row.menu_item_id,
    name: row.name,
    price: row.price,
    quantity: row.quantity,
    notes: row.notes ?? undefined,
  }
}

export function mapPickupSlot(row: PickupSlotRow): PickupSlot {
  return {
    id: row.id,
    businessId: row.business_id,
    eventId: row.event_id ?? undefined,
    time: row.time,
    maxOrders: row.max_orders ?? undefined,
    currentOrders: row.current_orders,
  }
}

interface EventPickupSlotRow {
  id: string
  event_id: string
  time: string
  max_orders: number
  current_orders: number
}

export function mapEventPickupSlot(row: EventPickupSlotRow): EventPickupSlot {
  return {
    id: row.id,
    eventId: row.event_id,
    time: row.time,
    maxOrders: row.max_orders,
    currentOrders: row.current_orders,
  }
}

export function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    orderId: row.order_id,
    provider: row.provider,
    transactionId: row.transaction_id ?? undefined,
    amount: row.amount,
    status: row.status,
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at,
  }
}

export function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    businessId: row.business_id,
    eventId: row.event_id ?? undefined,
    customerId: row.customer_id ?? undefined,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email ?? undefined,
    fulfillmentType: row.fulfillment_type,
    pickupSlotId: row.pickup_slot_id ?? undefined,
    pickupSlot: row.pickup_slots ? mapPickupSlot(row.pickup_slots) : undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map(mapOrderItem),
    payment: row.payments?.[0] ? mapPayment(row.payments[0]) : undefined,
  }
}
