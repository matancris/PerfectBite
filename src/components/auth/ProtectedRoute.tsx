import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, checkSession } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__spinner" />
        <p>טוען...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
