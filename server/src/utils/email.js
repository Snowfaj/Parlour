/**
 * Email Utility — Nodemailer with Gmail SMTP
 * Handles all transactional emails for the parlour booking system
 */

const nodemailer = require("nodemailer");

// ─── Transporter Setup ─────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Helper: Format Date ───────────────────────────────────────────────────────
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
};

// ─── Email Templates ───────────────────────────────────────────────────────────
const emailStyles = `
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f5f0; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; }
  .body { padding: 32px; }
  .body h2 { color: #1f1f2e; margin-top: 0; }
  .info-card { background: #f8f5f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9e4df; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #6b7280; font-size: 14px; }
  .info-value { color: #1f1f2e; font-weight: 600; font-size: 14px; }
  .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
  .badge-pending { background: #fef3c7; color: #d97706; }
  .badge-confirmed { background: #d1fae5; color: #065f46; }
  .badge-rejected { background: #fee2e2; color: #991b1b; }
  .footer { background: #f8f5f0; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
`;

// ─── 1. Send Booking Confirmation to Client ────────────────────────────────────
const sendBookingConfirmationToClient = async (booking) => {
  const mailOptions = {
    from: `"Glamour Parlour 🌸" <${process.env.EMAIL_USER}>`,
    to: booking.clientEmail,
    subject: `✅ Booking Received — ${booking.service.name}`,
    html: `
      <style>${emailStyles}</style>
      <div class="container">
        <div class="header">
          <h1>🌸 Glamour Parlour</h1>
          <p>Booking Confirmation</p>
        </div>
        <div class="body">
          <h2>Hi ${booking.clientName}! 👋</h2>
          <p>Thank you for booking with us! Your appointment request has been received and is currently being reviewed by our team.</p>
          <div class="info-card">
            <div class="info-row"><span class="info-label">Service</span><span class="info-value">${booking.service.name}</span></div>
            <div class="info-row"><span class="info-label">Preferred Date</span><span class="info-value">${formatDate(booking.preferredDate)}</span></div>
            <div class="info-row"><span class="info-label">Preferred Time</span><span class="info-value">${booking.preferredTime}</span></div>
            <div class="info-row"><span class="info-label">Amount Paid</span><span class="info-value">₹${booking.totalAmount}</span></div>
            <div class="info-row"><span class="info-label">Payment ID</span><span class="info-value">${booking.paymentId || "N/A"}</span></div>
            <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge badge-pending">Pending</span></span></div>
          </div>
          <p>We will confirm your appointment shortly. You'll receive another email once your booking is approved.</p>
          <p>For any queries, reply to this email or call us at <strong>+91-98765-43210</strong>.</p>
          <p>With love, <br><strong>Team Glamour Parlour 💅</strong></p>
        </div>
        <div class="footer">© 2025 Glamour Parlour. All rights reserved.</div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Booking confirmation sent to ${booking.clientEmail}`);
};

// ─── 2. Send New Booking Notification to Admin ────────────────────────────────
const sendNewBookingNotificationToAdmin = async (booking) => {
  const mailOptions = {
    from: `"Glamour Parlour System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 New Booking Request — ${booking.clientName}`,
    html: `
      <style>${emailStyles}</style>
      <div class="container">
        <div class="header">
          <h1>🔔 New Booking Alert</h1>
          <p>A new appointment request has been created</p>
        </div>
        <div class="body">
          <h2>New Booking Details</h2>
          <div class="info-card">
            <div class="info-row"><span class="info-label">Client Name</span><span class="info-value">${booking.clientName}</span></div>
            <div class="info-row"><span class="info-label">Email</span><span class="info-value">${booking.clientEmail}</span></div>
            <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${booking.clientPhone}</span></div>
            <div class="info-row"><span class="info-label">Service</span><span class="info-value">${booking.service.name}</span></div>
            <div class="info-row"><span class="info-label">Category</span><span class="info-value">${booking.service.category}</span></div>
            <div class="info-row"><span class="info-label">Preferred Date</span><span class="info-value">${formatDate(booking.preferredDate)}</span></div>
            <div class="info-row"><span class="info-label">Preferred Time</span><span class="info-value">${booking.preferredTime}</span></div>
            <div class="info-row"><span class="info-label">Amount</span><span class="info-value">₹${booking.totalAmount}</span></div>
            <div class="info-row"><span class="info-label">Payment</span><span class="info-value">${booking.paymentStatus}</span></div>
          </div>
          <p>Please review and accept/reject this booking in the admin dashboard.</p>
          <a href="${process.env.CLIENT_URL}/admin/dashboard" class="btn">Go to Dashboard →</a>
        </div>
        <div class="footer">© 2025 Glamour Parlour Admin System</div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 New booking notification sent to admin`);
};

