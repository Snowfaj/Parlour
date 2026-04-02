/**
 * LoadingSpinner — Framer Motion spinner overlay
 */
import { motion } from 'framer-motion'

export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' }

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className={`${sizes[size]} rounded-full border-4 border-primary-200 border-t-primary-600`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {size === 'lg' && (
        <p className="text-gray-500 text-sm font-medium animate-pulse">Loading...</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }
  return <div className="flex items-center justify-center py-12">{spinner}</div>
}
