const pool = require('../config/db')

const requireProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    const projectId = req.params.projectId || req.params.id

    try {
      //Check if user is the project owner
      const [project] = await pool.query(
        'SELECT owner_id FROM projects WHERE id = ?',
        [projectId]
      )

      if (project.length === 0) {
        return res.status(404).json({ message: 'Project not found' })
      }

      if (project[0].owner_id === req.userId) {
        return next()
      }

      //Check project member role
      const [member] = await pool.query(
        'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, req.userId]
      )

      if (member.length === 0) {
        return res.status(403).json({ message: 'You are not a member of this project' })
      }

      if (!allowedRoles.includes(member[0].role)) {
        return res.status(403).json({ message: 'You do not have permission to perform this action' })
      }

      req.userRole = member[0].role
      next()
    } catch (error) {
      console.error('Role check error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  }
}

module.exports = { requireProjectRole }