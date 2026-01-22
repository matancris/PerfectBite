import type { Order } from '@/types'

export interface PaymentIntent {
  id: string
  clientSecret?: string
  amount: number
  currency: string
  status: 'pending' | 'requires_action' | 'succeeded' | 'failed'
  metadata?: Record<string, unknown>
}

export interface PaymentData {
  orderId: string
  amount: number
  currency: string
  customerEmail?: string
  customerPhone: string
  returnUrl?: string
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  redirectUrl?: string
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface PaymentProvider {
  name: string
  
  /**
   * Initialize payment for an order
   * Returns a PaymentIntent with any required client-side data
   */
  createPaymentIntent(order: Order): Promise<PaymentIntent>
  
  /**
   * Process the actual payment
   * Called after customer submits payment details
   */
  processPayment(paymentData: PaymentData): Promise<PaymentResult>
  
  /**
   * Verify payment status
   * Used for webhooks or polling
   */
  verifyPayment(transactionId: string): Promise<PaymentStatus>
  
  /**
   * Refund a payment
   */
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>
}
