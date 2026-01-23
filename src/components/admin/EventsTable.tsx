import type { Event } from '@/types'
import { formatDate } from '@/utils/formatters'
import { AppButton, AppBadge, Icon } from '@/components/ui'
import { useEventsStore } from '@/stores/events.store'
import { useToast } from '@/hooks/useToast'

interface EventsTableProps {
  events: Event[]
  onEdit: (event: Event) => void
}

export function EventsTable({ events, onEdit }: EventsTableProps) {
  const deleteEvent = useEventsStore((state) => state.deleteEvent)
  const { showSuccess, showError } = useToast()

  const handleDelete = async (event: Event) => {
    if (!confirm(`האם למחוק את "${event.title}"?`)) return

    try {
      await deleteEvent(event.id)
      showSuccess('האירוע נמחק בהצלחה')
    } catch {
      showError('שגיאה במחיקת האירוע')
    }
  }

  if (events.length === 0) {
    return (
      <div className="events-table events-table--empty">
        <Icon name="event_busy" size="xl" />
        <p>אין אירועים להצגה</p>
        <span>צור אירוע חדש כדי להתחיל לקבל הזמנות</span>
      </div>
    )
  }

  return (
    <div className="events-table">
      <table>
        <thead>
          <tr>
            <th>כותרת</th>
            <th>תאריך</th>
            <th>שעות</th>
            <th>מועד אחרון</th>
            <th>סטטוס</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const isPast = new Date(event.orderDeadline) < new Date()
            
            return (
              <tr key={event.id} className={isPast ? 'events-table__row--past' : ''}>
                <td data-label="כותרת">{event.title}</td>
                <td data-label="תאריך">{formatDate(event.eventDate)}</td>
                <td data-label="שעות" className="events-table__time">
                  {event.startTime} - {event.endTime}
                </td>
                <td data-label="מועד אחרון">{formatDate(event.orderDeadline)}</td>
                <td data-label="סטטוס">
                  {isPast ? (
                    <AppBadge variant="default">הסתיים</AppBadge>
                  ) : (
                    <AppBadge variant={event.isActive ? 'success' : 'default'}>
                      {event.isActive ? 'פעיל' : 'לא פעיל'}
                    </AppBadge>
                  )}
                </td>
                <td data-label="" className="events-table__actions">
                  <AppButton
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(event)}
                  >
                    <Icon name="edit" size="sm" />
                    ערוך
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(event)}
                  >
                    <Icon name="delete" size="sm" />
                  </AppButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
