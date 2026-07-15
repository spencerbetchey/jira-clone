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
const { requireProjectRole } = require('../middleware/roleMiddleware')

router.use(authMiddleware)

//Anyone can view sprints
router.get('/', getSprints)

//Only admins and developers can create/edit/delete sprints
router.post('/', requireProjectRole('admin', 'developer'), createSprint)
router.put('/:id', requireProjectRole('admin', 'developer'), updateSprint)
router.delete('/:id', requireProjectRole('admin', 'developer'), deleteSprint)
router.post('/:id/assign', requireProjectRole('admin', 'developer'), assignTicketToSprint)

module.exports = router