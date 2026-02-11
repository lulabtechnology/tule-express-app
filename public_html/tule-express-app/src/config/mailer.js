const nodemailer = require("nodemailer");
const { env } = require("./env");

// Best effort: sendmail/local (si Hostinger lo permite).
// Si falla, lanzará error para capturarlo (NO rompe flujo).
function getTransport() {
  return nodemailer.createTransport({
    sendmail: true,
    newline: "unix",
    path: "/usr/sbin/sendmail"
  });
}

async function sendMailBestEffort({ to, subject, html }) {
  if (!to) return { ok: false, skipped: true, reason: "missing_to" };

  try {
    const transporter = getTransport();
    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html
    });
    return { ok: true, info };
  } catch (e) {
    console.error("[mailer] send failed:", e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendMailBestEffort };
