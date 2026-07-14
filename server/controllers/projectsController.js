const pool = require('../config/db')

//Get all projects for the logged in user
const getProjects = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name as owner_name 
       FROM projects p
       JOIN users u ON p.owner_id = u.id
       WHERE p.owner_id = ? 
       OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
       ORDER BY p.created_at DESC`,
      [req.userId, req.userId]
    )

    res.json({ projects: rows })
  } catch (error) {
    console.error('GetProjects error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Get a single project by id
const getProject = async (req, res) => {
  const { id } = req.params

  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name as owner_name 
       FROM projects p
       JOIN users u ON p.owner_id = u.id
       WHERE p.id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json({ project: rows[0] })
  } catch (error) {
    console.error('GetProject error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Create a new project
const createProject = async (req, res) => {
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ message: 'Project name is required' })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
      [name, description, req.userId]
    )

    const [newProject] = await pool.query(
      `SELECT p.*, u.name as owner_name 
       FROM projects p
       JOIN users u ON p.owner_id = u.id
       WHERE p.id = ?`,
      [result.insertId]
    )

    //Add owner as a member with admin role
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, req.userId, 'admin']
    )

    res.status(201).json({ project: newProject[0] })
  } catch (error) {
    console.error('CreateProject error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Update a project
const updateProject = async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body

  try {
    const [existing] = await pool.query(
      'SELECT * FROM projects WHERE id = ? AND owner_id = ?',
      [id, req.userId]
    )

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Project not found or unauthorized' })
    }

    await pool.query(
      'UPDATE projects SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    )

    res.json({ message: 'Project updated successfully' })
  } catch (error) {
    console.error('UpdateProject error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Delete a project
const deleteProject = async (req, res) => {
  const { id } = req.params

  try {
    const [existing] = await pool.query(
      'SELECT * FROM projects WHERE id = ? AND owner_id = ?',
      [id, req.userId]
    )

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Project not found or unauthorized' })
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [id])

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('DeleteProject error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Get all members of a project
const getProjectMembers = async (req, res) => {
  const { id } = req.params

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.joined_at ASC`,
      [id]
    )

    res.json({ members: rows })
  } catch (error) {
    console.error('GetProjectMembers error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Add a member to a project by email
const addProjectMember = async (req, res) => {
  const { id } = req.params
  const { email, role } = req.body

  try {
    //Find user by email
    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: 'No user found with that email' })
    }

    const user = users[0]

    //Check if already a member
    const [existing] = await pool.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, user.id]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User is already a member of this project' })
    }

    //Add member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [id, user.id, role || 'developer']
    )

    res.status(201).json({
      message: 'Member added successfully',
      member: { ...user, role: role || 'developer' }
    })
  } catch (error) {
    console.error('AddProjectMember error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Remove a member from a project
const removeProjectMember = async (req, res) => {
  const { id, userId } = req.params

  try {
    await pool.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, userId]
    )

    res.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('RemoveProjectMember error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, getProjectMembers, addProjectMember, removeProjectMember }