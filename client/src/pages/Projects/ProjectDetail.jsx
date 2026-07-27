import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchTickets, createTicket, updateTicket } from '../../api/tickets'
import KanbanBoard from '../../components/tickets/KanbanBoard'
import { fetchSprints } from '../../api/sprints'
import SprintPanel from '../../components/tickets/SprintPanel'
import MembersPanel from '../../components/layout/MembersPanel'
import { fetchProject, deleteProject, updateProject, fetchMyProjectRole, fetchProjectMembers } from '../../api/projects'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tickets, setTickets] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState('kanban')
  const [sprints, setSprints] = useState([])
  const [myRole, setMyRole] = useState('admin')
  const [filters, setFilters] = useState({
    priority: 'all',
    type: 'all',
    assignee: 'all'
  })
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'task',
    assignee_id: ''
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
    const [projectData, ticketsData, sprintsData, roleData, membersData] = await Promise.all([
      fetchProject(id),
      fetchTickets(id),
      fetchSprints(id),
      fetchMyProjectRole(id),
      fetchProjectMembers(id)
    ])
    setProject(projectData)
    setTickets(ticketsData)
    setSprints(sprintsData)
    setMyRole(roleData)
    setMembers(membersData)
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
      const payload = { ...newTicket, assignee_id: newTicket.assignee_id || null }
      const created = await createTicket(id, payload)
      setTickets([created, ...tickets])
      setNewTicket({ title: '', description: '', priority: 'medium', type: 'task', assignee_id: '' })
      setShowTicketModal(false)
    } catch (err) {
      setError('Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  const handleTicketMove = async (ticketId, newStatus) => {
  if (myRole === 'viewer') return
  
  setTickets(tickets.map(t =>
    t.id === ticketId ? { ...t, status: newStatus } : t
  ))
  try {
    await updateTicket(id, ticketId, { status: newStatus })
  } catch (err) {
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
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 mb-6"
      >
        ← Back to Projects
      </Link>

      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{project.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{project.description || 'No description'}</p>
            <div className="flex gap-4 mt-3">
              <span className="text-xs text-gray-400 dark:text-gray-500">Owner: {project.owner_name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {myRole === 'admin' && (
              <button
                onClick={handleEditOpen}
                className="text-sm text-blue-500 hover:text-blue-700 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              >
                Edit Project
              </button>
            )}
            {myRole === 'admin' && (
              <button
                onClick={handleDelete}
                className="text-sm text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                Delete Project
              </button>
            )}
          </div>
        </div>
      </div>

      <MembersPanel
        projectId={id}
        ownerId={project.owner_id}
        myRole={myRole}
      />

      <SprintPanel
        sprints={sprints}
        setSprints={setSprints}
        tickets={tickets}
        setTickets={setTickets}
        projectId={id}
        myRole={myRole}
      />

      {/* Tickets Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Tickets <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">({tickets.length})</span>
              </h2>
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                <button
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  List
                </button>
              </div>
            </div>
            {(myRole === 'admin' || myRole === 'developer') && (
              <button
                onClick={() => setShowTicketModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + New Ticket
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Filter:</span>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700 rounded-md px-2 py-1 text-xs text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700 rounded-md px-2 py-1 text-xs text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700 rounded-md px-2 py-1 text-xs text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
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
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {getFilteredTickets().map(ticket => (
              <Link
                key={ticket.id}
                to={`/projects/${id}/tickets/${ticket.id}`}
                className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(ticket.type)}`}>
                    {ticket.type}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{ticket.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{ticket.status.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{ticket.reporter_name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Project Name</label>
                <input
                  type="text"
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                <textarea
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Create New Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add more details..."
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lowest">Lowest</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="highest">Highest</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Type</label>
                  <select
                    value={newTicket.type}
                    onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="task">Task</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                    <option value="improvement">Improvement</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Assignee</label>
                <select
                  value={newTicket.assignee_id}
                  onChange={(e) => setNewTicket({ ...newTicket, assignee_id: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
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