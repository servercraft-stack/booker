import api from './api'
import type {
  GoogleLoginResult,
  LoginResponse,
  User,
  LoginForm,
  RegisterForm,
  OTPForm,
  ResendOTPForm,
  PasswordResetRequestForm,
  PasswordResetConfirmForm,
  ChangePasswordForm,
} from '@/types/api'

export const authService = {
  /** POST /api/users/login/ */
  async login(data: LoginForm): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/users/login/', data)
    return response.data
  },

  /** POST /api/users/google/ — verify Google ID token and return JWTs */
  async googleLogin(credential: string, action: 'login' | 'register' = 'login'): Promise<GoogleLoginResult> {
    const response = await api.post<GoogleLoginResult>('/users/google/', {
      credential,
      action,
    })
    return response.data
  },

  /** POST /api/users/register/ */
  async register(data: RegisterForm): Promise<{ message: string; user: User }> {
    const response = await api.post<{ message: string; user: User }>('/users/register/', data)
    return response.data
  },

  /** POST /api/users/logout/ */
  async logout(refreshToken: string): Promise<void> {
    await api.post('/users/logout/', { refresh: refreshToken })
  },

  /** POST /api/users/resend-otp/ (resend OTP) */
  async sendOTP(data: ResendOTPForm): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/resend-otp/', data)
    return response.data
  },

  /** POST /api/users/verify-otp/ (verify OTP) */
  async verifyOTP(data: OTPForm): Promise<{ message: string; user: User }> {
    const response = await api.post<{ message: string; user: User }>('/users/verify-otp/', data)
    return response.data
  },

  /** POST /api/users/password/change/ */
  async changePassword(data: ChangePasswordForm): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/password/change/', data)
    return response.data
  },

  /** POST /api/users/password/reset/ */
  async requestPasswordReset(data: PasswordResetRequestForm): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/password/reset/', data)
    return response.data
  },

  /** POST /api/users/password/reset/confirm/ */
  async confirmPasswordReset(data: PasswordResetConfirmForm): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/password/reset/confirm/', data)
    return response.data
  },

  /** GET /api/users/me/ — get current user profile */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/me/')
    return response.data
  },

  /** PATCH /api/users/me/ — update profile */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/users/me/', data)
    return response.data
  },
}
