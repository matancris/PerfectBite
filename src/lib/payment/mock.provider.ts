import type { Order } from '@/types'
import type { PaymentProvider, PaymentIntent, PaymentData, PaymentResult, PaymentStatus } from './types'

/**
 * Mock payment provider for development and testing
 * Simulates payment flow without actual transactions
 */
export const mockPaymentProvider: PaymentProvider = {
  name: 'mock',

  async createPaymentIntent(order: Order): Promise<PaymentIntent> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      id: `pi_mock_${crypto.randomUUID().slice(0, 8)}`,
      amount: order.totalAmount,
      currency: 'ILS',
      status: 'pending',
      metadata: {
        orderId: order.id,
      },
    }
  },

  async processPayment(_paymentData: PaymentData): Promise<PaymentResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate 95% success rate
    const success = Math.random() > 0.05

    if (success) {
      return {
        success: true,
        transactionId: `txn_mock_${crypto.randomUUID().slice(0, 8)}`,
      }
    }

    return {
      success: false,
      error: 'Payment declined. Please try again.',
    }
  },

  async verifyPayment(transactionId: string): Promise<PaymentStatus> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock transactions starting with 'txn_mock_' are always completed
    if (transactionId.startsWith('txn_mock_')) {
      return 'completed'
    }

    return 'pending'
  },

  async refundPayment(transactionId: string, _amount?: number): Promise<PaymentResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (transactionId.startsWith('txn_mock_')) {
      return {
        success: true,
        transactionId: `ref_mock_${crypto.randomUUID().slice(0, 8)}`,
      }
    }

    return {
      success: false,
      error: 'Transaction not found',
    }
  },
}
