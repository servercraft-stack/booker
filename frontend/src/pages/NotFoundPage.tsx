import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="text-8xl font-bold text-surface-200 dark:text-surface-700">404</div>
        <h1 className="mt-4 text-2xl font-bold text-surface-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="mt-3 text-surface-500 dark:text-surface-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link to="/" className="w-full">
            <Button className="w-full" size="lg">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
