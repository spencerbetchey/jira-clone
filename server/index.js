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

//Middleware
app.use(cors())
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

//Start server and test DB connection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  pool.query('SELECT 1')
    .then(() => console.log('MySQL connected successfully!'))
    .catch((err) => console.error('MySQL connection failed:', err.message))
})

//July 30th: Deployed backend server to Render
//August 16th: Connected deployed backend to production Aiven database
//August 16th: Deployed site frontend through Vercel, connected to deployed backend server and database. Site is now fully functional and deployed.