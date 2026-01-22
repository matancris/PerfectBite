import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppButton, AppCard, Icon } from '@/components/ui'
import { useBusinessStore } from '@/stores/business.store'
import { useDocumentTitle } from '@/hooks'
import { eventService } from '@/services/event.service'
import type { Event } from '@/types'
import { formatDate } from '@/utils/formatters'

export function HomePage() {
  const business = useBusinessStore((state) => state.business)
  const businessName = business?.name || 'המאפייה שלנו'
  const [activeEvents, setActiveEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useDocumentTitle()

  useEffect(() => {
    async function fetchActiveEvents() {
      setIsLoading(true)
      const result = await eventService.getActiveEvents()
      if (result.data) {
        setActiveEvents(result.data)
      }
      setIsLoading(false)
    }
    fetchActiveEvents()
  }, [])

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
                לתפריט הקבוע
              </AppButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Events Section */}
      {!isLoading && activeEvents.length > 0 && (
        <section className="events-section">
          <h2 className="events-section__title">
            <Icon name="event" size="lg" />
            הזמנות פתוחות
          </h2>
          <div className="events-section__grid">
            {activeEvents.map((event) => (
              <AppCard key={event.id} className="event-card">
                <div className="event-card__header">
                  <Icon name="celebration" size="lg" className="event-card__icon" />
                  <h3 className="event-card__title">{event.title}</h3>
                </div>
                {event.description && (
                  <p className="event-card__description">{event.description}</p>
                )}
                <div className="event-card__details">
                  <div className="event-card__detail">
                    <Icon name="calendar_today" size="sm" />
                    <span>תאריך: {formatDate(event.eventDate)}</span>
                  </div>
                  <div className="event-card__detail event-card__detail--deadline">
                    <Icon name="timer" size="sm" />
                    <span>
                      הזמנות עד: {new Date(event.orderDeadline).toLocaleString('he-IL', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
                <Link to={`/menu/${event.id}`} className="event-card__action">
                  <AppButton variant="primary" fullWidth>
                    <Icon name="shopping_bag" size="sm" />
                    להזמנה
                  </AppButton>
                </Link>
              </AppCard>
            ))}
          </div>
        </section>
      )}

      <section className="features">
        <div className="features__container">
          <div className="feature-card">
            <Icon name="bakery_dining" size="xl" filled className="feature-card__icon" />
            <h3 className="feature-card__title">מאפים טריים</h3>
            <p className="feature-card__description">
              מאפים עשויים בעבודת יד עם חומרי הגלם הטובים ביותר
            </p>
          </div>
          <div className="feature-card">
            <Icon name="local_pizza" size="xl" filled className="feature-card__icon" />
            <h3 className="feature-card__title">פיצות ומנות</h3>
            <p className="feature-card__description">
              פיצות טריות ומנות מיוחדות לכל אירוע
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
