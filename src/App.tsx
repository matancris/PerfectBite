import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/routes/AppRouter'
import { Toaster } from '@/components/ui/Toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useBusinessStore } from '@/stores/business.store'
import { useAuthStore } from '@/stores/auth.store'

export function App() {
  const fetchBusiness = useBusinessStore((state) => state.fetchBusiness)
  const initializeAuth = useAuthStore((state) => state.initialize)

  useEffect(() => {
    // Initialize auth once at app startup
    initializeAuth()
    fetchBusiness()
  }, [fetchBusiness, initializeAuth])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
