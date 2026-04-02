/**
 * App.jsx — Root Router
 * Defines all client-side routes and wraps with AuthProvider
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public Pages
import HomePage       from './pages/HomePage'
import ServicesPage   from './pages/ServicesPage'
import BookingPage    from './pages/BookingPage'
import ContactPage    from './pages/ContactPage'

// Admin Pages
import AdminLoginPage     from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'

// ─── Protected Route Wrapper ───────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
      <div className="w-10 h-10 rounded-full border-4 border-primary-400 border-t-transparent animate-spin" />
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/booking"  element={<BookingPage />} />
          <Route path="/contact"  element={<ContactPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login"     element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
