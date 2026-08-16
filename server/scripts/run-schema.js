const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

async function runSchema() {
  const host = process.env.AIVEN_HOST
  const port = process.env.AIVEN_PORT
  const user = process.env.AIVEN_USER
  const password = process.env.AIVEN_PASSWORD
  const database = process.env.AIVEN_DB

  if (!host || !port || !user || !password || !database) {
    console.error('Missing one or more required env vars: AIVEN_HOST, AIVEN_PORT, AIVEN_USER, AIVEN_PASSWORD, AIVEN_DB')
    process.exit(1)
  }

  const schemaPath = path.join(__dirname, '..', '..', 'schema_prod.sql')
  const schemaSql = fs.readFileSync(schemaPath, 'utf8')

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: {
      ca: fs.readFileSync(path.join(__dirname, '..', 'config', 'aiven-ca.pem')),
    },
    multipleStatements: true,
  })

  console.log('Connected to Aiven. Running schema...')

  try {
    await connection.query(schemaSql)
    console.log('Schema applied successfully!')

    const [tables] = await connection.query('SHOW TABLES')
    console.log('Tables created:', tables.map(row => Object.values(row)[0]))
  } catch (error) {
    console.error('Error running schema:', error.message)
  } finally {
    await connection.end()
  }
}

runSchema()