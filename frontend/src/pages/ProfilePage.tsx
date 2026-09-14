import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Save } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/auth.service'
import { getInitials } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setUser } = useAuth()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [isProfileSaving, setIsProfileSaving] = useState(false)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErrors({})
    setIsProfileSaving(true)

    try {
      const updated = await authService.updateProfile(profileForm)
      setUser(updated)
      toast.success('Profile updated!')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      if (data) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) fieldErrors[key] = value[0] as string
          else if (typeof value === 'string') fieldErrors[key] = value
        })
        setProfileErrors(fieldErrors)
      } else {
        toast.error('Failed to update profile')
      }
    } finally {
      setIsProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrors({})
    setIsPasswordSaving(true)

    try {
      await authService.changePassword(passwordForm)
      setPasswordForm({ current_password: '', new_password: '', new_password_confirm: '' })
      toast.success('Password changed!')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data
      if (data) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) fieldErrors[key] = value[0] as string
          else if (typeof value === 'string') fieldErrors[key] = value
        })
        setPasswordErrors(fieldErrors)
      } else {
        toast.error('Failed to change password')
      }
    } finally {
      setIsPasswordSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Profile</h1>
      <p className="mt-2 text-surface-500 dark:text-surface-400">
        Manage your account settings
      </p>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex items-center gap-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
          {getInitials(user?.full_name || 'U')}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white">
            {user?.full_name}
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {user?.email}
          </p>
        </div>
      </motion.div>

      {/* Edit profile form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800"
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
          Edit Profile
        </h3>
        <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={profileForm.first_name}
              onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))}
              error={profileErrors.first_name}
              required
            />
            <Input
              label="Last name"
              value={profileForm.last_name}
              onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))}
              error={profileErrors.last_name}
              required
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <Mail className="h-4 w-4" />
            <span>Email: {user?.email}</span>
          </div>
          <Button type="submit" isLoading={isProfileSaving}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </form>
      </motion.div>

      {/* Change password form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800"
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
          Change Password
        </h3>
        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
          <Input
            label="Current password"
            type="password"
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
            error={passwordErrors.current_password}
            required
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
            error={passwordErrors.new_password}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={passwordForm.new_password_confirm}
            onChange={(e) => setPasswordForm((p) => ({ ...p, new_password_confirm: e.target.value }))}
            error={passwordErrors.new_password_confirm}
            required
            autoComplete="new-password"
          />
          <Button type="submit" isLoading={isPasswordSaving}>
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
