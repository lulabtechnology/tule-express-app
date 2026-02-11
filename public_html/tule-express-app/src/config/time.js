const { DateTime } = require("luxon");
const { env } = require("./env");

// Convierte datetime-local (Panamá) a UTC SQL DATETIME (yyyy-LL-dd HH:mm:ss)
function panamaLocalToUtcSql(datetimeLocalStr) {
  // datetimeLocalStr: "2026-02-11T14:30"
  const dt = DateTime.fromISO(datetimeLocalStr, { zone: env.PANA_ZONE });
  if (!dt.isValid) return null;
  return dt.toUTC().toFormat("yyyy-LL-dd HH:mm:ss");
}

// Convierte UTC SQL DATETIME a string Panamá
function utcSqlToPanamaHuman(utcSql) {
  const dt = DateTime.fromSQL(utcSql, { zone: "utc" }).setZone(env.PANA_ZONE);
  if (!dt.isValid) return "";
  return dt.toFormat("dd/LL/yyyy hh:mm a");
}

module.exports = { panamaLocalToUtcSql, utcSqlToPanamaHuman };
