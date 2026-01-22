import { Link } from 'react-router-dom'
import { AppButton, Icon } from '@/components/ui'
import { useDocumentTitle } from '@/hooks'

export function NotFoundPage() {
  useDocumentTitle('הדף לא נמצא')

  return (
    <div className="not-found-page">
      <div className="not-found-page__content">
        <Icon name="search_off" size="2xl" className="not-found-page__icon" />
        <h1 className="not-found-page__title">404</h1>
        <h2 className="not-found-page__subtitle">הדף לא נמצא</h2>
        <p className="not-found-page__message">
          מצטערים, הדף שחיפשתם לא קיים או שהועבר למקום אחר.
        </p>
        <div className="not-found-page__actions">
          <Link to="/">
            <AppButton variant="primary">
              <Icon name="home" size="sm" />
              חזרה לדף הבית
            </AppButton>
          </Link>
          <Link to="/menu">
            <AppButton variant="secondary">
              <Icon name="restaurant_menu" size="sm" />
              לתפריט
            </AppButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
