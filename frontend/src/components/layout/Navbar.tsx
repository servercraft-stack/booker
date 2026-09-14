import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Moon, Sun, User, LogOut, Building2, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { getInitials } from '@/lib/utils'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-lg dark:border-surface-700 dark:bg-surface-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600 transition-colors hover:text-primary-700">
            <Building2 className="h-7 w-7" />
            <span className="hidden sm:inline">StayVibe</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/apartments"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
            >
              Explore
            </Link>

            {isAuthenticated && (
              <Link
                to="/bookings"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
              >
                My Bookings
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/host"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
              >
                Host
              </Link>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800"
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {getInitials(user?.full_name || 'U')}
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-surface-500 sm:block" />
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-surface-200 bg-white py-2 shadow-lg dark:border-surface-700 dark:bg-surface-800 z-50 animate-fade-in">
                      <div className="border-b border-surface-100 px-4 py-3 dark:border-surface-700">
                        <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                          {user?.full_name}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700/50"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900 md:hidden animate-fade-in">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              to="/apartments"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              Explore
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                >
                  My Bookings
                </Link>
                <Link
                  to="/host"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                >
                  Host
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg bg-primary-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-700"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
