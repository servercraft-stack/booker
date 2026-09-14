import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, MapPin, Users, BedDouble, Bath } from 'lucide-react'
import { apartmentService } from '@/services/apartment.service'
import { ApartmentCardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'
import type { Apartment } from '@/types/api'

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'entire_home', label: 'Entire Home' },
  { value: 'room', label: 'Private Room' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
]

function ApartmentCard({ apartment }: { apartment: Apartment }) {
  const pricing = apartment.pricing
  const address = apartment.address

  return (
    <Link to={`/apartments/${apartment.id}`}>
      <motion.article
        whileHover={{ y: -4 }}
        className="group overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-surface-700 dark:bg-surface-800"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-100 dark:bg-surface-700">
          {apartment.image_url ? (
            <img
              src={apartment.image_url}
              alt={apartment.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-surface-400 dark:text-surface-500">
              <span className="text-4xl">🏠</span>
            </div>
          )}
          {apartment.is_verified && (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-medium text-white">
              Verified
            </span>
          )}
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-surface-700 backdrop-blur dark:bg-surface-900/90 dark:text-surface-300">
            {apartment.property_type.replace('_', ' ')}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 dark:text-white line-clamp-1">
              {apartment.title}
            </h3>
            {pricing && (
              <span className="whitespace-nowrap text-sm font-bold text-surface-900 dark:text-white">
                {formatCurrency(pricing.price_per_night, pricing.currency)}
                <span className="font-normal text-surface-500 dark:text-surface-400">/night</span>
              </span>
            )}
          </div>

          {address && (
            <div className="mt-1 flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{address.city}, {address.country}</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {apartment.total_bedrooms} bed{apartment.total_bedrooms > 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {apartment.total_bathrooms} bath
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {apartment.max_guests} guests
            </span>
          </div>

          {/* Amenities preview */}
          {apartment.apartment_amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {apartment.apartment_amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity.id}
                  className="rounded-md bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-surface-700 dark:text-surface-400"
                >
                  {amenity.name}
                </span>
              ))}
              {apartment.apartment_amenities.length > 3 && (
                <span className="rounded-md bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-surface-700 dark:text-surface-400">
                  +{apartment.apartment_amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  )
}

export default function ApartmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const propertyType = searchParams.get('property_type') || ''
  const search = searchParams.get('search') || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['apartments', { search, property_type: propertyType }],
    queryFn: () =>
      apartmentService.list({
        search: search || undefined,
        property_type: propertyType || undefined,
      }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchInput) params.set('search', searchInput)
    else params.delete('search')
    setSearchParams(params)
  }

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams)
    if (type) params.set('property_type', type)
    else params.delete('property_type')
    setSearchParams(params)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
          Explore Apartments
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400">
          Find the perfect place for your next stay
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search by title, city, or country..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800 dark:text-white dark:placeholder:text-surface-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Search
          </button>
        </form>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                propertyType === type.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {error ? (
        <div className="rounded-2xl bg-red-50 p-8 text-center dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">
            Failed to load apartments. Please try again later.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ApartmentCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.results.length === 0 ? (
        <div className="rounded-2xl bg-surface-50 p-12 text-center dark:bg-surface-800">
          <p className="text-lg font-medium text-surface-600 dark:text-surface-400">
            No apartments found
          </p>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-surface-500 dark:text-surface-400">
            {data?.count} apartment{data?.count !== 1 ? 's' : ''} found
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.results.map((apartment, i) => (
              <motion.div
                key={apartment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <ApartmentCard apartment={apartment} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
