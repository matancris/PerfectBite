import { Icon } from './Icon'

interface BusinessLogoProps {
  logoUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
}

export function BusinessLogo({ logoUrl, size = 'md', className = '' }: BusinessLogoProps) {
  const dimension = sizeMap[size]
  
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="לוגו העסק"
        className={`business-logo ${className}`}
        style={{
          width: dimension,
          height: dimension,
          objectFit: 'contain',
          borderRadius: '8px',
        }}
      />
    )
  }

  // Default fallback icon
  return (
    <Icon
      name="bakery_dining"
      size={size}
      filled
      className={className}
    />
  )
}
