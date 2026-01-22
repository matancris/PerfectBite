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
  
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: `${fontSize}px`,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  )
}
