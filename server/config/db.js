const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

dotenv.config()

const useSSL = process.env.DB_SSL === 'true'

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ...(useSSL && {
    ssl: {
      ca: fs.readFileSync(path.join(__dirname, 'aiven-ca.pem')),
    },
  }),
})

module.exports = pool