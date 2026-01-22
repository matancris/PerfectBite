import { useEffect, useState } from 'react'
import { useEventsStore } from '@/stores/events.store'
import { EventsTable } from '@/components/admin/EventsTable'
import { EventDialog } from '@/components/admin/EventDialog'
import { AppButton, Icon } from '@/components/ui'
import type { Event } from '@/types'

export function AdminEventsPage() {
  const { events, isLoading, fetchEvents } = useEventsStore()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleAddEvent = () => {
    setSelectedEvent(null)
    setIsDialogOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    // Refresh events after dialog closes to show updated items
    fetchEvents()
  }

  return (
    <div className="events-page">
      <div className="events-page__header">
        <h1 className="events-page__title">ניהול אירועים</h1>
        <AppButton variant="primary" onClick={handleAddEvent}>
          <Icon name="add" size="sm" />
          צור אירוע חדש
        </AppButton>
      </div>

      {isLoading ? (
        <div className="events-page__loading">
          <div className="spinner" />
          <p>טוען אירועים...</p>
        </div>
      ) : (
        <EventsTable events={events} onEdit={handleEditEvent} />
      )}

      {isDialogOpen && (
        <EventDialog event={selectedEvent} onClose={handleDialogClose} />
      )}
    </div>
  )
}
