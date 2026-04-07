/**
 * AdminDashboardPage — Full admin control panel
 * Tabs: Bookings (accept/reject, set time) + Contact Messages
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import emailjs from '@emailjs/browser'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const STATUS_COLORS = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  REJECTED:  'badge-rejected',
  COMPLETED: 'badge badge-completed',
}

const PAYMENT_COLORS = { PAID: 'badge-paid', UNPAID: 'badge-unpaid' }

const StatCard = ({ icon, title, value, color }) => (
  <div className={`card p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-dark-100 mt-1">{value}</p>
      </div>
      <span className="text-4xl opacity-80">{icon}</span>
    </div>
  </div>
)

export default function AdminDashboardPage() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'bookings'
  const setTab = (t) => setSearchParams({ tab: t })

  const [bookings,  setBookings]  = useState([])
  const [contacts,  setContacts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  // Appointment time setter state
  const [apptModal,  setApptModal]  = useState(null)  // booking object
  const [apptDate,   setApptDate]   = useState('')
  const [apptTime,   setApptTime]   = useState('')
  const [apptLoading, setApptLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/bookings' + (statusFilter ? `?status=${statusFilter}` : '')),
        api.get('/contact'),
      ])
      setBookings(bRes.data.bookings || [])
      setContacts(cRes.data.messages || [])
    } catch { toast.error('Failed to load data.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [statusFilter])

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/bookings/${id}/status`, { status })
      toast.success(`Booking ${status.toLowerCase()}!`)
      fetchData()

      if (status === 'CONFIRMED') {
        const booking = res.data.booking

        emailjs.send(
          "service_uld4bcu",
          "template_1j23j4y",
          {
            to_email: booking.clientEmail,
            client_name: booking.clientName,
            service_name: booking.service.name,
            preferred_date: new Date(booking.preferredDate).toLocaleDateString(),
            preferred_time: booking.preferredTime,
          },
          "sALVrwmFkr67OmV75"
        ).then(() => {
          console.log("✅ Confirmation mail sent")
        }).catch(err => {
          console.error("❌ Email error:", err)
        })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update booking.'
      toast.error(msg)
    }
  }

  const setAppointment = async () => {
    if (!apptDate || !apptTime) { toast.error('Select date and time.'); return }
    setApptLoading(true)
    try {
      const res = await api.patch(`/bookings/${apptModal.id}/appointment`, {
        appointmentDate: apptDate,
        appointmentTime: apptTime,
      })
      toast.success('Appointment set & client notified! 📧')
      setApptModal(null)
      fetchData()

      // Send confirmation email to client
      const booking = res.data.booking
      const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })

      emailjs.send(
        "service_uld4bcu",
        "template_1j23j4y",
        {
          to_email: booking.clientEmail,
          client_name: booking.clientName,
          service_name: booking.service.name,
          status: booking.status,
          appointment_date: formatDate(booking.appointmentDate),
          appointment_time: booking.appointmentTime,
          is_confirmed: true,
        },
        "sALVrwmFkr67OmV75"
      ).catch(console.error)
    } catch { toast.error('Failed to set appointment.') }
    finally { setApptLoading(false) }
  }

  const markRead = async (id) => {
    try {
      await api.patch(`/contact/${id}/read`)
      setContacts(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    } catch { /* silent */ }
  }

  // Stats
  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    unread:    contacts.filter(c => !c.isRead).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Topbar ─────────────────────────────────────────────────── */}
      <header className="bg-dark-100 text-white sticky top-0 z-50 shadow-lg">
        <div className="container-custom h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌸</span>
            <div>
              <h1 className="font-display font-bold text-sm md:text-base">Glamour Parlour</h1>
              <p className="text-gray-400 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold">{admin?.name}</p>
              <p className="text-gray-400 text-xs">{admin?.email}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/admin/login') }}
              className="text-xs px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* ─── Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" title="Total Bookings"  value={stats.total}     color="border-purple-500" />
          <StatCard icon="⏳" title="Pending"         value={stats.pending}   color="border-amber-500" />
          <StatCard icon="✅" title="Confirmed"       value={stats.confirmed} color="border-emerald-500" />
          <StatCard icon="💌" title="Unread Messages" value={stats.unread}    color="border-rose-500" />
        </div>

        {/* ─── Tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'bookings', label: '📋 Bookings', count: bookings.length },
            { id: 'contacts', label: '💌 Messages', count: contacts.filter(c => !c.isRead).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-gradient-primary text-white shadow-glow' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* ─── Bookings Tab ───────────────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['', 'PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === s ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-400">
                <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-700 rounded-full animate-spin mx-auto mb-3" />
                Loading…
              </div>
            ) : bookings.length === 0 ? (
              <div className="card p-16 text-center text-gray-400">
                <p className="text-5xl mb-3">📋</p>
                <p>No bookings found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-dark-100">{b.clientName}</h3>
                          <span className={`badge ${STATUS_COLORS[b.status] || 'badge-pending'}`}>{b.status}</span>
                          <span className={`badge ${PAYMENT_COLORS[b.paymentStatus] || 'badge-unpaid'}`}>{b.paymentStatus}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                          <span>📞 <a href={`tel:${b.clientPhone}`} className="text-primary-700 hover:underline">{b.clientPhone}</a></span>
                          <span>✉️ {b.clientEmail}</span>
                          <span>💆 {b.service?.name}</span>
                          <span>💰 ₹{b.totalAmount}</span>
                          <span>📅 {new Date(b.preferredDate).toLocaleDateString('en-IN')}</span>
                          <span>🕐 {b.preferredTime}</span>
                          {b.appointmentDate && <span className="text-emerald-600 font-semibold col-span-2">✅ Appt: {new Date(b.appointmentDate).toLocaleDateString('en-IN')} {b.appointmentTime}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {b.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateStatus(b.id, 'CONFIRMED')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors">
                              ✓ Accept
                            </button>
                            <button onClick={() => updateStatus(b.id, 'REJECTED')} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors">
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                          <button onClick={() => { setApptModal(b); setApptDate(''); setApptTime('') }} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors">
                            📅 Set Time
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button onClick={() => updateStatus(b.id, 'COMPLETED')} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors">
                            ✓ Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Contacts Tab ───────────────────────────────────────────── */}
        {activeTab === 'contacts' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading…</div>
            ) : contacts.length === 0 ? (
              <div className="card p-16 text-center text-gray-400">
                <p className="text-5xl mb-3">💌</p><p>No messages yet.</p>
              </div>
            ) : contacts.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`card p-5 ${!c.isRead ? 'border-l-4 border-primary-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-dark-100">{c.name}</h3>
                      {!c.isRead && <span className="badge badge-pending text-xs">Unread</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {c.email}
                      {c.phone && (
                        <> · <a href={`tel:${c.phone}`} className="text-primary-700 hover:underline">{c.phone}</a></>
                      )}
                      · {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mb-1">📌 {c.subject}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.message}</p>
                  </div>
                  {!c.isRead && (
                    <button onClick={() => markRead(c.id)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors">
                      Mark Read
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Set Appointment Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {apptModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setApptModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="font-display text-xl font-bold text-dark-100 mb-1">Set Appointment Time</h3>
              <p className="text-gray-500 text-sm mb-6">For <strong>{apptModal.clientName}</strong> — {apptModal.service?.name}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date</label>
                  <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Time</label>
                  <input type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setApptModal(null)} className="btn-outline flex-1">Cancel</button>
                <button onClick={setAppointment} disabled={apptLoading} className="btn-primary flex-1 justify-center">
                  {apptLoading ? 'Saving…' : 'Confirm & Notify Client 📧'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