// ─── 3. Send Appointment Confirmation to Client ────────────────────────────────
const sendAppointmentConfirmationToClient = async (booking) => {
  const isConfirmed = booking.status === "CONFIRMED";
  const mailOptions = {
    from: `"Glamour Parlour 🌸" <${process.env.EMAIL_USER}>`,
    to: booking.clientEmail,
    subject: isConfirmed
      ? `🎉 Appointment Confirmed — ${booking.service.name}`
      : `❌ Booking Update — ${booking.service.name}`,
    html: `
      <style>${emailStyles}</style>
      <div class="container">
        <div class="header">
          <h1>🌸 Glamour Parlour</h1>
          <p>${isConfirmed ? "Appointment Confirmed!" : "Booking Status Update"}</p>
        </div>
        <div class="body">
          <h2>Hi ${booking.clientName}! 👋</h2>
          ${isConfirmed
            ? `<p>Great news! Your appointment has been <strong>confirmed</strong>. We're looking forward to seeing you! 💅</p>`
            : `<p>We're sorry, but we couldn't accommodate your booking at the requested time. Please book again at your convenience.</p>`
          }
          <div class="info-card">
            <div class="info-row"><span class="info-label">Service</span><span class="info-value">${booking.service.name}</span></div>
            ${isConfirmed && booking.appointmentDate ? `
            <div class="info-row"><span class="info-label">Appointment Date</span><span class="info-value">${formatDate(booking.appointmentDate)}</span></div>
            <div class="info-row"><span class="info-label">Appointment Time</span><span class="info-value">${booking.appointmentTime}</span></div>
            ` : `
            <div class="info-row"><span class="info-label">Requested Date</span><span class="info-value">${formatDate(booking.preferredDate)}</span></div>
            `}
            <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge ${isConfirmed ? "badge-confirmed" : "badge-rejected"}">${booking.status}</span></span></div>
          </div>
          ${isConfirmed
            ? `<p>📍 <strong>Location:</strong> 123 Glamour Street, Chennai, Tamil Nadu 600001</p>
               <p>Please arrive 5 minutes early. For rescheduling, call us at <strong>+91-98765-43210</strong>.</p>`
            : `<p>We apologize for the inconvenience. You may contact us to book a new slot.</p>`
          }
          <p>With love, <br><strong>Team Glamour Parlour 💅</strong></p>
        </div>
        <div class="footer">© 2025 Glamour Parlour. All rights reserved.</div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Appointment ${booking.status.toLowerCase()} email sent to ${booking.clientEmail}`);
};

// ─── 4. Contact Form Notification to Admin ────────────────────────────────────
const sendContactNotificationToAdmin = async (contact) => {
  const mailOptions = {
    from: `"Glamour Parlour System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📩 New Contact Message — ${contact.subject}`,
    html: `
      <style>${emailStyles}</style>
      <div class="container">
        <div class="header">
          <h1>📩 New Contact Message</h1>
        </div>
        <div class="body">
          <div class="info-card">
            <div class="info-row"><span class="info-label">Name</span><span class="info-value">${contact.name}</span></div>
            <div class="info-row"><span class="info-label">Email</span><span class="info-value">${contact.email}</span></div>
            ${contact.phone ? `<div class="info-row"><span class="info-label">Phone</span><span class="info-value">${contact.phone}</span></div>` : ""}
            <div class="info-row"><span class="info-label">Subject</span><span class="info-value">${contact.subject}</span></div>
          </div>
          <h3>Message:</h3>
          <p style="background:#f8f5f0;padding:16px;border-radius:8px;line-height:1.6;">${contact.message}</p>
          <a href="${process.env.CLIENT_URL}/admin/dashboard?tab=contacts" class="btn">View in Dashboard →</a>
        </div>
        <div class="footer">© 2025 Glamour Parlour Admin System</div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Contact notification sent to admin`);
};

module.exports = {
  sendBookingConfirmationToClient,
  sendNewBookingNotificationToAdmin,
  sendAppointmentConfirmationToClient,
  sendContactNotificationToAdmin,
};
