import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/apartments')
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.detail) {
        setErrors({ form: data.detail })
      } else if (data) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) fieldErrors[key] = value[0] as string
          else if (typeof value === 'string') fieldErrors[key] = value
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600">
            <Building2 className="h-8 w-8" />
            StayVibe
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-surface-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
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

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Sign in
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-surface-500 dark:bg-surface-900 dark:text-surface-400">
                or continue with
              </span>
            </div>
          </div>

          <div className="mt-4">
            <GoogleAuthButton
              text="signin_with"
              label="Sign in with Google"
              onCredential={async (credential) => {
                await loginWithGoogle(credential)
                toast.success('Welcome back!')
                navigate('/apartments')
              }}
            />
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
