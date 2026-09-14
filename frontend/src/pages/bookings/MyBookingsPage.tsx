import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, CreditCard, Inbox } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { bookingService } from '@/services/booking.service'
import { apartmentService } from '@/services/apartment.service'
import { formatCurrency, formatDateRange } from '@/lib/utils'
import { BookingStatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Apartment, Booking } from '@/types/api'
import { useEffect, useState } from 'react'

export default function MyBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [apartments, setApartments] = useState<Record<string, Apartment>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const myBookings = await bookingService.listMyBookings()

        // Fetch apartment details for display
        const aptIds = [...new Set(myBookings.map((b) => b.apartment))]
        const aptMap: Record<string, Apartment> = {}

        await Promise.all(
          aptIds.map(async (id) => {
            try {
              const apt = await apartmentService.detail(String(id))
              aptMap[String(id)] = apt
            } catch {
              // apartment may have been deleted
            }
          })
        )

        setApartments(aptMap)
        setBookings(myBookings)
      } catch {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) fetchBookings()
  }, [user])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-red-50 p-8 text-center dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">
            Failed to load bookings. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
        My Bookings
      </h1>
      <p className="mt-2 text-surface-500 dark:text-surface-400">
        Manage your reservations
      </p>

      {bookings.length === 0 ? (
        <div className="mt-12 rounded-2xl bg-surface-50 p-12 text-center dark:bg-surface-800">
          <Inbox className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" />
          <p className="mt-4 text-lg font-medium text-surface-600 dark:text-surface-400">
            No bookings yet
          </p>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Start exploring apartments and book your first stay!
          </p>
          <Link
            to="/apartments"
            className="mt-6 inline-block rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Browse Apartments
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((booking, i) => {
            const apt = apartments[booking.apartment]
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  to={`/bookings/${booking.id}`}
                  className="group block overflow-hidden rounded-2xl border border-surface-200 bg-white transition-shadow hover:shadow-lg dark:border-surface-700 dark:bg-surface-800"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    {apt?.image_url ? (
                      <div className="h-48 sm:h-auto sm:w-48 lg:w-56 shrink-0 overflow-hidden bg-surface-100">
                        <img
                          src={apt.image_url}
                          alt={apt.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-surface-100 text-4xl sm:h-auto sm:w-48 dark:bg-surface-700">
                        🏠
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 dark:text-white">
                            {apt?.title || `Apartment #${booking.apartment}`}
                          </h3>
                          <BookingStatusBadge status={booking.status} />
                        </div>

                        {apt?.address && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {apt.address.city}, {apt.address.country}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDateRange(booking.check_in, booking.check_out)}
                          </span>
                          <span>{booking.nights} night{booking.nights !== 1 ? 's' : ''}</span>
                          <span>{booking.guests_count} guest{booking.guests_count !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-4 dark:border-surface-700">
                        <span className="text-xs text-surface-400">
                          Booking #{booking.id.slice(0, 8)}
                        </span>
                        {booking.total_price && (
                          <span className="flex items-center gap-1 text-sm font-semibold text-surface-900 dark:text-white">
                            <CreditCard className="h-4 w-4" />
                            {formatCurrency(booking.total_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
