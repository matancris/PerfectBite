import { useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface AppDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  children: ReactNode
  footer?: ReactNode
}

export function AppDialog({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEsc = true,
  children,
  footer,
}: AppDialogProps) {
  const handleEscKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose()
      }
    },
    [closeOnEsc, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscKey])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose()
    }
  }

  const dialog = (
    <div className="app-dialog-overlay" onClick={handleOverlayClick}>
      <div
        className={`app-dialog app-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
      >
        {(title || showCloseButton) && (
          <div className="app-dialog__header">
            {title && (
              <h2 id="dialog-title" className="app-dialog__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className="app-dialog__close"
                onClick={onClose}
                aria-label="סגור"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="app-dialog__body">{children}</div>
        {footer && <div className="app-dialog__footer">{footer}</div>}
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
