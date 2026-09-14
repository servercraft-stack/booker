import api from './api'
import { buildQueryString } from '@/lib/utils'
import type { Apartment, ApartmentForm, HostDashboardStats } from '@/types/api'

export interface ApartmentListParams {
  limit?: number
  offset?: number
  search?: string
  property_type?: string
  min_price?: number
  max_price?: number
  max_guests?: number
}

export interface ApartmentListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Apartment[]
}

export const apartmentService = {
  /** GET /api/apartments/apartments/ — list all apartments */
  async list(params: ApartmentListParams = {}): Promise<ApartmentListResponse> {
    const qs = buildQueryString(params as Record<string, string | number>)
    const response = await api.get<ApartmentListResponse>(`/apartments/apartments/${qs}`)
    return response.data
  },

  /** GET /api/apartments/apartments/:id/ — apartment detail */
  async detail(id: string): Promise<Apartment> {
    const response = await api.get<Apartment>(`/apartments/apartments/${id}/`)
    return response.data
  },

  /** POST /api/apartments/apartments/ — create apartment (host) */
  async create(data: ApartmentForm): Promise<Apartment> {
    // If there's an image file, use FormData; otherwise send JSON
    if (data.image_file) {
      const formData = new FormData()
      // Append all non-object/non-file fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image_file' && value instanceof File) {
          formData.append('image_file', value)
        } else if (key === 'pricing' && typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([pk, pv]) => {
            if (pv !== undefined && pv !== null) formData.append(`pricing.${pk}`, String(pv))
          })
        } else if (key === 'address' && typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([ak, av]) => {
            if (av !== undefined && av !== null) formData.append(`address.${ak}`, String(av))
          })
        } else if (key === 'rules' && Array.isArray(value)) {
          value.forEach((rule: any, idx: number) => {
            if (rule.rule_text) formData.append(`rules.${idx}.rule_text`, rule.rule_text)
          })
        } else if (key === 'amenities' && Array.isArray(value)) {
          value.forEach((id) => formData.append('amenities', String(id)))
        } else if (value !== undefined && value !== null && typeof value !== 'object') {
          formData.append(key, String(value))
        }
      })
      const response = await api.post<Apartment>('/apartments/apartments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    }
    const response = await api.post<Apartment>('/apartments/apartments/', data)
    return response.data
  },

  /** PUT /api/apartments/apartments/:id/ — update apartment */
  async update(id: string, data: Partial<ApartmentForm>): Promise<Apartment> {
    const response = await api.put<Apartment>(`/apartments/apartments/${id}/`, data)
    return response.data
  },

  /** PATCH /api/apartments/apartments/:id/ — partial update */
  async patch(id: string, data: Partial<ApartmentForm>): Promise<Apartment> {
    const response = await api.patch<Apartment>(`/apartments/apartments/${id}/`, data)
    return response.data
  },

  /** DELETE /api/apartments/apartments/:id/ — delete apartment */
  async remove(id: string): Promise<void> {
    await api.delete(`/apartments/apartments/${id}/`)
  },

  /** Upload apartment image */
  async uploadImage(id: string, file: File): Promise<Apartment> {
    const formData = new FormData()
    formData.append('image_file', file)
    const response = await api.patch<Apartment>(`/apartments/apartments/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /** GET /api/host/dashboard-stats/ — host dashboard aggregated stats */
  async getHostStats(): Promise<HostDashboardStats> {
    const response = await api.get<HostDashboardStats>('/host/dashboard-stats/')
    return response.data
  },
}
