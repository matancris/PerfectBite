import { forwardRef, useId, type InputHTMLAttributes } from 'react'

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  function AppInput(
    { label, error, hint, className = '', id, ...props },
    ref
  ) {
    const generatedId = useId()
    const inputId = id ?? generatedId

    const inputClasses = [
      'app-input',
      error && 'app-input--error',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className="app-input-wrapper">
        {label && (
          <label htmlFor={inputId} className="app-input__label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="app-input__error" role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span className="app-input__hint">{hint}</span>
        )}
      </div>
    )
  }
)
