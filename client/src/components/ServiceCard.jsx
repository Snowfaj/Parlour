/**
 * ServiceCard — displays a single service
 */
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const categoryIcons = {
  hair:   '💇‍♀️',
  facial: '✨',
  bridal: '👰',
  nail:   '💅',
  spa:    '🧖‍♀️',
  makeup: '💄',
}

const categoryColors = {
  hair:   'bg-purple-50 text-purple-700 border-purple-200',
  facial: 'bg-pink-50 text-pink-700 border-pink-200',
  bridal: 'bg-rose-50 text-rose-700 border-rose-200',
  nail:   'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  spa:    'bg-teal-50 text-teal-700 border-teal-200',
  makeup: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function ServiceCard({ service, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="card p-6 flex flex-col gap-4 group cursor-pointer"
    >
      {/* Icon & Category */}
      <div className="flex items-center justify-between">
        <span className="text-4xl">{categoryIcons[service.category] || '💆'}</span>
        <span className={`badge border ${categoryColors[service.category] || 'bg-gray-50 text-gray-600'}`}>
          {service.category}
        </span>
      </div>

      {/* Name & Description */}
      <div>
        <h3 className="font-display font-semibold text-lg text-dark-100 group-hover:text-primary-700 transition-colors">
          {service.name}
        </h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Price + Duration + CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <div>
          <p className="text-xl font-bold text-primary-700">₹{service.price}</p>
          <p className="text-xs text-gray-400">{service.duration} mins</p>
        </div>
        <Link
          to={`/booking?service=${service.id}`}
          className="btn-primary !py-2 !px-4 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          Book Now
        </Link>
      </div>
    </motion.div>
  )
}
