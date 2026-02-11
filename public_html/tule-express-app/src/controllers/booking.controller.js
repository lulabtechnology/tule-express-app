const crypto = require("crypto");
const serviceModel = require("../models/service.model");
const bookingModel = require("../models/booking.model");
const { validateBooking } = require("../middlewares/validate");
const { panamaLocalToUtcSql, utcSqlToPanamaHuman } = require("../config/time");
const { sendMailBestEffort } = require("../config/mailer");
const { env } = require("../config/env");

function makeCode() {
  const date = new Date();
  const y = String(date.getUTCFullYear()).slice(-2);
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TE-${y}${m}${d}-${rand}`;
}

function waLink(text, whatsappE164) {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${whatsappE164}?text=${encoded}`;
}

async function form(req, res) {
  const services = await serviceModel.listActive();
  res.render("booking", {
    pageTitle: "Reservar",
    active: "booking",
    services,
    form: {
      service_id: "",
      datetime_local: "",
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      people_count: 1,
      notes: ""
    },
    errors: []
  });
}

async function create(req, res) {
  const body = req.body || {};
  const errors = validateBooking(body);

  const services = await serviceModel.listActive();
  if (errors.length) {
    return res.status(400).render("booking", {
      pageTitle: "Reservar",
      active: "booking",
      services,
      form: body,
      errors
    });
  }

  const service = await serviceModel.getById(Number(body.service_id));
  if (!service) {
    return res.status(400).render("booking", {
      pageTitle: "Reservar",
      active: "booking",
      services,
      form: body,
      errors: ["Servicio inválido."]
    });
  }

  const startUtcSql = panamaLocalToUtcSql(body.datetime_local);
  if (!startUtcSql) {
    return res.status(400).render("booking", {
      pageTitle: "Reservar",
      active: "booking",
      services,
      form: body,
      errors: ["Fecha/hora inválida."]
    });
  }

  const code = makeCode();
  const reservationId = await bookingModel.createReservation({
    code,
    service_id: service.id,
    customer_name: body.customer_name.trim(),
    customer_phone: body.customer_phone.trim(),
    customer_email: body.customer_email.trim(),
    people_count: Number(body.people_count),
    notes: body.notes.trim(),
    requested_start_utc: startUtcSql,
    duration_minutes: Number(service.duration_minutes) || 60
  });

  // Best effort email al admin
  if (env.ADMIN_NOTIFY_EMAIL) {
    const humanPana = utcSqlToPanamaHuman(startUtcSql);
    await sendMailBestEffort({
      to: env.ADMIN_NOTIFY_EMAIL,
      subject: `Nueva solicitud de reserva (${code})`,
      html: `
        <p><strong>Nueva solicitud</strong></p>
        <ul>
          <li><strong>Código:</strong> ${code}</li>
          <li><strong>Servicio:</strong> ${service.name}</li>
          <li><strong>Fecha/Hora (Panamá):</strong> ${humanPana}</li>
          <li><strong>Cliente:</strong> ${body.customer_name}</li>
          <li><strong>Teléfono:</strong> ${body.customer_phone}</li>
          <li><strong>Email:</strong> ${body.customer_email}</li>
          <li><strong>Personas:</strong> ${body.people_count}</li>
          <li><strong>Notas:</strong> ${body.notes}</li>
        </ul>
        <p>Admin: ${env.APP_URL}/admin</p>
      `
    });
  }

  req.flash("success", "Solicitud creada. Te mostraremos el código y el botón de WhatsApp.");
  return res.redirect(`/reservar/exito/${encodeURIComponent(code)}`);
}

async function success(req, res) {
  const code = String(req.params.code || "").trim();
  const reservation = await bookingModel.getByCode(code);
  if (!reservation) {
    req.flash("error", "Reserva no encontrada.");
    return res.redirect("/reservar");
  }

  const service = await serviceModel.getById(reservation.service_id);

  const startPana = utcSqlToPanamaHuman(reservation.requested_start_utc);

  const msg = [
    "Hola Tule Express 👋",
    `Quiero confirmar mi solicitud de reserva.`,
    `Código: ${reservation.code}`,
    `Servicio: ${service ? service.name : "N/D"}`,
    `Fecha/Hora (Panamá): ${startPana}`,
    `Personas: ${reservation.people_count}`,
    `Cliente: ${reservation.customer_name}`,
    `Teléfono: ${reservation.customer_phone}`,
    `Email: ${reservation.customer_email}`,
    `Notas: ${reservation.notes}`
  ].join("\n");

  res.render("booking_success", {
    pageTitle: "Solicitud enviada",
    active: "booking",
    reservation,
    service,
    startPana,
    waUrl: waLink(msg, env.WHATSAPP_E164)
  });
}

module.exports = { form, create, success };
