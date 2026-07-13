const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
  assignTicketToSprint
} = require('../controllers/sprintsController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)

router.get('/', getSprints)
router.post('/', createSprint)
router.put('/:id', updateSprint)
router.delete('/:id', deleteSprint)
router.post('/:id/assign', assignTicketToSprint)

module.exports = router