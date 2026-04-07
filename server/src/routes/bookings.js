/**
 * Bookings Routes
 * POST  /api/bookings             → create booking (public, after payment)
 * GET   /api/bookings             → list all bookings (admin)
 * GET   /api/bookings/:id         → get booking detail (admin)
 * PATCH /api/bookings/:id/status  → accept/reject booking (admin)
 * PATCH /api/bookings/:id/appointment → set appointment time (admin)
 */

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// ─── Create Booking (called after successful payment) ─────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      clientName, clientEmail, clientPhone,
      serviceId, preferredDate, preferredTime,
      paymentId, paymentOrderId, totalAmount, notes,
    } = req.body;

    if (!clientName || !clientEmail || !clientPhone || !serviceId || !preferredDate || !preferredTime) {
      return res.status(400).json({ success: false, message: "All required fields must be provided." });
    }

    // Verify service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ success: false, message: "Service not found." });

    const booking = await prisma.booking.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        serviceId,
        preferredDate: new Date(preferredDate),
        preferredTime,
        paymentId,
        paymentOrderId,
        paymentStatus: paymentId ? "PAID" : "UNPAID",
        totalAmount: parseFloat(totalAmount || service.price),
        notes,
        status: "PENDING",
      },
      include: { service: true },
    });

    res.status(201).json({ success: true, message: "Booking created successfully.", booking });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: "Failed to create booking." });
  }
});

// ─── List All Bookings (Admin) ─────────────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { service: { select: { name: true, category: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ success: true, bookings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings." });
  }
});

// ─── Get Booking Detail (Admin) ────────────────────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { service: true },
    });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch booking." });
  }
});

// ─── Update Booking Status (Admin: accept/reject) ──────────────────────────────
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["CONFIRMED", "REJECTED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: { service: true },
    });

    res.json({ success: true, message: `Booking ${status.toLowerCase()}.`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update booking status." });
  }
});

// ─── Set Appointment Time (Admin) ─────────────────────────────────────────────
router.patch("/:id/appointment", authMiddleware, async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: "appointmentDate and appointmentTime are required." });
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        status: "CONFIRMED",
      },
      include: { service: true },
    });

    res.json({ success: true, message: "Appointment time set and client notified.", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to set appointment time." });
  }
});

module.exports = router;
