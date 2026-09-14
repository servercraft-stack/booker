import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format currency with locale support */
export function formatCurrency(amount: number | string, currency: string = 'GBP') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

/** Format a date range: "1-5 Jan 2025" */
export function formatDateRange(start: string | Date, end: string | Date) {
  const s = new Date(start)
  const e = new Date(end)
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()

  if (sameMonth) {
    return `${s.getDate()}-${e.getDate()} ${s.toLocaleString('en-GB', { month: 'short', year: 'numeric' })}`
  }
  return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/** Generate initials from name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Build query string from params object */
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}
