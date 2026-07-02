const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

//Register a new user
const register = async (req, res) => {
  const { name, email, password } = req.body

  try {
    //Check if email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    //Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //Insert the new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    //Create a JWT (JSON Web Token)
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//Login an existing user
const login = async (req, res) => {
  const { email, password } = req.body

  try {
    //Find user by email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const user = rows[0]

    //Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    //Create a JWT (JSON Web Token)
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user: rows[0] })
  } catch (error) {
    console.error('GetMe error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { register, login, getMe }