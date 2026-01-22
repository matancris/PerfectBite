import { useEffect, useCallback } from 'react'
import { useToastStore, type Toast } from '@/stores/toast.store'

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div className={`toast toast--${toast.type}`} role="alert">
      <div className="toast__content">
        {toast.title && <div className="toast__title">{toast.title}</div>}
        <div className="toast__message">{toast.message}</div>
      </div>
      <button
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="סגור הודעה"
      >
        ×
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  const handleDismiss = useCallback((id: string) => {
    removeToast(id)
  }, [removeToast])

  if (toasts.length === 0) return null

  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  )
}
