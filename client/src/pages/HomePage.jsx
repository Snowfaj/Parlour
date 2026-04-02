/**
 * HomePage — Hero, Services preview, Gallery, CTA
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ServiceCard from '../components/ServiceCard'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

const galleryImages = [
  { emoji: '💆‍♀️', label: 'Spa Treatment',    bg: 'from-purple-400 to-pink-400' },
  { emoji: '💇‍♀️', label: 'Hair Styling',      bg: 'from-pink-400 to-rose-400' },
  { emoji: '👰',   label: 'Bridal Package',   bg: 'from-rose-400 to-amber-400' },
  { emoji: '💅',   label: 'Nail Art',          bg: 'from-fuchsia-400 to-purple-400' },
  { emoji: '✨',   label: 'Facial Treatment',  bg: 'from-teal-400 to-cyan-400' },
  { emoji: '💄',   label: 'Makeup Studio',     bg: 'from-amber-400 to-orange-400' },
]

const stats = [
  { value: '5000+', label: 'Happy Clients' },
  { value: '50+',   label: 'Expert Stylists' },
  { value: '20+',   label: 'Beauty Services' },
  { value: '8 Yrs', label: 'Experience' },
]

const testimonials = [
  { name: 'Priya Sharma',   avatar: '👩', text: 'Absolutely loved my bridal experience! The team made me look and feel like a queen on my special day.', stars: 5 },
  { name: 'Kavitha Nair',   avatar: '👩‍🦱', text: 'The keratin treatment completely transformed my hair. Highly recommend Glamour Parlour!', stars: 5 },
  { name: 'Meena Pillai',   avatar: '👩‍🦳', text: 'Exceptional service and a calming atmosphere. The gold facial left my skin glowing for weeks.', stars: 5 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
}

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/services')
      .then(res => setFeaturedServices(res.data.services?.slice(0, 6) || []))
      .catch(() => setFeaturedServices([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="hero-bg min-h-screen flex items-center pt-20">
        <div className="container-custom py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-6"
            >
              🌸 Premium Beauty & Wellness
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold text-dark-100 leading-tight mb-6"
            >
              Look Your
              <span className="block gradient-text">Best Every Day</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl"
            >
              Experience luxury beauty treatments crafted just for you. Book your appointment online in minutes and arrive to a world of relaxation and transformation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/booking" className="btn-primary text-base !px-8 !py-4">
                Book Appointment 📅
              </Link>
              <Link to="/services" className="btn-outline text-base !px-8 !py-4">
                View Services
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16"
            >
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-display font-bold gradient-text">{s.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating decoration */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden lg:block absolute right-20 top-1/3 text-8xl opacity-30 select-none pointer-events-none"
        >
          🌸
        </motion.div>
      </section>

      {/* ─── Featured Services ──────────────────────────────────────────── */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3">What We Offer</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">Our <span className="gradient-text">Popular Services</span></motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">Discover our range of premium beauty treatments designed to pamper and transform.</motion.p>
          </motion.div>

          {loading
            ? <LoadingSpinner />
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
              </div>
          }

          <div className="text-center mt-10">
            <Link to="/services" className="btn-outline">View All Services →</Link>
          </div>
        </div>
      </section>

      {/* ─── Gallery ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-3">Gallery</p>
            <h2 className="section-title">A Glimpse of <span className="gradient-text">Glamour</span></h2>
            <p className="section-subtitle">Step inside our world of beauty and luxury.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className={`relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br ${img.bg} flex flex-col items-center justify-center gap-3 cursor-pointer shadow-card`}
              >
                <span className="text-7xl drop-shadow-lg">{img.emoji}</span>
                <span className="text-white font-semibold text-sm bg-black/20 px-3 py-1 rounded-full">{img.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────────── */}
      <section className="section bg-gradient-dark">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title text-white">What Our <span className="gradient-text">Clients Say</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 flex flex-col gap-4"
              >
                <p className="text-yellow-400">{'⭐'.repeat(t.stars)}</p>
                <p className="text-gray-300 italic text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <span className="text-3xl">{t.avatar}</span>
                  <span className="text-white font-semibold text-sm">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-primary p-12 text-center text-white shadow-glow"
          >
            <h2 className="font-display text-4xl font-bold mb-4">Ready for Your Glow-Up? ✨</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Book your appointment today and let our experts take care of you.</p>
            <Link to="/booking" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all hover:scale-105">
              Book Now — It's Easy! 📅
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
