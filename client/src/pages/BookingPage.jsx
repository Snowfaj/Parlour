/**
 * BookingPage — 4-Step Booking Wizard with Razorpay Payment
 * Step 1: Select Service
 * Step 2: Select Date & Time
 * Step 3: Enter Contact Info
 * Step 4: Pay with Razorpay → Success Screen
 */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'

const TIME_SLOTS = [
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','1:00 PM','2:00 PM','2:30 PM','3:00 PM',
  '3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','7:00 PM',
]

const CATEGORY_ICONS = { hair:'💇‍♀️', facial:'✨', bridal:'👰', nail:'💅', spa:'🧖‍♀️', makeup:'💄' }

const stepLabels = ['Select Service', 'Date & Time', 'Your Details', 'Payment']

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const preSelectedId   = searchParams.get('service')

  const [step,     setStep]    = useState(preSelectedId ? 1 : 0)
  const [services, setServices] = useState([])
  const [loading,  setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success,  setSuccess] = useState(false)
  const [booking,  setBooking] = useState(null)

  const [form, setForm] = useState({
    serviceId:     preSelectedId || '',
    preferredDate: '',
    preferredTime: '',
    clientName:    '',
    clientEmail:   '',
    clientPhone:   '',
    notes:         '',
  })

  useEffect(() => {
    api.get('/services')
      .then(res => setServices(res.data.services || []))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false))
  }, [])

  const selectedService = services.find(s => s.id === form.serviceId)

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  // Validate step before proceeding
  const canProceed = () => {
    if (step === 0) return !!form.serviceId
    if (step === 1) return !!form.preferredDate && !!form.preferredTime
    if (step === 2) return form.clientName && form.clientEmail && form.clientPhone
    return false
  }

  // ─── Razorpay Payment Handler ──────────────────────────────────────────────
  const handlePayment = async () => {
    if (!selectedService) return
    setSubmitting(true)
    try {
      // 1. Create Razorpay order
      const orderRes = await api.post('/payments/create-order', {
        amount: selectedService.price,
        receipt: `rcpt_${Date.now()}`,
      })
      const { order, key } = orderRes.data

      // 2. Open Razorpay checkout
      const options = {
        key,
        amount:      order.amount,
        currency:    order.currency,
        name:        'Glamour Parlour',
        description: selectedService.name,
        order_id:    order.id,
        prefill: {
          name:    form.clientName,
          email:   form.clientEmail,
          contact: form.clientPhone,
        },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          try {
            // 3. Verify payment
            await api.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            })

            // 4. Create booking
            const bookingRes = await api.post('/bookings', {
              ...form,
              paymentId:      response.razorpay_payment_id,
              paymentOrderId: response.razorpay_order_id,
              totalAmount:    selectedService.price,
            })
            setBooking(bookingRes.data.booking)
            setSuccess(true)
            toast.success('Booking confirmed! Check your email 📧')
          } catch (err) {
            toast.error('Payment verified but booking failed. Contact support.')
          } finally {
            setSubmitting(false)
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed.')
      setSubmitting(false)
    }
  }

  // ─── Success Screen ────────────────────────────────────────────────────────
  if (success && booking) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-bg">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-glow"
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }} className="text-7xl mb-6">🎉</motion.div>
          <h2 className="font-display text-3xl font-bold text-dark-100 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-6">A confirmation email has been sent to <strong>{booking.clientEmail}</strong></p>
          <div className="bg-primary-50 rounded-2xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Service</span><span className="font-semibold">{selectedService?.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-semibold">{new Date(booking.preferredDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-semibold">{booking.preferredTime}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold text-primary-700">₹{booking.totalAmount}</span></div>
          </div>
          <p className="text-xs text-gray-400">Our team will confirm your appointment soon ✨</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Page Header */}
      <div className="hero-bg pt-32 pb-12 px-4 text-center">
        <h1 className="section-title mb-2">Book Your <span className="gradient-text">Appointment</span></h1>
        <p className="text-gray-500">Complete in 4 easy steps</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container-custom py-4">
          <div className="flex items-center justify-center gap-0">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i < step ? 'bg-gradient-primary text-white' :
                    i === step ? 'bg-primary-700 text-white ring-4 ring-primary-200' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block font-medium ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`h-0.5 w-12 sm:w-20 mx-1 transition-all duration-300 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <section className="section">
        <div className="container-custom max-w-3xl">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: Select Service ── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-display font-bold mb-6">What service do you need?</h2>
                {loading ? <div className="text-center py-10 text-gray-400">Loading services…</div> : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {services.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { updateForm('serviceId', s.id); setStep(1) }}
                        className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:border-primary-400 hover:shadow-glow ${
                          form.serviceId === s.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{CATEGORY_ICONS[s.category] || '💆'}</span>
                          <div>
                            <p className="font-semibold text-dark-100 text-sm">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.duration} mins</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-primary-700">₹{s.price}</p>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 1: Date & Time ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-display font-bold mb-6">Pick your date & time</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.preferredDate}
                      onChange={e => updateForm('preferredDate', e.target.value)}
                      className="input-field max-w-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Available Time Slots</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          onClick={() => updateForm('preferredTime', slot)}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                            form.preferredTime === slot
                              ? 'bg-gradient-primary text-white shadow-glow'
                              : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Contact Info ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-display font-bold mb-6">Your contact details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input type="text" placeholder="Priya Sharma" value={form.clientName} onChange={e => updateForm('clientName', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input type="email" placeholder="priya@email.com" value={form.clientEmail} onChange={e => updateForm('clientEmail', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.clientPhone} onChange={e => updateForm('clientPhone', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Special Notes (optional)</label>
                    <textarea rows={3} placeholder="Any special requirements or allergies…" value={form.notes} onChange={e => updateForm('notes', e.target.value)} className="input-field resize-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Summary & Pay ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-display font-bold mb-6">Review & Pay</h2>
                <div className="card p-6 space-y-4 mb-6">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <span className="text-5xl">{CATEGORY_ICONS[selectedService?.category] || '💆'}</span>
                    <div>
                      <h3 className="font-display font-bold text-xl text-dark-100">{selectedService?.name}</h3>
                      <p className="text-gray-500 text-sm">{selectedService?.duration} mins · {selectedService?.category}</p>
                    </div>
                  </div>
                  {[
                    ['Client',  form.clientName],
                    ['Email',   form.clientEmail],
                    ['Phone',   form.clientPhone],
                    ['Date',    form.preferredDate],
                    ['Time',    form.preferredTime],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-semibold text-dark-100">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <span className="font-bold text-gray-700">Total Amount</span>
                    <span className="text-2xl font-bold text-primary-700">₹{selectedService?.price}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
                  🔒 Your payment is 100% secure. You'll receive a confirmation email after successful payment.
                </div>

                <button
                  id="pay-now-btn"
                  onClick={handlePayment}
                  disabled={submitting}
                  className="btn-primary w-full justify-center text-base !py-4"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : `Pay ₹${selectedService?.price} & Confirm`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {!success && (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                className={`btn-outline ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                ← Back
              </button>
              {step < 3 && (
                <button
                  onClick={() => { if (canProceed()) setStep(s => s + 1) }}
                  disabled={!canProceed()}
                  className={`btn-primary ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
