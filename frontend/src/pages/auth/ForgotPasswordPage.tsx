import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Mail } from 'lucide-react'
import { authService } from '@/services/auth.service'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await authService.requestPasswordReset({ email })
      setIsSent(true)
      toast.success('If an account exists, a reset link has been sent.')
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.detail) {
        setErrors({ form: data.detail })
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
            <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-surface-900 dark:text-white">
            Check your email
          </h1>
          <p className="mt-3 text-surface-500 dark:text-surface-400">
            If an account with <strong>{email}</strong> exists, we've sent a password reset code.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              to="/reset-password"
              state={{ email }}
              className="block w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Enter reset code
            </Link>
            <button
              onClick={() => setIsSent(false)}
              className="block w-full text-sm font-medium text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
            >
              Try a different email
            </button>
          </div>
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
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Enter your email and we'll send you a code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {errors.form && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {errors.form}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Send reset code
          </Button>
        </form>

        <Link
          to="/login"
          className="mt-8 flex items-center justify-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}
