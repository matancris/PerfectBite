import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  function AppButton(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) {
    const classes = [
      'app-button',
      `app-button--${variant}`,
      `app-button--${size}`,
      fullWidth && 'app-button--full-width',
      isLoading && 'app-button--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="app-button__spinner" />}
        {!isLoading && leftIcon && (
          <span className="app-button__icon app-button__icon--left">
            {leftIcon}
          </span>
        )}
        <span className="app-button__text">{children}</span>
        {!isLoading && rightIcon && (
          <span className="app-button__icon app-button__icon--right">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)
