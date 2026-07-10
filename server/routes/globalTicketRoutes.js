const express = require('express')
const router = express.Router()
const { getAllTickets } = require('../controllers/ticketsController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)
router.get('/', getAllTickets)

module.exports = router