import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const projectsData = await fetchProjects()
      setProjects(projectsData)
    } catch (err) {
      console.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening across your projects.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Projects</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{projects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{projects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Team Members</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">1</p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No projects yet</p>
            <Link to="/projects" className="text-blue-600 text-sm hover:underline mt-2 block">
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.slice(0, 5).map(project => (
              <div key={project.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{project.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {project.description || 'No description'}
                  </p>
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard