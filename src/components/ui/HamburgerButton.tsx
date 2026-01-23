interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

export function HamburgerButton({ isOpen, onClick, className = '' }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      className={`hamburger-btn ${isOpen ? 'hamburger-btn--open' : ''} ${className}`}
      onClick={onClick}
      aria-label={isOpen ? 'סגור תפריט' : 'פתח תפריט'}
      aria-expanded={isOpen}
    >
      <span className="hamburger-btn__line" />
      <span className="hamburger-btn__line" />
      <span className="hamburger-btn__line" />
    </button>
  )
}
