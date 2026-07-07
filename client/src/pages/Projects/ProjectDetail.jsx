import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchProject, deleteProject } from '../../api/projects'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProject()
  }, [id])

  const loadProject = async () => {
    try {
      const data = await fetchProject(id)
      setProject(data)
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      await deleteProject(id)
      navigate('/projects')
    } catch (err) {
      setError('Failed to delete project')
    }
  }

  if (loading) return <div className="text-gray-500">Loading project...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!project) return null

  return (
    <div>
      {/* Back button */}
      <Link
        to="/projects"
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← Back to Projects
      </Link>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-500 mt-1">{project.description || 'No description'}</p>
            <div className="flex gap-4 mt-3">
              <span className="text-xs text-gray-400">
                Owner: {project.owner_name}
              </span>
              <span className="text-xs text-gray-400">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Tickets</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Ticket
          </button>
        </div>
        <div className="text-center py-12 text-gray-400">
          <p>No tickets yet</p>
          <p className="text-sm mt-1">Create your first ticket to get started</p>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail