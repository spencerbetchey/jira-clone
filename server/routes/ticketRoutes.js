const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketsController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)

router.get('/', getTickets)
router.post('/', createTicket)
router.get('/:id', getTicket)
router.put('/:id', updateTicket)
router.delete('/:id', deleteTicket)

module.exports = router