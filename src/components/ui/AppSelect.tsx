import { forwardRef, type SelectHTMLAttributes } from 'react'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
  function AppSelect(
    { label, error, options, placeholder, className = '', id, ...props },
    ref
  ) {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`

    const selectClasses = [
      'app-select',
      error && 'app-select--error',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className="app-select-wrapper">
        {label && (
          <label htmlFor={selectId} className="app-select__label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="app-select__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
