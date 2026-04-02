/**
 * Contact Routes
 * POST /api/contact  → save contact message & notify admin
 * GET  /api/contact  → list all messages (admin)
 * PATCH /api/contact/:id/read → mark as read (admin)
 */

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");
const { sendContactNotificationToAdmin } = require("../utils/email");

const prisma = new PrismaClient();

// ─── Submit Contact Message ────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "name, email, subject, and message are required." });
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    });

    // Notify admin asynchronously
    sendContactNotificationToAdmin(contact).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Your message has been received! We'll get back to you soon.",
      contact,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

// ─── List All Contact Messages (Admin) ────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { isRead } = req.query;
    const where = isRead !== undefined ? { isRead: isRead === "true" } : {};

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = await prisma.contactMessage.count({ where: { isRead: false } });

    res.json({ success: true, messages, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch messages." });
  }
});

// ─── Mark Message as Read (Admin) ─────────────────────────────────────────────
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update message." });
  }
});

module.exports = router;
