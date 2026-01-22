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
        <p>אין אירועים להצגה</p>
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
            <th>מועד אחרון להזמנה</th>
            <th>סטטוס</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{formatDate(event.eventDate)}</td>
              <td>{formatDate(event.orderDeadline)}</td>
              <td>
                <AppBadge variant={event.isActive ? 'success' : 'default'}>
                  {event.isActive ? 'פעיל' : 'לא פעיל'}
                </AppBadge>
              </td>
              <td className="events-table__actions">
                <AppButton variant="ghost" size="sm" onClick={() => onEdit(event)}>
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
