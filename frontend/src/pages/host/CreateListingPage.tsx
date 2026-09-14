import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Upload, X, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apartmentService } from '@/services/apartment.service'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import toast from 'react-hot-toast'
import type { PropertyType, Currency } from '@/types/api'

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Private Room' },
  { value: 'entire_home', label: 'Entire Home' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
]

const CURRENCIES = [
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
]

export default function CreateListingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'apartment' as PropertyType,
    total_bedrooms: 1,
    total_bathrooms: 1,
    max_guests: 2,
    // Pricing
    price_per_night: '',
    cleaning_fee: '0',
    service_fee: '0',
    weekend_price: '',
    currency: 'GBP' as Currency,
    // Address
    country: '',
    state: '',
    city: '',
    street: '',
  })

  const [rules, setRules] = useState<string[]>([''])
  const [newRule, setNewRule] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apartmentService.create({
        title: data.title,
        description: data.description,
        property_type: data.property_type,
        total_bedrooms: Number(data.total_bedrooms),
        total_bathrooms: Number(data.total_bathrooms),
        max_guests: Number(data.max_guests),
        is_active: true,
        image_file: imageFile || undefined,
        rules: rules.filter((r) => r.trim()).map((rule_text) => ({ rule_text })),
        pricing: {
          price_per_night: Number(data.price_per_night),
          cleaning_fee: Number(data.cleaning_fee),
          service_fee: Number(data.service_fee),
          weekend_price: data.weekend_price ? Number(data.weekend_price) : null,
          currency: data.currency,
        },
        address: {
          country: data.country,
          state: data.state,
          city: data.city,
          street: data.street,
        },
      })
    },
    onSuccess: (apartment) => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] })
      toast.success('Listing created!')
      navigate(`/apartments/${apartment.id}`)
    },
    onError: (err: any) => {
      const data = err?.response?.data
      if (data) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) fieldErrors[key] = value[0] as string
          else if (typeof value === 'string') fieldErrors[key] = value
        })
        setErrors(fieldErrors)
      } else {
        toast.error('Failed to create listing')
      }
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addRule = () => {
    if (newRule.trim()) {
      setRules((prev) => [...prev, newRule.trim()])
      setNewRule('')
    }
  }

  const removeRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index))
  }

  const updateRule = (index: number, value: string) => {
    setRules((prev) => prev.map((r, i) => (i === index ? value : r)))
  }

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.price_per_night || Number(form.price_per_night) <= 0) newErrors.price_per_night = 'Valid price is required'
    if (!form.country.trim()) newErrors.country = 'Country is required'
    if (!form.city.trim()) newErrors.city = 'City is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createMutation.mutate(form)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        to="/host"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
          Create New Listing
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400">
          Fill in the details to list your property
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Basic Info */}
          <section className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Basic Information
            </h2>
            <div className="mt-5 space-y-4">
              <Input
                label="Title"
                placeholder="e.g. Cozy Studio in Central London"
                value={form.title}
                onChange={handleChange('title')}
                error={errors.title}
                required
              />
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your property..."
                  value={form.description}
                  onChange={handleChange('description')}
                  className="w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
                />
                {errors.description && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>
              <Select
                label="Property type"
                value={form.property_type}
                onChange={handleChange('property_type')}
                options={PROPERTY_TYPES}
              />
            </div>
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Property Details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Input
                label="Bedrooms"
                type="number"
                min={1}
                max={50}
                value={form.total_bedrooms}
                onChange={handleChange('total_bedrooms')}
              />
              <Input
                label="Bathrooms"
                type="number"
                min={1}
                max={50}
                value={form.total_bathrooms}
                onChange={handleChange('total_bathrooms')}
              />
              <Input
                label="Max guests"
                type="number"
                min={1}
                max={100}
                value={form.max_guests}
                onChange={handleChange('max_guests')}
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Pricing
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input
                label="Price per night"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={form.price_per_night}
                onChange={handleChange('price_per_night')}
                error={errors.price_per_night}
                required
              />
              <Select
                label="Currency"
                value={form.currency}
                onChange={handleChange('currency')}
                options={CURRENCIES}
              />
              <Input
                label="Cleaning fee"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={form.cleaning_fee}
                onChange={handleChange('cleaning_fee')}
              />
              <Input
                label="Service fee"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={form.service_fee}
                onChange={handleChange('service_fee')}
              />
              <Input
                label="Weekend price (optional)"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={form.weekend_price}
                onChange={handleChange('weekend_price')}
              />
            </div>
          </section>

          {/* Address */}
          <section className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Address
            </h2>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Country"
                  placeholder="United Kingdom"
                  value={form.country}
                  onChange={handleChange('country')}
                  error={errors.country}
                  required
                />
                <Input
                  label="State / Region"
                  placeholder="England"
                  value={form.state}
                  onChange={handleChange('state')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="City"
                  placeholder="London"
                  value={form.city}
                  onChange={handleChange('city')}
                  error={errors.city}
                  required
                />
                <Input
                  label="Street"
                  placeholder="123 Main St"
                  value={form.street}
                  onChange={handleChange('street')}
                />
              </div>
            </div>
          </section>

          {/* House Rules */}
          <section className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              House Rules
            </h2>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Set expectations for your guests.
            </p>
            <div className="mt-5 space-y-3">
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    placeholder="e.g. No smoking, No pets, Check-in after 3pm"
                    className="flex-1 rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="rounded-lg p-2.5 text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRule()
                    }
                  }}
                  placeholder="Add a new rule and press Enter"
                  className="flex-1 rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-100 dark:placeholder:text-surface-500"
                />
                <button
                  type="button"
                  onClick={addRule}
                  className="rounded-lg bg-surface-100 px-3 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600"
                >
                  Add
                </button>
              </div>
            </div>
          </section>

          {/* Photos */}
          <section className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Photos
            </h2>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Add a cover photo to help your listing stand out. You can add more later.
            </p>
            <div className="mt-5">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full rounded-lg object-cover sm:w-72"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 p-8 transition-colors hover:border-primary-400 hover:bg-primary-50 dark:border-surface-600 dark:bg-surface-700 dark:hover:border-primary-500 dark:hover:bg-surface-600"
                >
                  <Upload className="h-8 w-8 text-surface-400 dark:text-surface-500" />
                  <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                    Click to upload a photo
                  </span>
                  <span className="text-xs text-surface-400 dark:text-surface-500">
                    JPG, PNG, GIF, WebP up to 5MB
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/host"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            >
              Cancel
            </Link>
            <Button type="submit" size="lg" isLoading={createMutation.isPending}>
              <Plus className="h-4 w-4" />
              Create Listing
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
