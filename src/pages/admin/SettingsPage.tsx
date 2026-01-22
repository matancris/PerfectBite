import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { AppButton, AppInput, ImageUpload, BusinessLogo } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { useBusinessStore } from '@/stores/business.store'
import { storageService } from '@/services/storage.service'

const settingsSchema = z.object({
  name: z.string().min(1, 'שם העסק חובה'),
  phone: z.string().min(9, 'מספר טלפון לא תקין'),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export function AdminSettingsPage() {
  const { showSuccess, showError } = useToast()
  const { business, isLoading, updateBusiness, fetchBusiness } = useBusinessStore()
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  // Load business data into form when it's available
  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        phone: business.phone,
        email: business.email || '',
      })
    }
  }, [business, reset])

  // Fetch business if not loaded
  useEffect(() => {
    if (!business) {
      fetchBusiness()
    }
  }, [business, fetchBusiness])

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateBusiness({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
      })
      showSuccess('ההגדרות נשמרו בהצלחה')
    } catch {
      showError('שגיאה בשמירת ההגדרות')
    }
  }

  const handleLogoUpload = useCallback(async (file: File) => {
    if (!business) return

    setIsUploadingLogo(true)
    const result = await storageService.uploadLogo(business.id, file)
    setIsUploadingLogo(false)

    if (result.error || !result.data) {
      showError('שגיאה בהעלאת הלוגו: ' + (result.error || 'שגיאה לא צפויה'))
      return
    }

    // Update business settings with new logo URL
    await updateBusiness({
      settings: { ...business.settings, logoUrl: result.data },
    })
    showSuccess('הלוגו הועלה בהצלחה!')
  }, [business, updateBusiness, showError, showSuccess])

  const handleLogoRemove = useCallback(async () => {
    if (!business) return

    setIsUploadingLogo(true)
    const result = await storageService.deleteLogo(business.id)
    setIsUploadingLogo(false)

    if (result.error) {
      showError('שגיאה במחיקת הלוגו')
      return
    }

    // Remove logo URL from settings
    await updateBusiness({
      settings: { ...business.settings, logoUrl: undefined },
    })
    showSuccess('הלוגו הוסר בהצלחה')
  }, [business, updateBusiness, showError, showSuccess])

  if (isLoading && !business) {
    return (
      <div className="settings-page settings-page--loading">
        <div className="spinner" />
        <p>טוען הגדרות...</p>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <h1 className="settings-page__title">הגדרות העסק</h1>

      <form className="settings-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="settings-form__section">
          <h2 className="settings-form__section-title">פרטי העסק</h2>
          <p className="settings-form__section-desc">
            הפרטים האלה יוצגו ללקוחות באתר ההזמנות
          </p>
          
          <div className="settings-form__field">
            <label htmlFor="name">שם העסק</label>
            <AppInput
              id="name"
              placeholder="לדוגמא: יעל מאפים"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          <div className="settings-form__field">
            <label htmlFor="phone">טלפון</label>
            <AppInput
              id="phone"
              type="tel"
              placeholder="054-1234567"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <div className="settings-form__field">
            <label htmlFor="email">אימייל (אופציונלי)</label>
            <AppInput
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
        </div>

        <div className="settings-form__section">
          <h2 className="settings-form__section-title">לוגו העסק</h2>
          <p className="settings-form__section-desc">
            הלוגו יוצג בכותרת האתר, בדף ההתחברות ובלוח הבקרה
          </p>
          
          <ImageUpload
            currentImageUrl={business?.settings?.logoUrl}
            onUpload={handleLogoUpload}
            onRemove={business?.settings?.logoUrl ? handleLogoRemove : undefined}
            isLoading={isUploadingLogo}
            label="לוגו העסק"
            placeholder="גרור לוגו לכאן או לחץ לבחירה"
          />
        </div>

        <div className="settings-form__preview">
          <h3>תצוגה מקדימה</h3>
          <div className="settings-form__preview-card">
            <BusinessLogo logoUrl={business?.settings?.logoUrl} size="lg" className="settings-form__preview-icon" />
            <span className="settings-form__preview-name">
              {business?.name || 'שם העסק'}
            </span>
          </div>
        </div>

        <div className="settings-form__actions">
          <AppButton type="submit" variant="primary" isLoading={isSubmitting}>
            שמור שינויים
          </AppButton>
        </div>
      </form>
    </div>
  )
}
