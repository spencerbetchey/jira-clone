const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  getAllTickets
} = require('../controllers/ticketsController')
const authMiddleware = require('../middleware/authMiddleware')
const { requireProjectRole } = require('../middleware/roleMiddleware')

router.use(authMiddleware)

//Anyone can view tickets
router.get('/', getTickets)
router.get('/:id', getTicket)

//Only admins and developers can create/edit/delete tickets
router.post('/', requireProjectRole('admin', 'developer'), createTicket)
router.put('/:id', requireProjectRole('admin', 'developer'), updateTicket)
router.delete('/:id', requireProjectRole('admin', 'developer'), deleteTicket)

module.exports = router