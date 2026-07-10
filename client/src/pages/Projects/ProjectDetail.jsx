import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchProject, deleteProject, updateProject } from '../../api/projects'
import { fetchTickets, createTicket, updateTicket } from '../../api/tickets'
import KanbanBoard from '../../components/tickets/KanbanBoard'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState('kanban')
  const [filters, setFilters] = useState({
    priority: 'all',
    type: 'all',
    assignee: 'all'
  })
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'task'
  })
  const [editProject, setEditProject] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [projectData, ticketsData] = await Promise.all([
        fetchProject(id),
        fetchTickets(id)
      ])
      setProject(projectData)
      setTickets(ticketsData)
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

  const handleEditOpen = () => {
    setEditProject({ name: project.name, description: project.description || '' })
    setShowEditModal(true)
  }

  const handleEditSave = async () => {
    if (!editProject.name.trim()) return
    setSaving(true)
    try {
      await updateProject(id, editProject)
      setProject({ ...project, ...editProject })
      setShowEditModal(false)
    } catch (err) {
      setError('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicket.title.trim()) return
    setCreating(true)
    try {
      const created = await createTicket(id, newTicket)
      setTickets([created, ...tickets])
      setNewTicket({ title: '', description: '', priority: 'medium', type: 'task' })
      setShowTicketModal(false)
    } catch (err) {
      setError('Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  const handleTicketMove = async (ticketId, newStatus) => {
    setTickets(tickets.map(t =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    ))
    try {
      await updateTicket(id, ticketId, { status: newStatus })
    } catch (err) {
      setError('Failed to update ticket status')
      loadData()
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      lowest: 'bg-gray-100 text-gray-600',
      low: 'bg-blue-100 text-blue-600',
      medium: 'bg-yellow-100 text-yellow-600',
      high: 'bg-orange-100 text-orange-600',
      highest: 'bg-red-100 text-red-600'
    }
    return colors[priority] || 'bg-gray-100 text-gray-600'
  }

  const getTypeColor = (type) => {
    const colors = {
      bug: 'bg-red-100 text-red-600',
      feature: 'bg-purple-100 text-purple-600',
      improvement: 'bg-blue-100 text-blue-600',
      task: 'bg-gray-100 text-gray-600'
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
  }

  if (loading) return <div className="text-gray-500">Loading project...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!project) return null

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false
      if (filters.type !== 'all' && ticket.type !== filters.type) return false
      if (filters.assignee !== 'all') {
        if (filters.assignee === 'unassigned' && ticket.assignee_id) return false
        if (filters.assignee === 'assigned' && !ticket.assignee_id) return false
      }
      return true
    })
  }

  return (
    <div>
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
              <span className="text-xs text-gray-400">Owner: {project.owner_name}</span>
              <span className="text-xs text-gray-400">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEditOpen}
              className="text-sm text-blue-500 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
            >
              Edit Project
            </button>
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Tickets <span className="text-gray-400 font-normal text-sm">({tickets.length})</span>
              </h2>
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  List
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + New Ticket
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Filter:</span>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="lowest">Lowest</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="highest">Highest</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="improvement">Improvement</option>
            </select>

            <select
              value={filters.assignee}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assignees</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>

            {(filters.priority !== 'all' || filters.type !== 'all' || filters.assignee !== 'all') && (
              <button
                onClick={() => setFilters({ priority: 'all', type: 'all', assignee: 'all' })}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No tickets yet</p>
            <p className="text-sm mt-1">Create your first ticket to get started</p>
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard
            tickets={getFilteredTickets()}
            onTicketMove={handleTicketMove}
            projectId={id}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {getFilteredTickets().map(ticket => (
              <Link
                key={ticket.id}
                to={`/projects/${id}/tickets/${ticket.id}`}
                className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(ticket.type)}`}>
                    {ticket.type}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{ticket.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{ticket.status.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400">{ticket.reporter_name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add more details..."
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lowest">Lowest</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="highest">Highest</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newTicket.type}
                    onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="task">Task</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                    <option value="improvement">Improvement</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={creating}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail