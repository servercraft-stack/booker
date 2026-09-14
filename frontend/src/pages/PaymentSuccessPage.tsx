import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CheckCircle, Home, Calendar, Loader2, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { bookingService } from '@/services/booking.service'
import Button from '@/components/ui/Button'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    // After Stripe redirect, the URL has ?session_id=cs_xxx
    // We can't extract the booking ID from session_id directly,
    // so we verify via the latest unpaid booking for this user.
    async function verify() {
      if (!user) {
        setVerifying(false)
        return
      }
      try {
        const bookings = await bookingService.listMyBookings()
        // Find the most recent unpaid booking and try to verify it
        const unpaid = bookings.find(
          (b) => b.payment_status === 'unpaid' && b.status === 'pending'
        )
        if (unpaid) {
          const result = await bookingService.verifyPayment(unpaid.id)
          setVerified(result.payment_status === 'paid')
        } else {
          // Already paid or no unpaid bookings
          setVerified(true)
        }
      } catch {
        setVerified(false)
      } finally {
        setVerifying(false)
      }
    }
    verify()
  }, [user])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        {verifying ? (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Loader2 className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-surface-900 dark:text-white">
              Verifying Payment...
            </h1>
            <p className="mt-3 text-surface-500 dark:text-surface-400">
              Please wait while we confirm your payment.
            </p>
          </>
        ) : verified ? (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-surface-900 dark:text-white">
              Payment Successful!
            </h1>
            <p className="mt-3 text-surface-500 dark:text-surface-400">
              Your booking has been confirmed. You'll receive a confirmation email shortly.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-surface-900 dark:text-white">
              Payment Not Confirmed
            </h1>
            <p className="mt-3 text-surface-500 dark:text-surface-400">
              We couldn't confirm your payment. Please check your bookings page or try again.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link to="/bookings" className="w-full">
            <Button className="w-full" size="lg">
              <Calendar className="h-4 w-4" />
              View My Bookings
            </Button>
          </Link>
          <Link
            to="/"
            className="w-full rounded-xl border border-surface-300 bg-white px-5 py-3 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
          >
            <Home className="inline h-4 w-4 mr-1.5" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
