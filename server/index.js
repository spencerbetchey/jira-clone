const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const pool = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const ticketRoutes = require('./routes/ticketRoutes')
const sprintRoutes = require('./routes/sprintRoutes')
const commentRoutes = require('./routes/commentRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

//Only these origins are allowed to make requests to this API
const allowedOrigins = [
  'http://localhost:5173',
  'https://jira-clone-rho-inky.vercel.app',
]

app.use(cors({
  origin: (origin, callback) => {
    //Allow requests with no origin 
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
app.use(express.json())

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectId/tickets', ticketRoutes)
app.use('/api/projects/:projectId/sprints', sprintRoutes)
app.use('/api/tickets/:ticketId/comments', commentRoutes)
app.use('/api/tickets', require('./routes/globalTicketRoutes'))
app.use('/api/notifications', notificationRoutes)

//Test route
app.get('/', (req, res) => {
  res.json({ message: 'ProjectFlow API is running!' })
})

//Health check: actually queries the database, used by the external cron service
//to keep both this server and the database from spinning down on the free tier
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (error) {
    console.error('Health check failed:', error.message)
    res.status(500).json({ status: 'error' })
  }
})

//Start server and test DB connection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  pool.query('SELECT 1')
    .then(() => console.log('MySQL connected successfully!'))
    .catch((err) => console.error('MySQL connection failed:', err.message))
})