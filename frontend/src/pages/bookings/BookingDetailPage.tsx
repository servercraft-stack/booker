import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Calendar, MapPin, Users, CreditCard, Clock,
  CheckCircle, XCircle, Trash2,
} from 'lucide-react'
import { bookingService } from '@/services/booking.service'
import { apartmentService } from '@/services/apartment.service'
import { formatCurrency, formatDateRange } from '@/lib/utils'
import { BookingStatusBadge, Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.detail(id!),
    enabled: !!id,
  })

  const { data: apartment } = useQuery({
    queryKey: ['apartment', booking?.apartment],
    queryFn: () => apartmentService.detail(booking!.apartment),
    enabled: !!booking?.apartment,
  })

  const cancelMutation = useMutation({
    mutationFn: () => bookingService.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking cancelled')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to cancel booking')
    },
  })

  const payMutation = useMutation({
    mutationFn: () => bookingService.createCheckout(id!),
    onSuccess: (data) => {
      window.location.href = data.url
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to create checkout session')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => bookingService.deleteCancelled(id!),
    onSuccess: () => {
      toast.success('Booking permanently deleted')
      navigate('/bookings')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to delete booking')
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-red-50 p-8 text-center dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">
            Booking not found or you don't have access.
          </p>
          <Link to="/bookings" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
            Back to bookings
          </Link>
        </div>
      </div>
    )
  }

  const isPaid = booking.payment_status === 'paid'
  const isUnpaid = booking.payment_status === 'unpaid'
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        to="/bookings"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm dark:border-surface-700 dark:bg-surface-800"
      >
        {/* Header */}
        <div className="border-b border-surface-100 p-6 dark:border-surface-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-surface-900 dark:text-white">
                {apartment?.title || `Booking #${booking.id.slice(0, 8)}`}
              </h1>
              {apartment?.address && (
                <p className="mt-1 flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {apartment.address.city}, {apartment.address.country}
                </p>
              )}
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        {/* Details grid */}
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wide">
              Stay Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-surface-400" />
                <div>
                  <span className="text-surface-500 dark:text-surface-400">Dates</span>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {formatDateRange(booking.check_in, booking.check_out)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-surface-400" />
                <div>
                  <span className="text-surface-500 dark:text-surface-400">Duration</span>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {booking.nights} night{booking.nights !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-surface-400" />
                <div>
                  <span className="text-surface-500 dark:text-surface-400">Guests</span>
                  <p className="font-medium text-surface-900 dark:text-white">
                    {booking.guests_count} guest{booking.guests_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wide">
              Payment
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="h-4 w-4 text-surface-400" />
                <div>
                  <span className="text-surface-500 dark:text-surface-400">Status</span>
                  <p className="mt-0.5">
                    <Badge variant={booking.payment_status === 'paid' ? 'success' : 'warning'}>
                      {booking.payment_status}
                    </Badge>
                  </p>
                </div>
              </div>
              {booking.total_price && (
                <div className="rounded-lg bg-surface-50 p-4 dark:bg-surface-700/50">
                  <span className="text-sm text-surface-500 dark:text-surface-400">Total amount</span>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">
                    {formatCurrency(booking.total_price)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-surface-100 p-6 dark:border-surface-700">
          <div className="flex flex-wrap gap-3">
            {isPaid && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                Payment confirmed — you're all set!
              </div>
            )}
            {isUnpaid && canCancel && (
              <Button
                onClick={() => payMutation.mutate()}
                isLoading={payMutation.isPending}
              >
                <CreditCard className="h-4 w-4" />
                Pay Now
              </Button>
            )}
            {canCancel && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this booking?')) {
                    cancelMutation.mutate()
                  }
                }}
                isLoading={cancelMutation.isPending}
              >
                <XCircle className="h-4 w-4" />
                Cancel Booking
              </Button>
            )}
            {booking.status === 'cancelled' && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Are you sure you want to permanently delete this cancelled booking? This action cannot be undone.')) {
                    deleteMutation.mutate()
                  }
                }}
                isLoading={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete Booking
              </Button>
            )}
            {booking.status === 'completed' && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                This booking has been completed
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
