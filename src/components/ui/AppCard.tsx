import type { ReactNode, HTMLAttributes } from 'react'

interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  image?: string
  imageAlt?: string
  footer?: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
}

export function AppCard({
  title,
  subtitle,
  image,
  imageAlt,
  footer,
  variant = 'default',
  className = '',
  children,
  ...props
}: AppCardProps) {
  const classes = [
    'app-card',
    `app-card--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {image && (
        <div className="app-card__image">
          <img src={image} alt={imageAlt ?? title ?? ''} loading="lazy" />
        </div>
      )}
      <div className="app-card__content">
        {title && <h3 className="app-card__title">{title}</h3>}
        {subtitle && <p className="app-card__subtitle">{subtitle}</p>}
        {children}
      </div>
      {footer && <div className="app-card__footer">{footer}</div>}
    </div>
  )
}
