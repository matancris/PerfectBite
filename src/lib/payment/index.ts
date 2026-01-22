import type { PaymentProvider } from './types'
import { mockPaymentProvider } from './mock.provider'

export * from './types'
export { mockPaymentProvider }

/**
 * Check if the app is using mock payments
 * Use this to show warnings in production
 */
export function isUsingMockPayments(): boolean {
  const providerName = import.meta.env.VITE_PAYMENT_PROVIDER || 'mock'
  return providerName === 'mock'
}

/**
 * Get the configured payment provider
 * 
 * To use a real payment provider:
 * 1. Set VITE_PAYMENT_PROVIDER to 'stripe', 'tranzila', or 'payplus' in .env
 * 2. Set the corresponding API keys (VITE_STRIPE_PUBLIC_KEY, etc.)
 * 3. Implement the provider in a new file (e.g., stripe.provider.ts)
 * 
 * Example .env for Stripe:
 * VITE_PAYMENT_PROVIDER=stripe
 * VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
 */
export function getPaymentProvider(): PaymentProvider {
  const providerName = import.meta.env.VITE_PAYMENT_PROVIDER || 'mock'

  // Warn in production if using mock payments
  if (import.meta.env.PROD && providerName === 'mock') {
    console.warn(
      '[PAYMENT WARNING] Using mock payment provider in production! ' +
      'Set VITE_PAYMENT_PROVIDER to a real provider (stripe, tranzila, payplus) ' +
      'before accepting real payments.'
    )
  }

  switch (providerName) {
    case 'stripe':
      // TODO: Implement Stripe provider
      // import { stripeProvider } from './stripe.provider'
      // return stripeProvider
      throw new Error(
        'Stripe provider not implemented. ' +
        'Create src/lib/payment/stripe.provider.ts or use VITE_PAYMENT_PROVIDER=mock'
      )

    case 'tranzila':
      // TODO: Implement Tranzila provider (Israeli payment processor)
      // import { tranzilaProvider } from './tranzila.provider'
      // return tranzilaProvider
      throw new Error(
        'Tranzila provider not implemented. ' +
        'Create src/lib/payment/tranzila.provider.ts or use VITE_PAYMENT_PROVIDER=mock'
      )

    case 'payplus':
      // TODO: Implement PayPlus provider (Israeli payment processor)
      // import { payplusProvider } from './payplus.provider'
      // return payplusProvider
      throw new Error(
        'PayPlus provider not implemented. ' +
        'Create src/lib/payment/payplus.provider.ts or use VITE_PAYMENT_PROVIDER=mock'
      )

    case 'mock':
    default:
      return mockPaymentProvider
  }
}
