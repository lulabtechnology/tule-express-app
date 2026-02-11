const { pool } = require("../config/db");

async function listActive() {
  const [rows] = await pool.query(
    `SELECT id, name, description, duration_minutes
     FROM services
     WHERE is_active = 1
     ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT id, name, description, duration_minutes
     FROM services
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { listActive, getById };
