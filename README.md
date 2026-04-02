# 🌸 Glamour Parlour — Booking System

A production-ready full-stack parlour booking application with online payments, email notifications, and an admin panel.

---

## 🏗️ Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend  | Node.js + Express + Prisma ORM |
| Database | PostgreSQL |
| Payments | Razorpay |
| Email    | Nodemailer (Gmail SMTP) |
| Auth     | JWT (admin) |
| Deploy   | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
porlour-booking/
├── client/                   # React frontend
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/       # Navbar, Footer, ServiceCard, etc.
│   │   ├── context/          # AuthContext (JWT)
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── ServicesPage.jsx
│   │       ├── BookingPage.jsx   # 4-step wizard + Razorpay
│   │       ├── ContactPage.jsx
│   │       └── admin/
│   │           ├── AdminLoginPage.jsx
│   │           └── AdminDashboardPage.jsx
│   └── tailwind.config.js
│
└── server/                   # Express backend
    ├── prisma/schema.prisma  # DB schema
    └── src/
        ├── index.js          # Entry point
        ├── middleware/auth.js # JWT guard
        ├── routes/           # auth, services, bookings, payments, contact
        └── utils/            # email.js, seed.js
```

---

## 🚀 Local Setup

### 1. Clone & Install

```bash
git clone <YOUR_REPO_URL> && cd porlour-booking

# Install backend deps
cd server && npm install

# Install frontend deps
cd ../client && npm install
```

### 2. Configure Backend Environment

```bash
cd server
cp .env.example .env
# Edit .env — add DATABASE_URL, JWT_SECRET, Razorpay keys, Gmail creds
```

### 3. Setup Database

```bash
cd server

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed database (default services + admin user)
npm run seed
```

> **Default Admin:** `admin@parlour.com` / `Admin@123`

### 4. Start Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd client && npm run dev
# → http://localhost:5173
```

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Admin login |
| GET | `/api/auth/me` | JWT | Get admin profile |
| GET | `/api/services` | — | List all services |
| POST | `/api/services` | JWT | Create service |
| POST | `/api/bookings` | — | Create booking (after payment) |
| GET | `/api/bookings` | JWT | List all bookings |
| PATCH | `/api/bookings/:id/status` | JWT | Accept/Reject booking |
| PATCH | `/api/bookings/:id/appointment` | JWT | Set appointment time |
| POST | `/api/payments/create-order` | — | Create Razorpay order |
| POST | `/api/payments/verify` | — | Verify payment signature |
| POST | `/api/contact` | — | Submit contact form |
| GET | `/api/contact` | JWT | List contact messages |

---

## 💳 Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Dashboard → Settings → API Keys**
3. Generate test keys
4. Add to `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

---

## 📧 Email Setup (Gmail)

1. Enable **2-Step Verification** on your Google Account
2. Go to **Security → App Passwords** → Create new password
3. Add to `server/.env`:
   ```
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_16_char_app_password
   ADMIN_EMAIL=admin_notification_email@gmail.com
   ```

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Connect GitHub repo in Vercel dashboard
# Set VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render

1. Create a **Web Service** on [Render](https://render.com)
2. Root directory: `server`
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`

### Database → Supabase / Render PostgreSQL

1. Create a PostgreSQL database
2. Copy the connection string to `DATABASE_URL` in your environment variables

---

## ✨ Features

- 🏠 **Home** — Animated hero, service preview, gallery, testimonials, CTA
- 💆 **Services** — Category tabs (Hair, Facial, Bridal, Nail, Spa, Makeup)
- 📅 **Booking** — 4-step wizard: service → date/time → info → Razorpay payment
- 📬 **Contact** — Form with instant admin email notification
- 🔐 **Admin Login** — Dark glassmorphism design, JWT auth
- 📊 **Admin Dashboard**:
  - Stats cards (total, pending, confirmed, unread)
  - Booking management: accept, reject, complete, set appointment time
  - Contact messages with mark-as-read
  - Appointment confirmation emails auto-sent to client
- 📧 **4 Email Templates**: booking received, admin alert, appointment confirmed/rejected, contact message
- 🎨 **Animations**: Framer Motion throughout — page transitions, card hovers, modals, hero

---

## 🔐 Admin Credentials (Development)

| Field | Value |
|-------|-------|
| Email | `admin@parlour.com` |
| Password | `Admin@123` |

> ⚠️ **Change before production!** Use `npm run seed` then update the admin password via database.
# parlour-booking
