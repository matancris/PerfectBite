import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/routes/AppRouter'
import { Toaster } from '@/components/ui/Toaster'
import { useBusinessStore } from '@/stores/business.store'

export function App() {
  const fetchBusiness = useBusinessStore((state) => state.fetchBusiness)

  useEffect(() => {
    fetchBusiness()
  }, [fetchBusiness])

  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
  )
}
