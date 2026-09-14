import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle, ArrowLeft } from 'lucide-react'
import { authService } from '@/services/auth.service'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string })?.email || ''

  const [form, setForm] = useState({
    email,
    otp: '',
    new_password: '',
    new_password_confirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await authService.confirmPasswordReset(form)
      setIsSuccess(true)
      toast.success('Password reset successful!')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      if (data?.detail) {
        setErrors({ form: data.detail as string })
      } else if (data) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) fieldErrors[key] = value[0] as string
          else if (typeof value === 'string') fieldErrors[key] = value
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ form: 'Password reset failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-surface-900 dark:text-white">
            Password Reset!
          </h1>
          <p className="mt-3 text-surface-500 dark:text-surface-400">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Button onClick={() => navigate('/login')} className="mt-8" size="lg">
            Sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600">
            <Building2 className="h-8 w-8" />
            StayVibe
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-surface-900 dark:text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Enter the code from your email and your new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {errors.form && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {errors.form}
            </div>
          )}

          {!email && (
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              required
            />
          )}

          <Input
            label="Verification code"
            placeholder="000000"
            value={form.otp}
            onChange={(e) => setForm((p) => ({ ...p, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
            error={errors.otp}
            required
            maxLength={6}
            inputMode="numeric"
            className="tracking-widest text-center"
          />

          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            value={form.new_password}
            onChange={handleChange('new_password')}
            error={errors.new_password}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            value={form.new_password_confirm}
            onChange={handleChange('new_password_confirm')}
            error={errors.new_password_confirm}
            required
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Reset password
          </Button>
        </form>

        <Link
          to="/login"
          className="mt-8 flex items-center justify-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
