import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, Home, Eye, DollarSign, Calendar, ExternalLink, Inbox,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { apartmentService } from '@/services/apartment.service'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import type { Apartment } from '@/types/api'

export default function HostDashboardPage() {
  const { user } = useAuth()
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [stats, setStats] = useState({ totalListings: 0, activeListings: 0, totalBookings: 0, totalRevenue: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchHostData() {
      try {
        const [statsData, aptList] = await Promise.all([
          apartmentService.getHostStats(),
          apartmentService.list({ limit: 100 }),
        ])

        // Filter to host's own apartments
        const hostApts = aptList.results.filter(
          (apt) => apt.host === user?.full_name || apt.host === user?.email
        )

        setApartments(hostApts)
        setStats({
          totalListings: statsData.total_listings,
          activeListings: statsData.active_listings,
          totalBookings: statsData.total_bookings,
          totalRevenue: statsData.total_revenue,
        })
      } catch {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) fetchHostData()
  }, [user])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-red-50 p-8 text-center dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">
            Failed to load dashboard. Please try again.
          </p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Listings', value: stats.totalListings, icon: Home, color: 'text-primary-600' },
    { label: 'Active Listings', value: stats.activeListings, icon: Eye, color: 'text-emerald-600' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-amber-600' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-primary-600' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
            Host Dashboard
          </h1>
          <p className="mt-2 text-surface-500 dark:text-surface-400">
            Manage your listings and track performance
          </p>
        </div>
        <Link
          to="/host/create"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-700 dark:bg-surface-800"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-700 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">{stat.label}</p>
                <p className="text-xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Listings */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">
          Your Listings
        </h2>

        {apartments.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-surface-50 p-12 text-center dark:bg-surface-800">
            <Inbox className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" />
            <p className="mt-4 text-lg font-medium text-surface-600 dark:text-surface-400">
              No listings yet
            </p>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              Create your first listing and start earning!
            </p>
            <Link
              to="/host/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apartments.map((apt, i) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-800"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-100 dark:bg-surface-700">
                  {apt.image_url ? (
                    <img
                      src={apt.image_url}
                      alt={apt.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🏠</div>
                  )}
                  <div className="absolute right-3 top-3">
                    <Badge variant={apt.is_active ? 'success' : 'danger'}>
                      {apt.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 dark:text-white line-clamp-1">
                    {apt.title}
                  </h3>
                  {apt.pricing && (
                    <p className="mt-1 text-sm font-bold text-surface-900 dark:text-white">
                      {formatCurrency(apt.pricing.price_per_night, apt.pricing.currency)}
                      <span className="font-normal text-surface-500 dark:text-surface-400">/night</span>
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/apartments/${apt.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-100 px-3 py-2 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
