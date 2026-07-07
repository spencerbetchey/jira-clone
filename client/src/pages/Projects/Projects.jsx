import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects, createProject, deleteProject } from '../../api/projects'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch (err) {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newProject.name.trim()) return
    setCreating(true)

    try {
      const created = await createProject(newProject)
      setProjects([created, ...projects])
      setNewProject({ name: '', description: '' })
      setShowModal(false)
    } catch (err) {
      setError('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      await deleteProject(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch (err) {
      setError('Failed to delete project')
    }
  }

  if (loading) return <div className="text-gray-500">Loading projects...</div>

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No projects yet</p>
          <p className="text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-gray-800">{project.name}</h2>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-1 mb-4">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My awesome project"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this project about?"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects