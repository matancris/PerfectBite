import type { PaymentProvider } from './types'
import { mockPaymentProvider } from './mock.provider'

export * from './types'
export { mockPaymentProvider }

/**
 * Get the configured payment provider
 * Add more providers here as they are implemented
 */
export function getPaymentProvider(): PaymentProvider {
  const providerName = import.meta.env.VITE_PAYMENT_PROVIDER || 'mock'

  switch (providerName) {
    case 'stripe':
      // TODO: Implement Stripe provider
      // return stripeProvider
      console.warn('Stripe provider not implemented, falling back to mock')
      return mockPaymentProvider

    case 'tranzila':
      // TODO: Implement Tranzila provider
      // return tranzilaProvider
      console.warn('Tranzila provider not implemented, falling back to mock')
      return mockPaymentProvider

    case 'payplus':
      // TODO: Implement PayPlus provider
      // return payplusProvider
      console.warn('PayPlus provider not implemented, falling back to mock')
      return mockPaymentProvider

    case 'mock':
    default:
      return mockPaymentProvider
  }
}
