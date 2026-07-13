const pool = require('../config/db')

//Get all sprints for a project
const getSprints = async (req, res) => {
  const { projectId } = req.params

  try {
    const [rows] = await pool.query(
      `SELECT s.*, 
        COUNT(t.id) as ticket_count
       FROM sprints s
       LEFT JOIN tickets t ON t.sprint_id = s.id
       WHERE s.project_id = ?
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [projectId]
    )

    res.json({ sprints: rows })
  } catch (error) {
    console.error('GetSprints error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Create a sprint
const createSprint = async (req, res) => {
  const { projectId } = req.params
  const { name, start_date, end_date } = req.body

  if (!name) {
    return res.status(400).json({ message: 'Sprint name is required' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO sprints (project_id, name, start_date, end_date)
       VALUES (?, ?, ?, ?)`,
      [projectId, name, start_date || null, end_date || null]
    )

    const [newSprint] = await pool.query(
      'SELECT * FROM sprints WHERE id = ?',
      [result.insertId]
    )

    res.status(201).json({ sprint: newSprint[0] })
  } catch (error) {
    console.error('CreateSprint error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Update a sprint
const updateSprint = async (req, res) => {
  const { id } = req.params
  const { name, status, start_date, end_date } = req.body

  try {
    const [existing] = await pool.query(
      'SELECT * FROM sprints WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Sprint not found' })
    }

    const sprint = existing[0]

    await pool.query(
      `UPDATE sprints SET name = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?`,
      [
        name || sprint.name,
        status || sprint.status,
        start_date || sprint.start_date,
        end_date || sprint.end_date,
        id
      ]
    )

    res.json({ message: 'Sprint updated successfully' })
  } catch (error) {
    console.error('UpdateSprint error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Delete a sprint
const deleteSprint = async (req, res) => {
  const { id } = req.params

  try {
    const [existing] = await pool.query(
      'SELECT * FROM sprints WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Sprint not found' })
    }

    await pool.query('DELETE FROM sprints WHERE id = ?', [id])

    res.json({ message: 'Sprint deleted successfully' })
  } catch (error) {
    console.error('DeleteSprint error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Assign a ticket to a sprint
const assignTicketToSprint = async (req, res) => {
  const { id } = req.params
  const { ticketId } = req.body

  try {
    await pool.query(
      'UPDATE tickets SET sprint_id = ? WHERE id = ?',
      [id, ticketId]
    )

    res.json({ message: 'Ticket assigned to sprint successfully' })
  } catch (error) {
    console.error('AssignTicket error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getSprints, createSprint, updateSprint, deleteSprint, assignTicketToSprint }