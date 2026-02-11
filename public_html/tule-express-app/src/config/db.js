const mysql = require("mysql2/promise");
const session = require("express-session");
const MySQLStoreFactory = require("express-mysql-session");
const { env } = require("./env");

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z"
});

function createSessionStore() {
  const MySQLStore = MySQLStoreFactory(session);
  return new MySQLStore(
    {
      clearExpired: true,
      checkExpirationInterval: 15 * 60 * 1000,
      expiration: 7 * 24 * 60 * 60 * 1000,
      createDatabaseTable: false
    },
    pool
  );
}

module.exports = { pool, createSessionStore };
