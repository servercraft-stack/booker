import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@/types/api'
import { authService } from '@/services/auth.service'
import { setTokens, clearTokens, getAccessToken } from '@/services/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, check if we have a stored token and try to fetch the profile
  useEffect(() => {
    async function loadUser() {
      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        // Token invalid or expired — clear it
        clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    setTokens(response.tokens.access, response.tokens.refresh)
    setUser(response.user)
  }, [])

  const loginWithGoogle = useCallback(async (credential: string): Promise<User> => {
    const response = await authService.googleLogin(credential, 'login')
    setTokens(response.tokens.access, response.tokens.refresh)
    setUser(response.user)
    return response.user
  }, [])

  const logout = useCallback(async () => {
    const { getRefreshToken } = await import('@/services/api')
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch {
        // Logout even if the API call fails
      }
    }
    clearTokens()
    setUser(null)
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
