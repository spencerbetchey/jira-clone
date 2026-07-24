import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function Navbar() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="bg-blue-600 dark:bg-gray-800 text-white transition-colors relative">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold">
          <Link to="/dashboard" onClick={closeMenu}>ProjectFlow</Link>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/dashboard" className="hover:text-blue-200 text-sm">Dashboard</Link>
          <Link to="/projects" className="hover:text-blue-200 text-sm">Projects</Link>
          <Link to="/tickets" className="hover:text-blue-200 text-sm">Tickets</Link>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
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

        {/* Mobile: dark mode toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="text-white text-lg"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 dark:bg-gray-900 px-6 py-4 flex flex-col gap-4 border-t border-blue-500 dark:border-gray-700">
          <Link to="/dashboard" onClick={closeMenu} className="text-sm hover:text-blue-200">Dashboard</Link>
          <Link to="/projects" onClick={closeMenu} className="text-sm hover:text-blue-200">Projects</Link>
          <Link to="/tickets" onClick={closeMenu} className="text-sm hover:text-blue-200">Tickets</Link>
          {user && (
            <Link to="/profile" onClick={closeMenu} className="text-sm text-blue-100 hover:text-white">
              Hey, {user.name}!
            </Link>
          )}
          <button
            onClick={() => { closeMenu(); handleLogout() }}
            className="bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-left"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar