const express = require('express')
const router = express.Router()
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectsController')
const authMiddleware = require('../middleware/authMiddleware')

//All project routes require authentication
router.use(authMiddleware)

router.get('/', getProjects)
router.get('/:id', getProject)
router.post('/', createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

module.exports = router