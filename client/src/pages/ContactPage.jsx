/**
 * ContactPage — Contact form + info cards
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'

const contactInfo = [
  { icon: '📍', title: 'Address',       text: '123 Glamour Street, Thoothukudi, Tamil Nadu 600001' },
  { icon: '📞', title: 'Phone',         text: '+91 90256 05056' },
  { icon: '✉️', title: 'Email',         text: 'snowfatuty03@gmail.com' },
  { icon: '🕐', title: 'Working Hours', text: 'Mon–Sat: 9 AM – 8 PM\nSunday: 10 AM – 6 PM' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSent(true)
      toast.success('Message sent! We\'ll get back to you soon 💌')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="hero-bg pt-32 pb-16 px-4 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-title mb-3">
          Get In <span className="gradient-text">Touch</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="section-subtitle mx-auto">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </motion.p>
      </section>

      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* ── Contact Info ── */}
            <div>
              <h2 className="font-display text-2xl font-bold text-dark-100 mb-6">Visit Us</h2>
              <div className="space-y-4 mb-8">
                {contactInfo.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-5 card rounded-xl"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-dark-100 text-sm mb-1">{item.title}</p>
                      <p className="text-gray-500 text-sm whitespace-pre-line">
                        {item.title === 'Phone' ? (
                          <a href={`tel:${item.text}`} className="text-primary-700 hover:underline">{item.text}</a>
                        ) : (
                          item.text
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Google Map (Thoothukudi, Tamil Nadu) */}
              <div className="rounded-2xl overflow-hidden h-48 shadow-sm">
                <iframe
                  title="Glamour Parlour — Thoothukudi"
                  src="https://www.google.com/maps?q=Thoothukudi,+Tamil+Nadu,+India&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* ── Contact Form ── */}
            <div>
              <h2 className="font-display text-2xl font-bold text-dark-100 mb-6">Send a Message</h2>

              {sent ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="card p-10 text-center"
                >
                  <p className="text-6xl mb-4">💌</p>
                  <h3 className="font-display text-2xl font-bold text-dark-100 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">We've received your message and will get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'', message:'' }) }} className="btn-outline">
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="card p-8 space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                      <input type="text" placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input type="tel" placeholder="+91 90256 05056" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input type="email" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => update('subject', e.target.value)} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                    <textarea rows={5} placeholder="Your message…" value={form.message} onChange={e => update('message', e.target.value)} className="input-field resize-none" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3.5">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : 'Send Message 💌'}
                  </button>
                </motion.form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
