import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Star, Shield, CreditCard, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Easy Discovery',
    description: 'Browse unique apartments worldwide with powerful search and filters.',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    description: 'Every apartment is verified by our team for quality and safety.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Book with confidence using our secure Stripe payment integration.',
  },
  {
    icon: Star,
    title: 'Trusted Reviews',
    description: 'Read honest reviews from real guests who have stayed at each property.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Find Your Perfect
            <span className="block text-primary-200">Stay</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-primary-100 sm:text-xl"
          >
            Discover unique apartments and homes around the world. Book your next adventure with confidence.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <Link
              to="/apartments"
              className="group mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl transition-all hover:shadow-2xl dark:bg-surface-800"
            >
              <Search className="h-5 w-5 text-surface-400" />
              <span className="flex-1 text-left text-surface-500 dark:text-surface-400">
                Search apartments by location, type, or price...
              </span>
              <span className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-primary-700">
                Search
              </span>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-primary-200"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm">Properties</div>
            </div>
            <div className="h-8 w-px bg-primary-400/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm">Cities</div>
            </div>
            <div className="h-8 w-px bg-primary-400/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.8</div>
              <div className="text-sm">Average Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-16 dark:bg-surface-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white">
              Why StayVibe?
            </h2>
            <p className="mt-3 text-lg text-surface-500 dark:text-surface-400">
              Everything you need for a perfect stay
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-surface-100 bg-surface-50 p-6 transition-all hover:shadow-lg dark:border-surface-800 dark:bg-surface-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-50 px-4 py-16 dark:bg-surface-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white">
            Ready to start hosting?
          </h2>
          <p className="mt-4 text-lg text-surface-500 dark:text-surface-400">
            List your space and start earning. It's free to get started.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/host"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Start Hosting
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/apartments"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-300 bg-white px-6 py-3 text-base font-semibold text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
            >
              Browse Apartments
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
