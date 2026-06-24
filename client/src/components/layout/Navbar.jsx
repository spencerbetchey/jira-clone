import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-bold">
        <Link to="/dashboard">ProjectFlow</Link>
      </div>
      <div className="flex gap-6">
        <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
        <Link to="/projects" className="hover:text-blue-200">Projects</Link>
        <Link to="/tickets" className="hover:text-blue-200">Tickets</Link>
      </div>
    </nav>
  )
}

export default Navbar