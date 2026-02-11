const bookingModel = require("../models/booking.model");

async function dashboard(req, res) {
  const stats = await bookingModel.getStats();
  res.render("admin/dashboard", {
    pageTitle: "Panel Admin",
    active: "admin",
    stats
  });
}

async function reservations(req, res) {
  const status = String(req.query.status || "PENDING").toUpperCase();
  const list = await bookingModel.listReservations({ status });
  res.render("admin/reservations", {
    pageTitle: "Reservas",
    active: "admin_reservations",
    status,
    list
  });
}

async function reservationView(req, res) {
  const id = Number(req.params.id);
  const item = await bookingModel.getById(id);
  if (!item) {
    req.flash("error", "Reserva no encontrada.");
    return res.redirect("/admin/reservas");
  }
  res.render("admin/reservation_view", {
    pageTitle: `Reserva #${id}`,
    active: "admin_reservations",
    item
  });
}

// Placeholders FASE 1
async function schedulePlaceholder(req, res) {
  res.render("admin/schedule", { pageTitle: "Horarios (FASE 3)", active: "admin_schedule" });
}
async function servicesPlaceholder(req, res) {
  res.render("admin/services", { pageTitle: "Servicios (FASE 3)", active: "admin_services" });
}
async function blocksPlaceholder(req, res) {
  res.render("admin/blocks", { pageTitle: "Bloqueos (FASE 3)", active: "admin_blocks" });
}
async function settingsPlaceholder(req, res) {
  res.render("admin/settings", { pageTitle: "Ajustes (FASE 3)", active: "admin_settings" });
}

module.exports = {
  dashboard,
  reservations,
  reservationView,
  schedulePlaceholder,
  servicesPlaceholder,
  blocksPlaceholder,
  settingsPlaceholder
};
