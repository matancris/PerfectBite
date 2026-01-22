import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import type { Event } from '@/types'
import { AppDialog, AppButton, AppInput, AppTextarea } from '@/components/ui'
import { useEventsStore } from '@/stores/events.store'
import { useToast } from '@/hooks/useToast'

interface EventDialogProps {
  event: Event | null
  onClose: () => void
}

const eventSchema = z.object({
  title: z.string().min(1, 'כותרת האירוע חובה'),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'תאריך האירוע חובה'),
  orderDeadline: z.string().min(1, 'מועד אחרון להזמנה חובה'),
  isActive: z.boolean(),
})

type FormData = z.infer<typeof eventSchema>

export function EventDialog({ event, onClose }: EventDialogProps) {
  const addEvent = useEventsStore((state) => state.addEvent)
  const updateEvent = useEventsStore((state) => state.updateEvent)
  const { showSuccess, showError } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      eventDate: event?.eventDate ?? '',
      orderDeadline: event?.orderDeadline ?? '',
      isActive: event?.isActive ?? true,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      if (event) {
        await updateEvent(event.id, {
          title: data.title,
          description: data.description,
          eventDate: data.eventDate,
          orderDeadline: data.orderDeadline,
          isActive: data.isActive,
        })
        showSuccess('האירוע עודכן בהצלחה')
      } else {
        await addEvent({
          businessId: import.meta.env.VITE_BUSINESS_ID || 'default',
          title: data.title,
          description: data.description,
          eventDate: data.eventDate,
          orderDeadline: data.orderDeadline,
          isActive: data.isActive,
        })
        showSuccess('האירוע נוסף בהצלחה')
      }
      onClose()
    } catch {
      showError('שגיאה בשמירת האירוע')
    }
  }

  return (
    <AppDialog
      isOpen={true}
      onClose={onClose}
      title={event ? 'עריכת אירוע' : 'יצירת אירוע חדש'}
      size="md"
      footer={
        <div className="event-dialog__footer">
          <AppButton variant="secondary" onClick={onClose}>
            ביטול
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            {event ? 'שמור שינויים' : 'צור אירוע'}
          </AppButton>
        </div>
      }
    >
      <form className="event-dialog__form">
        <div className="event-dialog__field">
          <AppInput
            label="כותרת האירוע"
            placeholder="לדוגמא: הזמנת פיצות - יום חמישי"
            {...register('title')}
            error={errors.title?.message}
          />
        </div>

        <div className="event-dialog__field">
          <AppTextarea
            label="תיאור"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="event-dialog__field">
          <AppInput
            label="תאריך האירוע"
            type="date"
            {...register('eventDate')}
            error={errors.eventDate?.message}
          />
        </div>

        <div className="event-dialog__field">
          <AppInput
            label="מועד אחרון להזמנה"
            type="datetime-local"
            {...register('orderDeadline')}
            error={errors.orderDeadline?.message}
          />
        </div>

        <div className="event-dialog__field">
          <label className="event-dialog__checkbox">
            <input type="checkbox" {...register('isActive')} />
            <span>אירוע פעיל</span>
          </label>
        </div>
      </form>
    </AppDialog>
  )
}
