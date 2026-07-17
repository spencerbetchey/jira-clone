const pool = require('../config/db')

//Get all tickets for a project
const getTickets = async (req, res) => {
  const { projectId } = req.params

  try {
    const [rows] = await pool.query(
      `SELECT t.*, 
        u1.name as reporter_name,
        u2.name as assignee_name
       FROM tickets t
       JOIN users u1 ON t.reporter_id = u1.id
       LEFT JOIN users u2 ON t.assignee_id = u2.id
       WHERE t.project_id = ?
       ORDER BY t.created_at DESC`,
      [projectId]
    )

    res.json({ tickets: rows })
  } catch (error) {
    console.error('GetTickets error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Get a single ticket
const getTicket = async (req, res) => {
  const { id } = req.params

  try {
    const [rows] = await pool.query(
      `SELECT t.*,
        u1.name as reporter_name,
        u2.name as assignee_name
       FROM tickets t
       JOIN users u1 ON t.reporter_id = u1.id
       LEFT JOIN users u2 ON t.assignee_id = u2.id
       WHERE t.id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    res.json({ ticket: rows[0] })
  } catch (error) {
    console.error('GetTicket error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Create a ticket
const createTicket = async (req, res) => {
  const { projectId } = req.params
  const { title, description, priority, type, assignee_id } = req.body

  if (!title) {
    return res.status(400).json({ message: 'Ticket title is required' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO tickets (title, description, priority, type, project_id, reporter_id, assignee_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, priority || 'medium', type || 'task', projectId, req.userId, assignee_id || null]
    )

    const [newTicket] = await pool.query(
      `SELECT t.*,
        u1.name as reporter_name,
        u2.name as assignee_name
       FROM tickets t
       JOIN users u1 ON t.reporter_id = u1.id
       LEFT JOIN users u2 ON t.assignee_id = u2.id
       WHERE t.id = ?`,
      [result.insertId]
    )

    //Log ticket creation in history
    await pool.query(
      `INSERT INTO ticket_history (ticket_id, user_id, field_changed, old_value, new_value)
       VALUES (?, ?, ?, ?, ?)`,
      [result.insertId, req.userId, 'status', null, 'todo']
    )

    res.status(201).json({ ticket: newTicket[0] })
  } catch (error) {
    console.error('CreateTicket error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Update a ticket
const updateTicket = async (req, res) => {
  const { id } = req.params
  const { title, description, status, priority, type, assignee_id } = req.body

  try {
    const [existing] = await pool.query(
      'SELECT * FROM tickets WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    const ticket = existing[0]

    //Log status change in history if status changed
    if (status && status !== ticket.status) {
      await pool.query(
        `INSERT INTO ticket_history (ticket_id, user_id, field_changed, old_value, new_value)
         VALUES (?, ?, ?, ?, ?)`,
        [id, req.userId, 'status', ticket.status, status]
      )
    }

    await pool.query(
      `UPDATE tickets 
       SET title = ?, description = ?, status = ?, priority = ?, type = ?, assignee_id = ?
       WHERE id = ?`,
      [
        title || ticket.title,
        description || ticket.description,
        status || ticket.status,
        priority || ticket.priority,
        type || ticket.type,
        assignee_id || ticket.assignee_id,
        id
      ]
    )

    res.json({ message: 'Ticket updated successfully' })
  } catch (error) {
    console.error('UpdateTicket error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Delete a ticket
const deleteTicket = async (req, res) => {
  const { id } = req.params

  try {
    const [existing] = await pool.query(
      'SELECT * FROM tickets WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    await pool.query('DELETE FROM tickets WHERE id = ?', [id])

    res.json({ message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('DeleteTicket error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Get all tickets across all projects for the logged in user
const getAllTickets = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, 
        p.name as project_name,
        u1.name as reporter_name,
        u2.name as assignee_name
       FROM tickets t
       JOIN projects p ON t.project_id = p.id
       JOIN users u1 ON t.reporter_id = u1.id
       LEFT JOIN users u2 ON t.assignee_id = u2.id
       WHERE p.owner_id = ?
       OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
       ORDER BY t.created_at DESC`,
      [req.userId, req.userId]
    )

    res.json({ tickets: rows })
  } catch (error) {
    console.error('GetAllTickets error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Get history/activity log for a ticket
const getTicketHistory = async (req, res) => {
  const { ticketId } = req.params

  try {
    const [rows] = await pool.query(
      `SELECT th.*, u.name as user_name
       FROM ticket_history th
       JOIN users u ON th.user_id = u.id
       WHERE th.ticket_id = ?
       ORDER BY th.changed_at DESC`,
      [ticketId]
    )

    res.json({ history: rows })
  } catch (error) {
    console.error('GetTicketHistory error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getTickets, getTicket, createTicket, updateTicket, deleteTicket, getAllTickets, getTicketHistory }