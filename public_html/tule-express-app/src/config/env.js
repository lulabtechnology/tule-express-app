const dotenv = require("dotenv");
dotenv.config();

function required(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v.trim();
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  PORT: process.env.PORT || process.env.APP_PORT || "3000",

  SESSION_SECRET: required("SESSION_SECRET"),
  SESSION_NAME: process.env.SESSION_NAME || "tule.sid",

  DB_HOST: required("DB_HOST"),
  DB_PORT: process.env.DB_PORT || "3306",
  DB_NAME: required("DB_NAME"),
  DB_USER: required("DB_USER"),
  DB_PASS: required("DB_PASS"),

  TZ: process.env.TZ || "UTC",
  PANA_ZONE: process.env.PANA_ZONE || "America/Panama",

  WHATSAPP_E164: process.env.WHATSAPP_E164 || "50764349958",

  MAIL_FROM: process.env.MAIL_FROM || "no-reply@tule-express.hostingersite.com",
  ADMIN_NOTIFY_EMAIL: process.env.ADMIN_NOTIFY_EMAIL || ""
};

module.exports = { env };
