import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import type { MenuItem, MenuCategory } from '@/types'
import { AppDialog, AppButton, AppInput, AppTextarea, AppSelect } from '@/components/ui'
import { useMenuStore } from '@/stores/menu.store'
import { useToast } from '@/hooks/useToast'

interface MenuItemDialogProps {
  item: MenuItem | null
  categories: MenuCategory[]
  onClose: () => void
}

const menuItemSchema = z.object({
  name: z.string().min(1, 'שם הפריט חובה'),
  description: z.string().optional(),
  price: z.number().min(0, 'מחיר חייב להיות חיובי'),
  categoryId: z.string().optional(),
  imageUrl: z.string().url('כתובת URL לא תקינה').optional().or(z.literal('')),
  isActive: z.boolean(),
  availableAnytime: z.boolean(),
})

type FormData = z.infer<typeof menuItemSchema>

export function MenuItemDialog({ item, categories, onClose }: MenuItemDialogProps) {
  const addItem = useMenuStore((state) => state.addItem)
  const updateItem = useMenuStore((state) => state.updateItem)
  const { showSuccess, showError } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item?.name ?? '',
      description: item?.description ?? '',
      price: item?.price ?? 0,
      categoryId: item?.categoryId ?? '',
      imageUrl: item?.imageUrl ?? '',
      isActive: item?.isActive ?? true,
      availableAnytime: item?.availableAnytime ?? false,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      if (item) {
        await updateItem(item.id, {
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId || undefined,
          imageUrl: data.imageUrl || undefined,
          isActive: data.isActive,
          availableAnytime: data.availableAnytime,
        })
        showSuccess('הפריט עודכן בהצלחה')
      } else {
        await addItem({
          businessId: import.meta.env.VITE_BUSINESS_ID || 'default',
          name: data.name,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId || undefined,
          imageUrl: data.imageUrl || undefined,
          isActive: data.isActive,
          availableAnytime: data.availableAnytime,
        })
        showSuccess('הפריט נוסף בהצלחה')
      }
      onClose()
    } catch {
      showError('שגיאה בשמירת הפריט')
    }
  }

  return (
    <AppDialog
      isOpen={true}
      onClose={onClose}
      title={item ? 'עריכת פריט' : 'הוספת פריט חדש'}
      size="md"
      footer={
        <div className="menu-item-dialog__footer">
          <AppButton variant="secondary" onClick={onClose}>
            ביטול
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            {item ? 'שמור שינויים' : 'הוסף פריט'}
          </AppButton>
        </div>
      }
    >
      <form className="menu-item-dialog__form">
        <div className="menu-item-dialog__field">
          <AppInput
            label="שם הפריט"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div className="menu-item-dialog__field">
          <AppTextarea
            label="תיאור"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="menu-item-dialog__field">
          <AppInput
            label="מחיר (₪)"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
          />
        </div>

        <div className="menu-item-dialog__field">
          <AppSelect
            label="קטגוריה"
            placeholder="בחר קטגוריה"
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            {...register('categoryId')}
          />
        </div>

        <div className="menu-item-dialog__field">
          <AppInput
            label="כתובת תמונה (URL)"
            type="url"
            {...register('imageUrl')}
            error={errors.imageUrl?.message}
          />
        </div>

        <div className="menu-item-dialog__field">
          <label className="menu-item-dialog__checkbox">
            <input type="checkbox" {...register('isActive')} />
            <span>פריט פעיל</span>
          </label>
        </div>

        <div className="menu-item-dialog__field">
          <label className="menu-item-dialog__checkbox">
            <input type="checkbox" {...register('availableAnytime')} />
            <span>זמין להזמנה תמיד (ללא אירוע)</span>
          </label>
          <p className="menu-item-dialog__hint">
            סמנו אם הפריט זמין להזמנה גם כשאין אירוע פעיל
          </p>
        </div>
      </form>
    </AppDialog>
  )
}
