import { icons } from '@/assets/icons'

interface IconProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  filled?: boolean
  className?: string
}

const sizeMap = {
  sm: 18,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
}

export function Icon({ name, size = 'md', filled = false, className = '' }: IconProps) {
  const fontSize = sizeMap[size]
  
  // Get the appropriate icon (filled version if requested and available)
  const iconKey = filled && icons[`${name}_filled`] ? `${name}_filled` : name
  const svgContent = icons[iconKey]
  
  if (!svgContent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return (
    <span
      className={`icon ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${fontSize}px`,
        height: `${fontSize}px`,
      }}
      dangerouslySetInnerHTML={{ 
        __html: svgContent.replace(
          'width="24"',
          `width="${fontSize}"`
        ).replace(
          'height="24"',
          `height="${fontSize}"`
        )
      }}
    />
  )
}
