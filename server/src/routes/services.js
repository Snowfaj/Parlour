/**
 * Services Routes
 * GET  /api/services         → list all active services (public)
 * GET  /api/services/:id     → get single service (public)
 * POST /api/services         → create service (admin)
 * PUT  /api/services/:id     → update service (admin)
 * DELETE /api/services/:id   → soft-delete service (admin)
 */

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const prisma = new PrismaClient();

// ─── Get All Active Services ───────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;

    const services = await prisma.service.findMany({
      where,
      orderBy: { category: "asc" },
    });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch services." });
  }
});

// ─── Get Single Service ────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ success: false, message: "Service not found." });
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch service." });
  }
});

// ─── Create Service (Admin) ────────────────────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, duration, category, image } = req.body;
    if (!name || !price || !duration || !category) {
      return res.status(400).json({ success: false, message: "name, price, duration, category are required." });
    }
    const service = await prisma.service.create({
      data: { name, description, price: parseFloat(price), duration: parseInt(duration), category, image },
    });
    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create service." });
  }
});

// ─── Update Service (Admin) ────────────────────────────────────────────────────
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, duration, category, image, isActive } = req.body;
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(category && { category }),
        ...(image && { image }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update service." });
  }
});

// ─── Delete Service (Admin) ────────────────────────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: "Service deactivated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete service." });
  }
});

module.exports = router;
