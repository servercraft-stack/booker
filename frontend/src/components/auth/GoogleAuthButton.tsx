import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'

interface GoogleAuthButtonProps {
  onCredential: (credential: string) => Promise<void> | void
  text?: 'signin_with' | 'signup_with' | 'continue_with'
  label?: string
  className?: string
}

export default function GoogleAuthButton({
  onCredential,
  text = 'continue_with',
  label = 'Continue with Google',
  className,
}: GoogleAuthButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        Google sign-in is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> in your frontend env.
      </div>
    )
  }

  const handleSuccess = async (response: CredentialResponse) => {
    setError(null)
    if (!response.credential) {
      setError('Google did not return a credential.')
      return
    }
    try {
      await onCredential(response.credential)
    } catch (err) {
      const data = (err as { response?: { data?: { detail?: string } } })?.response?.data
      setError(data?.detail || 'Google sign-in failed. Please try again.')
    }
  }

  const handleError = () => {
    setError('Google sign-in was cancelled or failed.')
  }

  return (
    <div className={className}>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={text}
          shape="rectangular"
          size="large"
          width="320"
          logo_alignment="left"
          useOneTap={false}
        />
      </div>
      {label && (
        <p className="mt-2 text-center text-xs text-surface-500 dark:text-surface-400">
          {label}
        </p>
      )}
      {error && (
        <p className="mt-2 text-center text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
