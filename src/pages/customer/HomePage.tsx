import { Link } from 'react-router-dom'
import { AppButton, Icon } from '@/components/ui'
import { useBusinessStore } from '@/stores/business.store'
import { useDocumentTitle } from '@/hooks'

export function HomePage() {
  const business = useBusinessStore((state) => state.business)
  const businessName = business?.name || 'המאפייה שלנו'
  
  useDocumentTitle()

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">
            ברוכים הבאים ל<span className="hero__brand">{businessName}</span>
          </h1>
          <p className="hero__subtitle">
            הזמינו אוכל טעים ישירות מהמטבח שלנו
          </p>
          <div className="hero__actions">
            <Link to="/menu">
              <AppButton variant="primary" size="lg">
                לתפריט
              </AppButton>
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features__container">
          <div className="feature-card">
            <Icon name="local_pizza" size="xl" filled className="feature-card__icon" />
            <h3 className="feature-card__title">פיצות טריות</h3>
            <p className="feature-card__description">
              פיצות עשויות בעבודת יד עם חומרי הגלם הטובים ביותר
            </p>
          </div>
          <div className="feature-card">
            <Icon name="soup_kitchen" size="xl" filled className="feature-card__icon" />
            <h3 className="feature-card__title">מרקים ביתיים</h3>
            <p className="feature-card__description">
              מרק עדשים חם ומזין, בדיוק כמו של סבתא
            </p>
          </div>
          <div className="feature-card">
            <Icon name="schedule" size="xl" filled className="feature-card__icon" />
            <h3 className="feature-card__title">הזמנה מראש</h3>
            <p className="feature-card__description">
              בחרו את השעה הנוחה לכם לאיסוף
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
