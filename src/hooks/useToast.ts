import { useCallback } from 'react'
import { useToastStore, type ToastType } from '@/stores/toast.store'

interface ShowToastOptions {
  type: ToastType
  title?: string
  message: string
  duration?: number
}

export function useToast() {
  const addToast = useToastStore((state) => state.addToast)

  const showToast = useCallback(
    (options: ShowToastOptions) => {
      addToast(options)
    },
    [addToast]
  )

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      addToast({ type: 'success', message, title })
    },
    [addToast]
  )

  const showError = useCallback(
    (message: string, title?: string) => {
      addToast({ type: 'error', message, title })
    },
    [addToast]
  )

  const showWarning = useCallback(
    (message: string, title?: string) => {
      addToast({ type: 'warning', message, title })
    },
    [addToast]
  )

  const showInfo = useCallback(
    (message: string, title?: string) => {
      addToast({ type: 'info', message, title })
    },
    [addToast]
  )

  return { showToast, showSuccess, showError, showWarning, showInfo }
}
