import { useBusinessStore } from '@/stores/business.store'

export function CustomerFooter() {
  const currentYear = new Date().getFullYear()
  const business = useBusinessStore((state) => state.business)

  const businessName = business?.name || 'המאפייה שלנו'
  const businessPhone = business?.phone

  return (
    <footer className="customer-footer">
      <div className="customer-footer__container">
        <p className="customer-footer__copyright">
          © {currentYear} {businessName}. כל הזכויות שמורות.
        </p>
        <div className="customer-footer__links">
          {businessPhone && (
            <a href={`tel:${businessPhone}`} className="customer-footer__link">
              📞 {businessPhone}
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
