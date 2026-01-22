import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useAuthStore } from '@/stores/auth.store'
import { useBusinessStore } from '@/stores/business.store'
import { AppButton, AppInput, BusinessLogo } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

const loginSchema = z.object({
  email: z.email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuthStore()
  const business = useBusinessStore((state) => state.business)
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const businessName = business?.name || 'מערכת הזמנות'
  const logoUrl = business?.settings?.logoUrl
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    const { error } = await signIn(data.email, data.password)
    setIsLoading(false)

    if (error) {
      showToast({ type: 'error', message: 'שם משתמש או סיסמה שגויים' })
      return
    }

    showToast({ type: 'success', message: 'התחברת בהצלחה!' })
    navigate(from, { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <BusinessLogo logoUrl={logoUrl} size="xl" className="login-card__logo" />
          <h1 className="login-card__title">{businessName}</h1>
          <p className="login-card__subtitle">התחברות למערכת הניהול</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="login-form__field">
            <label htmlFor="email">אימייל</label>
            <AppInput
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div className="login-form__field">
            <label htmlFor="password">סיסמה</label>
            <AppInput
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          <AppButton
            type="submit"
            variant="primary"
            className="login-form__submit"
            disabled={isLoading}
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </AppButton>
        </form>
      </div>
    </div>
  )
}
