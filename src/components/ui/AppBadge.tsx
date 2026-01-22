import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface AppBadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function AppBadge({
  variant = 'default',
  children,
  className = '',
}: AppBadgeProps) {
  const classes = ['app-badge', `app-badge--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return <span className={classes}>{children}</span>
}
