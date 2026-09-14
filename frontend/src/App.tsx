import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const ApartmentsPage = lazy(() => import('@/pages/apartments/ApartmentsPage'))
const ApartmentDetailPage = lazy(() => import('@/pages/apartments/ApartmentDetailPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const MyBookingsPage = lazy(() => import('@/pages/bookings/MyBookingsPage'))
const BookingDetailPage = lazy(() => import('@/pages/bookings/BookingDetailPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const HostDashboardPage = lazy(() => import('@/pages/host/HostDashboardPage'))
const CreateListingPage = lazy(() => import('@/pages/host/CreateListingPage'))
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/** Full-page loading fallback */
function PageLoader() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Guard for authenticated-only routes */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/** Guard for guest-only routes (login, register) */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/apartments" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/apartments" element={<ApartmentsPage />} />
          <Route path="/apartments/:id" element={<ApartmentDetailPage />} />

          {/* Auth routes (guest only) */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host"
            element={
              <ProtectedRoute>
                <HostDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/create"
            element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
