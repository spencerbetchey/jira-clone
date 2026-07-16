const pool = require('../config/db')

//Get all comments for a ticket
const getComments = async (req, res) => {
  const { ticketId } = req.params

  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.ticket_id = ?
       ORDER BY c.created_at ASC`,
      [ticketId]
    )

    res.json({ comments: rows })
  } catch (error) {
    console.error('GetComments error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Create a comment
const createComment = async (req, res) => {
  const { ticketId } = req.params
  const { body } = req.body

  if (!body || !body.trim()) {
    return res.status(400).json({ message: 'Comment body is required' })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO comments (ticket_id, user_id, body) VALUES (?, ?, ?)',
      [ticketId, req.userId, body]
    )

    const [newComment] = await pool.query(
      `SELECT c.*, u.name as user_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    )

    res.status(201).json({ comment: newComment[0] })
  } catch (error) {
    console.error('CreateComment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Delete a comment
const deleteComment = async (req, res) => {
  const { id } = req.params

  try {
    const [existing] = await pool.query(
      'SELECT * FROM comments WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' })
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [id])

    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('DeleteComment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getComments, createComment, deleteComment }