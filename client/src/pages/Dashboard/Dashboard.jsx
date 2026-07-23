import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../../api/projects'
import { fetchAllTickets } from '../../api/tickets'
import { useAuth } from '../../context/AuthContext'
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts'

function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [projectsData, ticketsData] = await Promise.all([
        fetchProjects(),
        fetchAllTickets()
      ])
      setProjects(projectsData)
      setTickets(ticketsData)
    } catch (err) {
      console.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>

  const activeProjectsCount = projects.filter(p => p.has_active_sprint).length
  const openTicketsCount = tickets.filter(t => t.status !== 'done').length

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening across your projects.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{projects.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{activeProjectsCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Open Tickets</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{openTicketsCount}</p>
        </div>
      </div>

      {/* Analytics */}
      <AnalyticsCharts tickets={tickets} />

      {/* Recent Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p>No projects yet</p>
            <Link to="/projects" className="text-blue-600 text-sm hover:underline mt-2 block">
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {projects.slice(0, 5).map(project => (
              <div key={project.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{project.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
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