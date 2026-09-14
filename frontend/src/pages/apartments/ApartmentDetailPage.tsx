import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MapPin, Users, BedDouble, Bath, Shield, ArrowLeft,
  Calendar, ChevronLeft, ChevronRight, Star, Send,
} from 'lucide-react'
import { apartmentService } from '@/services/apartment.service'
import { bookingService } from '@/services/booking.service'
import { reviewService } from '@/services/review.service'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, cn } from '@/lib/utils'
import { Rating } from '@/components/ui/Rating'
import Button from '@/components/ui/Button'
import { ApartmentCardSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'


/** Simple calendar component for date selection */
function DateRangePicker({
  availability,
  onSelect,
}: {
  availability: { date: string; is_available: boolean }[]
  onSelect: (checkIn: string, checkOut: string) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' })

  const unavailableDates = new Set(
    availability.filter((a) => !a.is_available).map((a) => a.date)
  )

  function formatDate(d: Date): string {
    return d.toISOString().split('T')[0]
  }

  function isAvailable(dateStr: string): boolean {
    if (unavailableDates.has(dateStr)) return false
    const d = new Date(dateStr)
    return d >= today
  }

  function isInRange(dateStr: string): boolean {
    if (!checkIn || !checkOut) return false
    return dateStr > checkIn && dateStr < (hoveredDate || checkOut)
  }

  function handleDayClick(dateStr: string) {
    if (!isAvailable(dateStr)) return

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr)
      setCheckOut(null)
    } else {
      if (dateStr <= checkIn) {
        setCheckIn(dateStr)
        setCheckOut(null)
      } else {
        // Check if any date in the range is unavailable
        const start = new Date(checkIn)
        const end = new Date(dateStr)
        let blocked = false
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (unavailableDates.has(formatDate(d))) {
            blocked = true
            break
          }
        }
        if (blocked) {
          toast.error('Some dates in the range are not available')
          setCheckIn(dateStr)
          setCheckOut(null)
        } else {
          setCheckOut(dateStr)
        }
      }
    }
  }

  // Confirm selection
  const handleConfirm = () => {
    if (checkIn && checkOut) {
      onSelect(checkIn, checkOut)
    }
  }

  const days = []
  // Empty cells for alignment
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
      <h3 className="mb-4 text-lg font-semibold text-surface-900 dark:text-white">
        Select Dates
      </h3>

      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-surface-900 dark:text-white">{monthName}</span>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-surface-400">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const available = isAvailable(dateStr)
          const isSelected = dateStr === checkIn || dateStr === checkOut
          const inRange = isInRange(dateStr)
          const isPast = new Date(dateStr) < today

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={!available || isPast}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                !available || isPast
                  ? 'cursor-not-allowed text-surface-300 dark:text-surface-600'
                  : isSelected
                    ? 'bg-primary-600 text-white'
                    : inRange
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Selected range display */}
      {checkIn && (
        <div className="mt-4 rounded-lg bg-surface-50 p-3 dark:bg-surface-700/50">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-surface-400" />
            <span className="text-surface-600 dark:text-surface-300">
              {checkIn}
              {checkOut ? ` → ${checkOut}` : ' → ?'}
            </span>
          </div>
        </div>
      )}

      {checkIn && checkOut && (
        <Button onClick={handleConfirm} className="mt-3 w-full" size="md">
          Confirm Dates
        </Button>
      )}
    </div>
  )
}

/** Review form */
function ReviewForm({ apartmentId }: { apartmentId: string }) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mutation = useMutation({
    mutationFn: () => reviewService.create(apartmentId, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', apartmentId] })
      setRating(0)
      setComment('')
      toast.success('Review submitted!')
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err?.response?.data?.detail || 'Failed to submit review'
      toast.error(msg)
    },
    onSettled: () => setIsSubmitting(false),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    setIsSubmitting(true)
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800">
      <h3 className="mb-3 text-lg font-semibold text-surface-900 dark:text-white">
        Leave a Review
      </h3>
      <div className="mb-3">
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          Your rating
        </label>
        <Rating value={rating} interactive onChange={setRating} size="lg" />
      </div>
      <div className="mb-3">
        <label htmlFor="review-comment" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          Your review
        </label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience..."
          className="w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
        />
      </div>
      <Button type="submit" size="sm" isLoading={isSubmitting} disabled={rating === 0}>
        <Send className="h-3.5 w-3.5" />
        Submit Review
      </Button>
    </form>
  )
}

