import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  function AppTextarea(
    { label, error, className = '', id, ...props },
    ref
  ) {
    const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`

    const textareaClasses = [
      'app-textarea',
      error && 'app-textarea--error',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className="app-textarea-wrapper">
        {label && (
          <label htmlFor={textareaId} className="app-textarea__label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <span className="app-textarea__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
