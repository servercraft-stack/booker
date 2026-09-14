import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear field error on change
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
      await authService.register(form)
      toast.success('Account created! Please verify your email.')
      navigate('/verify-email', { state: { email: form.email } })
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      if (data) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) fieldErrors[key] = value[0] as string
          else if (typeof value === 'string') fieldErrors[key] = value
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ form: 'Registration failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Join StayVibe and start exploring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {errors.form && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              placeholder="John"
              value={form.first_name}
              onChange={handleChange('first_name')}
              error={errors.first_name}
              required
            />
            <Input
              label="Last name"
              placeholder="Doe"
              value={form.last_name}
              onChange={handleChange('last_name')}
              error={errors.last_name}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            required
            autoComplete="new-password"
            helperText="At least 8 characters"
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={form.password_confirm}
            onChange={handleChange('password_confirm')}
            error={errors.password_confirm}
            required
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Create account
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-surface-500 dark:bg-surface-900 dark:text-surface-400">
                or sign up with
              </span>
            </div>
          </div>

          <div className="mt-4">
            <GoogleAuthButton
              text="signup_with"
              label="Sign up with Google"
              onCredential={async (credential) => {
                await loginWithGoogle(credential)
                toast.success('Welcome to StayVibe!')
                navigate('/apartments')
              }}
            />
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