export default function ApartmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(null)
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(null)
  const [guestsCount, setGuestsCount] = useState(1)

  const { data: apartment, isLoading, error } = useQuery({
    queryKey: ['apartment', id],
    queryFn: () => apartmentService.detail(id!),
    enabled: !!id,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewService.listByApartment(id!),
    enabled: !!id,
  })

  const bookingMutation = useMutation({
    mutationFn: () =>
      bookingService.create(id!, {
        check_in: selectedCheckIn!,
        check_out: selectedCheckOut!,
        guests_count: guestsCount,
      }),
    onSuccess: (booking: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking created! Redirecting to payment...')
      navigate(`/bookings/${booking.id}`)
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      const msg = err?.response?.data?.detail || 'Failed to create booking'
      toast.error(msg)
    },
  })

  const handleDateSelect = (checkIn: string, checkOut: string) => {
    setSelectedCheckIn(checkIn)
    setSelectedCheckOut(checkOut)
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book')
      navigate('/login')
      return
    }
    if (!selectedCheckIn || !selectedCheckOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }
    bookingMutation.mutate()
  }

  // Calculate nights and total price
  const nights =
    selectedCheckIn && selectedCheckOut
      ? Math.ceil(
          (new Date(selectedCheckOut).getTime() - new Date(selectedCheckIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

  const totalPrice =
    apartment?.pricing && nights > 0
      ? Number(apartment.pricing.price_per_night) * nights +
        Number(apartment.pricing.cleaning_fee) +
        Number(apartment.pricing.service_fee)
      : 0

  const avgRating =
    reviews.length > 0
      ? reviews.reduce<number>((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ApartmentCardSkeleton />
      </div>
    )
  }

  if (error || !apartment) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-red-50 p-8 text-center dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">
            Failed to load apartment. It may have been removed.
          </p>
          <Link to="/apartments" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
            Browse other apartments
          </Link>
        </div>
      </div>
    )
  }

  const pricing = apartment.pricing
  const address = apartment.address

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        to="/apartments"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-surface-100 dark:bg-surface-700"
          >
            {apartment.image_url ? (
              <img
                src={apartment.image_url}
                alt={apartment.title}
                className="h-64 w-full object-cover sm:h-80 lg:h-96"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-6xl sm:h-80 lg:h-96">
                🏠
              </div>
            )}
            <div className="absolute left-4 top-4 flex gap-2">
              {apartment.is_verified && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                  <Shield className="h-3 w-3" />
                  Verified
                </span>
              )}
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-surface-700 backdrop-blur dark:bg-surface-900/90 dark:text-surface-300">
                {apartment.property_type.replace('_', ' ')}
              </span>
            </div>
          </motion.div>

          {/* Title & meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white sm:text-3xl">
                  {apartment.title}
                </h1>
                {address && (
                  <p className="mt-2 flex items-center gap-1.5 text-surface-500 dark:text-surface-400">
                    <MapPin className="h-4 w-4" />
                    {address.city}, {address.state}, {address.country}
                  </p>
                )}
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 dark:bg-amber-900/20">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-surface-900 dark:text-white">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    ({reviews.length})
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-surface-600 dark:text-surface-400">
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" />
                {apartment.total_bedrooms} bedroom{apartment.total_bedrooms !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                {apartment.total_bathrooms} bathroom{apartment.total_bathrooms !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Up to {apartment.max_guests} guest{apartment.max_guests !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              About this place
            </h2>
            <p className="mt-3 whitespace-pre-line text-surface-600 dark:text-surface-400 leading-relaxed">
              {apartment.description}
            </p>
          </motion.div>

          {/* Amenities */}
          {apartment.apartment_amenities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                What this place offers
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {apartment.apartment_amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2.5 rounded-xl border border-surface-100 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800"
                  >
                    <span className="text-lg">{amenity.icon || '✓'}</span>
                    <span className="text-sm text-surface-700 dark:text-surface-300">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Rules */}
          {apartment.rules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                House rules
              </h2>
              <ul className="mt-3 space-y-2">
                {apartment.rules.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400"
                  >
                    <span className="mt-0.5 text-primary-500">&#8226;</span>
                    {rule.rule_text}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>

            {isAuthenticated && <ReviewForm apartmentId={id!} />}

            {reviews.length === 0 ? (
              <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
                No reviews yet. Be the first to leave one!
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-surface-100 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                          {review.user_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">
                            {review.user_name || 'Anonymous'}
                          </p>
                          <Rating value={review.rating} size="sm" />
                        </div>
                      </div>
                      <time className="text-xs text-surface-400">
                        {new Date(review.created_at).toLocaleDateString('en-GB')}
                      </time>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm text-surface-600 dark:text-surface-400">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar — Booking card */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-surface-200 bg-white p-6 shadow-lg dark:border-surface-700 dark:bg-surface-800"
          >
            {pricing && (
              <div className="mb-5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-surface-900 dark:text-white">
                  {formatCurrency(pricing.price_per_night, pricing.currency)}
                </span>
                <span className="text-sm text-surface-500 dark:text-surface-400">/night</span>
              </div>
            )}

            <DateRangePicker
              availability={apartment.availability}
              onSelect={handleDateSelect}
            />

            {/* Guests */}
            <div className="mt-4">
              <label htmlFor="guests" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Guests
              </label>
              <select
                id="guests"
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100"
              >
                {Array.from({ length: apartment.max_guests }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} guest{i !== 0 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Price breakdown */}
            {nights > 0 && pricing && (
              <div className="mt-5 space-y-3 border-t border-surface-200 pt-5 dark:border-surface-700">
                <div className="flex justify-between text-sm text-surface-600 dark:text-surface-400">
                  <span>{formatCurrency(pricing.price_per_night, pricing.currency)} × {nights} nights</span>
                  <span>{formatCurrency(Number(pricing.price_per_night) * nights, pricing.currency)}</span>
                </div>
                {Number(pricing.cleaning_fee) > 0 && (
                  <div className="flex justify-between text-sm text-surface-600 dark:text-surface-400">
                    <span>Cleaning fee</span>
                    <span>{formatCurrency(pricing.cleaning_fee, pricing.currency)}</span>
                  </div>
                )}
                {Number(pricing.service_fee) > 0 && (
                  <div className="flex justify-between text-sm text-surface-600 dark:text-surface-400">
                    <span>Service fee</span>
                    <span>{formatCurrency(pricing.service_fee, pricing.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-surface-200 pt-3 font-semibold text-surface-900 dark:border-surface-700 dark:text-white">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice, pricing.currency)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleBookNow}
              className="mt-5 w-full"
              size="lg"
              isLoading={bookingMutation.isPending}
              disabled={nights === 0}
            >
              {nights === 0 ? 'Select dates to book' : 'Reserve'}
            </Button>

            <p className="mt-3 text-center text-xs text-surface-400">
              You won't be charged yet
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
