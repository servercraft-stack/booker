import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle, ArrowLeft } from 'lucide-react'
import { authService } from '@/services/auth.service'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string })?.email || ''

  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCountdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await authService.verifyOTP({ email, otp })
      setIsVerified(true)
      toast.success('Email verified! You can now sign in.')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      if (data?.detail) {
        setErrors({ form: data.detail as string })
      } else if (data?.otp) {
        setErrors({ otp: Array.isArray(data.otp) ? data.otp[0] as string : data.otp as string })
      } else {
        setErrors({ form: 'Verification failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCountdown > 0) return
    try {
      await authService.sendOTP({ email, purpose: 'account verification' })
      toast.success('OTP sent! Check your email.')
      setResendCountdown(60)
    } catch {
      toast.error('Failed to send OTP. Please try again.')
    }
  }

  if (isVerified) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-surface-900 dark:text-white">
            Email Verified!
          </h1>
          <p className="mt-3 text-surface-500 dark:text-surface-400">
            Your email has been verified successfully. You can now sign in to your account.
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
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            We've sent a 6-digit code to{' '}
            <span className="font-medium text-surface-700 dark:text-surface-300">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          {errors.form && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {errors.form}
            </div>
          )}

          <Input
            label="Verification code"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={errors.otp}
            required
            maxLength={6}
            pattern="\d{6}"
            inputMode="numeric"
            className="text-center text-lg tracking-widest"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Verify email
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCountdown > 0}
            className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-surface-400 disabled:cursor-not-allowed"
          >
            {resendCountdown > 0
              ? `Resend code in ${resendCountdown}s`
              : 'Resend code'}
          </button>
        </div>

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
