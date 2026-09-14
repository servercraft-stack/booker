import { Link } from 'react-router-dom'
import { Building2, Globe, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 text-lg font-bold text-surface-900 dark:text-white">
                <Building2 className="h-6 w-6 text-primary-600" />
                StayVibe
              </Link>
              <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
                Find your perfect stay. Unique apartments and homes around the world.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Explore</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/apartments" className="text-sm text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors">
                    All Apartments
                  </Link>
                </li>
                <li>
                  <Link to="/apartments?type=entire_home" className="text-sm text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors">
                    Entire Homes
                  </Link>
                </li>
                <li>
                  <Link to="/apartments?type=studio" className="text-sm text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors">
                    Studios
                  </Link>
                </li>
              </ul>
            </div>

            {/* Hosting */}
            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Hosting</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/host" className="text-sm text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors">
                    Become a Host
                  </Link>
                </li>
                <li>
                  <Link to="/host/create" className="text-sm text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors">
                    List Your Space
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Account</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link to="/profile" className="text-sm text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/bookings" className="text-sm text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors">
                    My Bookings
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-200 pt-8 dark:border-surface-700 sm:flex-row">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              &copy; {new Date().getFullYear()} StayVibe. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                aria-label="Website"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                aria-label="External Link"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
