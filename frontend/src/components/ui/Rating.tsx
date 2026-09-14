import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (value: number) => void
  showValue?: boolean
}

const sizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const displayValue = interactive && hoverValue > 0 ? hoverValue : value

  return (
    <div className="flex items-center gap-1" role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const starIndex = i + 1
        const filled = starIndex <= displayValue

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            className={cn(
              'transition-colors duration-150',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
            onClick={() => interactive && onChange?.(starIndex)}
            onMouseEnter={() => interactive && setHoverValue(starIndex)}
            onMouseLeave={() => interactive && setHoverValue(0)}
            aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizes[size],
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-surface-300 dark:text-surface-600'
              )}
            />
          </button>
        )
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-surface-600 dark:text-surface-400">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
