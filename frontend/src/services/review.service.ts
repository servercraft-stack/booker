import api from './api'
import type { Review, ReviewForm, PaginatedResponse } from '@/types/api'

export const reviewService = {
  /** GET /api/reviews/:apartmentId/reviews/ — list reviews for apartment */
  async listByApartment(apartmentId: string): Promise<Review[]> {
    const response = await api.get<PaginatedResponse<Review> | Review[]>(`/reviews/${apartmentId}/reviews/`)
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.results ?? []
  },

  /** POST /api/reviews/:apartmentId/reviews/ — create review */
  async create(apartmentId: string, data: ReviewForm): Promise<Review> {
    const response = await api.post<Review>(`/reviews/${apartmentId}/reviews/`, data)
    return response.data
  },

  /** PUT /api/reviews/reviews/:id/ — update review */
  async update(id: number, data: Partial<ReviewForm>): Promise<Review> {
    const response = await api.put<Review>(`/reviews/reviews/${id}/`, data)
    return response.data
  },

  /** DELETE /api/reviews/reviews/:id/ — delete review */
  async remove(id: number): Promise<void> {
    await api.delete(`/reviews/reviews/${id}/`)
  },
}
