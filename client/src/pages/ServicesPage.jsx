/**
 * ServicesPage — Category tabs with all services
 */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ServiceCard from '../components/ServiceCard'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

const categories = [
  { id: 'all',    label: 'All Services', icon: '🌟' },
  { id: 'hair',   label: 'Hair',         icon: '💇‍♀️' },
  { id: 'facial', label: 'Facial',       icon: '✨' },
  { id: 'bridal', label: 'Bridal',       icon: '👰' },
  { id: 'nail',   label: 'Nail',         icon: '💅' },
  { id: 'spa',    label: 'Spa',          icon: '🧖‍♀️' },
  { id: 'makeup', label: 'Makeup',       icon: '💄' },
]

export default function ServicesPage() {
  const [services,  setServices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    api.get('/services')
      .then(res => setServices(res.data.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeTab === 'all'
    ? services
    : services.filter(s => s.category === activeTab)

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="hero-bg pt-32 pb-20 px-4">
        <div className="container-custom text-center">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3"
          >Our Menu</motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="section-title mb-4"
          >Beauty <span className="gradient-text">Services</span></motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="section-subtitle mx-auto"
          >
            From everyday grooming to bridal transformations — we have it all.
          </motion.p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container-custom">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === cat.id
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container-custom">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg">No services found in this category.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filtered.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
