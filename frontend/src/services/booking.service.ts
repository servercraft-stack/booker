import api from './api'
import type { Booking, BookingForm } from '@/types/api'

export interface CheckoutSessionResponse {
  url: string
}

export const bookingService = {
  /** GET /api/bookings/my-bookings/ — list current user's bookings */
  async listMyBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/my-bookings/')
    return response.data
  },

  /** GET /api/bookings/apartments/:apartmentId/bookings/ — list bookings for apartment */
  async listByApartment(apartmentId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/bookings/apartments/${apartmentId}/bookings/`)
    return response.data
  },

  /** POST /api/bookings/apartments/:apartmentId/bookings/ — create booking */
  async create(apartmentId: string, data: Omit<BookingForm, 'apartment'>): Promise<Booking> {
    const response = await api.post<Booking>(`/bookings/apartments/${apartmentId}/bookings/`, data)
    return response.data
  },

  /** GET /api/bookings/bookings/:id/ — booking detail */
  async detail(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/bookings/${id}/`)
    return response.data
  },

  /** PUT /api/bookings/bookings/:id/ — update booking (pending only) */
  async update(id: string, data: Partial<BookingForm>): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/bookings/${id}/`, data)
    return response.data
  },

  /** DELETE /api/bookings/bookings/:id/ — cancel booking */
  async cancel(id: string): Promise<Booking> {
    const response = await api.delete<Booking>(`/bookings/bookings/${id}/`)
    return response.data
  },

  /** POST /api/bookings/bookings/:id/pay/ — create Stripe checkout session */
  async createCheckout(bookingId: string): Promise<CheckoutSessionResponse> {
    const response = await api.post<CheckoutSessionResponse>(`/bookings/bookings/${bookingId}/pay/`)
    return response.data
  },

  /** POST /api/bookings/bookings/:id/verify-payment/ — verify payment status with Stripe */
  async verifyPayment(bookingId: string): Promise<{ payment_status: string; status: string }> {
    const response = await api.post<{ payment_status: string; status: string }>(`/bookings/bookings/${bookingId}/verify-payment/`)
    return response.data
  },

  /** DELETE /api/bookings/bookings/:id/delete/ — permanently delete a cancelled booking */
  async deleteCancelled(bookingId: string): Promise<{ detail: string }> {
    const response = await api.delete<{ detail: string }>(`/bookings/bookings/${bookingId}/delete/`)
    return response.data
  },
}
