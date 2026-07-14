const express = require('express')
const router = express.Router()
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember
} = require('../controllers/projectsController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)

router.get('/', getProjects)
router.get('/:id', getProject)
router.post('/', createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

// Member routes
router.get('/:id/members', getProjectMembers)
router.post('/:id/members', addProjectMember)
router.delete('/:id/members/:userId', removeProjectMember)

module.exports = router