const { pool } = require("../config/db");

async function findByIdentifier(identifier) {
  const sql = `
    SELECT id, username, email, password_hash, is_active
    FROM admin_users
    WHERE username = ? OR email = ?
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [identifier, identifier]);
  return rows[0] || null;
}

module.exports = { findByIdentifier };
