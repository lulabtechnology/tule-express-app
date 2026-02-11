function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str || "").trim());
}

function validateBooking(body) {
  const errors = [];

  if (!String(body.service_id || "").trim()) errors.push("Selecciona un servicio.");
  if (!String(body.datetime_local || "").trim()) errors.push("Selecciona fecha y hora.");
  if (!String(body.customer_name || "").trim()) errors.push("Nombre es obligatorio.");
  if (!String(body.customer_phone || "").trim()) errors.push("Teléfono es obligatorio.");

  const email = String(body.customer_email || "").trim();
  if (!email) errors.push("Email es obligatorio.");
  else if (!isEmail(email)) errors.push("Email no es válido.");

  const people = Number(body.people_count);
  if (!people || people < 1 || people > 99) errors.push("Cantidad de personas inválida (1–99).");

  // notas obligatorio en tu definición (aunque sea “-”)
  if (!String(body.notes || "").trim()) errors.push("Notas son obligatorias (puede ser breve).");

  return errors;
}

function validateLogin(body) {
  const errors = [];
  if (!String(body.identifier || "").trim()) errors.push("Usuario o email es obligatorio.");
  if (!String(body.password || "").trim()) errors.push("Contraseña es obligatoria.");
  return errors;
}

module.exports = { validateBooking, validateLogin };
