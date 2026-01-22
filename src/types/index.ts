// Core business types

export interface Business {
  id: string
  name: string
  phone: string
  email: string
  settings: BusinessSettings
  createdAt: string
}

export interface BusinessSettings {
  currency: string
  timezone: string
  logoUrl?: string
  primaryColor?: string
}

export interface MenuCategory {
  id: string
  businessId: string
  name: string
  description?: string
  sortOrder: number
  isActive: boolean
}

export interface MenuItem {
  id: string
  businessId: string
  categoryId?: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  isActive: boolean
  maxQuantity?: number
  createdAt: string
}

export interface Event {
  id: string
  businessId: string
  title: string
  description?: string
  eventDate: string
  orderDeadline: string
  isActive: boolean
  createdAt: string
}

export interface EventItem {
  id: string
  eventId: string
  menuItemId: string
  customPrice?: number
  maxQuantity?: number
  menuItem?: MenuItem
}

export interface PickupSlot {
  id: string
  businessId: string
  eventId?: string
  time: string
  maxOrders?: number
  currentOrders: number
}

export type FulfillmentType = 'pickup' | 'dine_in'

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export interface Order {
  id: string
  businessId: string
  eventId?: string
  customerId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  fulfillmentType: FulfillmentType
  pickupSlotId?: string
  pickupSlot?: PickupSlot
  notes?: string
  status: OrderStatus
  totalAmount: number
  createdAt: string
  items: OrderItem[]
  payment?: Payment
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  orderId: string
  provider: string
  transactionId?: string
  amount: number
  status: PaymentStatus
  metadata?: Record<string, unknown>
  createdAt: string
}

// Cart types
export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
  imageUrl?: string
}

// Form types
export interface OrderFormData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  fulfillmentType: FulfillmentType
  pickupSlotId: string
  notes?: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
