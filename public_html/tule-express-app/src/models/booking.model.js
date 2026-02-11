const { pool } = require("../config/db");

async function createReservation(data) {
  const insert = `
    INSERT INTO reservations
      (code, service_id, customer_name, customer_phone, customer_email, people_count, notes,
       requested_start_utc, requested_end_utc, status)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL ? MINUTE), 'PENDING')
  `;

  const params = [
    data.code,
    data.service_id,
    data.customer_name,
    data.customer_phone,
    data.customer_email,
    data.people_count,
    data.notes,
    data.requested_start_utc,
    data.requested_start_utc,
    data.duration_minutes
  ];

  const [result] = await pool.query(insert, params);

  await pool.query(
    `INSERT INTO reservation_status_history
      (reservation_id, old_status, new_status, note_internal, changed_by_admin_id)
     VALUES (?, NULL, 'PENDING', 'Creada por cliente', NULL)`,
    [result.insertId]
  );

  return result.insertId;
}

async function getByCode(code) {
  const [rows] = await pool.query(
    `SELECT * FROM reservations WHERE code = ? LIMIT 1`,
    [code]
  );
  return rows[0] || null;
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM reservations WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function listReservations({ status }) {
  const [rows] = await pool.query(
    `SELECT id, code, service_id, customer_name, customer_phone, customer_email,
            people_count, requested_start_utc, status, created_at
     FROM reservations
     WHERE status = ?
     ORDER BY created_at DESC
     LIMIT 200`,
    [status]
  );
  return rows;
}

async function getStats() {
  const [rows] = await pool.query(`
    SELECT
      SUM(status='PENDING') AS pending,
      SUM(status='ACCEPTED') AS accepted,
      SUM(status='REJECTED') AS rejected,
      SUM(status='CANCELLED') AS cancelled
    FROM reservations
  `);
  return rows[0] || { pending: 0, accepted: 0, rejected: 0, cancelled: 0 };
}

module.exports = {
  createReservation,
  getByCode,
  getById,
  listReservations,
  getStats
};
