/**
 * Footer Component
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-dark-100 text-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🌸</span>
              <span className="font-display font-bold text-2xl gradient-text">Glamour Parlour</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm max-w-sm">
              Your premier destination for beauty and wellness. We offer a complete range of beauty services in a luxurious, relaxing environment.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              {['📘','📸','🐦','▶️'].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-primary-700 flex items-center justify-center text-sm transition-colors duration-200">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home',     path: '/' },
                { label: 'Services', path: '/services' },
                { label: 'Booking',  path: '/booking' },
                { label: 'Contact',  path: '/contact' },
              ].map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                📍 <span>123 Glamour Street,<br />Chennai, Tamil Nadu 600001</span>
              </li>
              <li className="flex items-center gap-2">
                📞 <a href="tel:+919876543210" className="hover:text-primary-400 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-2">
                ✉️ <a href="mailto:hello@glamour.com" className="hover:text-primary-400 transition-colors">hello@glamour.com</a>
              </li>
              <li className="flex items-center gap-2">
                🕐 <span>Mon–Sat: 9 AM – 8 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2025 Glamour Parlour. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
