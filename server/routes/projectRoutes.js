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
const { requireProjectRole } = require('../middleware/roleMiddleware')

router.use(authMiddleware)

//Project CRUD
router.get('/', getProjects)
router.get('/:id', getProject)
router.post('/', createProject)
router.put('/:id', requireProjectRole('admin'), updateProject)
router.delete('/:id', requireProjectRole('admin'), deleteProject)

//Member routes
router.get('/:id/members', getProjectMembers)
router.post('/:id/members', requireProjectRole('admin'), addProjectMember)
router.delete('/:id/members/:userId', requireProjectRole('admin'), removeProjectMember)

module.exports = router