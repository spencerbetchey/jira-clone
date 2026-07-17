const express = require('express')
const router = express.Router()
const { getAllTickets, getTicketHistory } = require('../controllers/ticketsController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)
router.get('/', getAllTickets)
router.get('/:ticketId/history', getTicketHistory)

module.exports = router