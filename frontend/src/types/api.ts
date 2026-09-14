// ==========================================
// User Types
// ==========================================

export type UserType = 'user' | 'admin' | 'staff'
export type UserStatus = 'default' | 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted' | 'blocked'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_active: boolean
  status: UserStatus
  user_type: UserType
  otp_verified: boolean
  avatar_url?: string | null
  created: string
  updated: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  message: string
  user: User
  tokens: AuthTokens
}

// ==========================================
// Apartment Types
// ==========================================

export type PropertyType = 'apartment' | 'room' | 'entire_home' | 'studio' | 'villa'
export type Currency = 'GBP' | 'USD' | 'EUR'

export interface Amenity {
  id: number
  name: string
  icon: string
}

export interface ApartmentPricing {
  price_per_night: string
  cleaning_fee: string
  service_fee: string
  weekend_price: string | null
  currency: Currency
}

export interface ApartmentAddress {
  country: string
  state: string
  city: string
  street: string
}

export interface ApartmentAvailability {
  date: string
  is_available: boolean
}

export interface ApartmentRule {
  id: number
  rule_text: string
}

export interface Apartment {
  id: string
  host: string
  title: string
  description: string
  property_type: PropertyType
  total_bedrooms: number
  total_bathrooms: number
  max_guests: number
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  apartment_amenities: Amenity[]
  rules: ApartmentRule[]
  availability: ApartmentAvailability[]
  image_url: string | null
  is_cover: boolean
  uploaded_at: string
  pricing: ApartmentPricing | null
  address: ApartmentAddress | null
}

// ==========================================
// Booking Types
// ==========================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'declined'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface Booking {
  id: string
  apartment: string
  guest: string
  check_in: string
  check_out: string
  nights: number
  guests_count: number
  total_price: string | null
  status: BookingStatus
  payment_status: PaymentStatus
  provider_transaction_id: string | null
  created_at: string
  updated_at: string
}

// ==========================================
// Review Types
// ==========================================

export interface Review {
  id: number
  apartment: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

// ==========================================
// API Response Types
// ==========================================

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  detail?: string
  [key: string]: string | string[] | undefined
}

// ==========================================
// Form Types — match new backend field names
// ==========================================

export interface LoginForm {
  email: string
  password: string
}

export interface GoogleLoginResult extends LoginResponse {
  is_new_user?: boolean
}

export interface RegisterForm {
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}

export interface OTPForm {
  email: string
  otp: string
}

export interface ResendOTPForm {
  email: string
  purpose?: string
}

export interface PasswordResetRequestForm {
  email: string
}

export interface PasswordResetConfirmForm {
  email: string
  otp: string
  new_password: string
  new_password_confirm: string
}

export interface ChangePasswordForm {
  current_password: string
  new_password: string
  new_password_confirm: string
}

export interface BookingForm {
  apartment: string
  check_in: string
  check_out: string
  guests_count: number
}

export interface ReviewForm {
  rating: number
  comment: string
}

export interface ApartmentForm {
  title: string
  description: string
  property_type: PropertyType
  total_bedrooms: number
  total_bathrooms: number
  max_guests: number
  is_active: boolean
  amenities?: number[]
  image_file?: File | null
  rules?: { rule_text: string }[]
  pricing?: {
    price_per_night: number
    cleaning_fee: number
    service_fee: number
    weekend_price?: number | null
    currency: Currency
  }
  address?: {
    country: string
    state: string
    city: string
    street: string
  }
}

export interface HostDashboardStats {
  total_listings: number
  active_listings: number
  total_bookings: number
  total_revenue: number
  currency: string
}
