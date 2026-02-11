const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../middlewares/asyncHandler");
const { requireAdmin } = require("../middlewares/auth");
const adminController = require("../controllers/admin.controller");

router.get("/", requireAdmin, asyncHandler(adminController.dashboard));
router.get("/reservas", requireAdmin, asyncHandler(adminController.reservations));
router.get("/reservas/:id", requireAdmin, asyncHandler(adminController.reservationView));

// placeholders FASE 1 (UI lista, sin lógica todavía)
router.get("/horarios", requireAdmin, asyncHandler(adminController.schedulePlaceholder));
router.get("/servicios", requireAdmin, asyncHandler(adminController.servicesPlaceholder));
router.get("/bloqueos", requireAdmin, asyncHandler(adminController.blocksPlaceholder));
router.get("/ajustes", requireAdmin, asyncHandler(adminController.settingsPlaceholder));

module.exports = router;
