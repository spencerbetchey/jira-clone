const pool = require('../config/db')

//Get all notifications for the logged in user
const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [req.userId]
    )

    res.json({ notifications: rows })
  } catch (error) {
    console.error('GetNotifications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Mark a single notification as read
const markAsRead = async (req, res) => {
  const { id } = req.params

  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('MarkAsRead error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Mark all notifications as read for the logged in user
const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.userId]
    )

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('MarkAllAsRead error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead }