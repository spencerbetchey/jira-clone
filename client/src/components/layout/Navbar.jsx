import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function Navbar() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 dark:bg-gray-800 text-white px-6 py-4 flex items-center justify-between transition-colors">
      <div className="text-xl font-bold">
        <Link to="/dashboard">ProjectFlow</Link>
      </div>

      <div className="flex gap-6 items-center">
        <Link to="/dashboard" className="hover:text-blue-200 text-sm">Dashboard</Link>
        <Link to="/projects" className="hover:text-blue-200 text-sm">Projects</Link>
        <Link to="/tickets" className="hover:text-blue-200 text-sm">Tickets</Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="text-white hover:text-blue-200 transition-colors text-lg"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        {user && (
          <Link to="/profile" className="text-sm text-blue-100 hover:text-white transition-colors">
            Hey, {user.name}!
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 text-sm font-medium px-4 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar