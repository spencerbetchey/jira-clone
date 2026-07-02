import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-bold">
        <Link to="/dashboard">ProjectFlow</Link>
      </div>

      <div className="flex gap-6 items-center">
        <Link to="/dashboard" className="hover:text-blue-200 text-sm">Dashboard</Link>
        <Link to="/projects" className="hover:text-blue-200 text-sm">Projects</Link>
        <Link to="/tickets" className="hover:text-blue-200 text-sm">Tickets</Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-blue-100">
            Hey, {user.name}!
          </span>
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