const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const pool = require('./config/db')
const authRoutes = require('./routes/authRoutes')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

//Middleware
app.use(cors())
app.use(express.json())

//Routes
app.use('/api/auth', authRoutes)

//Test route
app.get('/', (req, res) => {
  res.json({ message: 'ProjectFlow API is running!' })
})

//Start server and test DB connection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  pool.query('SELECT 1')
    .then(() => console.log('MySQL connected successfully!'))
    .catch((err) => console.error('MySQL connection failed:', err.message))
})