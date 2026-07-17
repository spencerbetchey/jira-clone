import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchTicket, deleteTicket, updateTicket } from '../../api/tickets'
import { fetchMyProjectRole } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import CommentSection from '../../components/tickets/CommentSection'
import TicketHistory from '../../components/tickets/TicketHistory'

function TicketDetail() {
  const { projectId, ticketId } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editTicket, setEditTicket] = useState({})
  const [myRole, setMyRole] = useState('viewer')

  useEffect(() => {
    loadTicket()
  }, [ticketId])

  const loadTicket = async () => {
    try {
      const data = await fetchTicket(projectId, ticketId)
      setTicket(data)
      const role = await fetchMyProjectRole(projectId)
      setMyRole(role)
    } catch (err) {
      setError('Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleEditOpen = () => {
    setEditTicket({
      title: ticket.title,
      description: ticket.description || '',
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type
    })
    setShowEditModal(true)
  }

  const handleEditSave = async () => {
    if (!editTicket.title.trim()) return
    setSaving(true)
    try {
      await updateTicket(projectId, ticketId, editTicket)
      setTicket({ ...ticket, ...editTicket })
      setShowEditModal(false)
    } catch (err) {
      setError('Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return
    try {
      await deleteTicket(projectId, ticketId)
      navigate(`/projects/${projectId}`)
    } catch (err) {
      setError('Failed to delete ticket')
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

  const getStatusColor = (status) => {
    const colors = {
      backlog: 'bg-gray-100 text-gray-600',
      todo: 'bg-blue-100 text-blue-600',
      in_progress: 'bg-yellow-100 text-yellow-600',
      in_review: 'bg-purple-100 text-purple-600',
      done: 'bg-green-100 text-green-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  if (loading) return <div className="text-gray-500">Loading ticket...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!ticket) return null

  return (
    <div>
      <Link
        to={`/projects/${projectId}`}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← Back to Project
      </Link>

      {/* Ticket Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(ticket.type)}`}>
                {ticket.type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{ticket.title}</h1>
            <p className="text-gray-500 mt-2">{ticket.description || 'No description'}</p>
            <div className="flex gap-4 mt-3">
              <span className="text-xs text-gray-400">Reporter: {ticket.reporter_name}</span>
              <span className="text-xs text-gray-400">
                Assignee: {ticket.assignee_name || 'Unassigned'}
              </span>
              <span className="text-xs text-gray-400">
                Created: {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          {(myRole === 'admin' || myRole === 'developer') && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleEditOpen}
                className="text-sm text-blue-500 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <CommentSection ticketId={ticketId} />
      <TicketHistory ticketId={ticketId} />

      {/* Edit Ticket Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTicket.title}
                  onChange={(e) => setEditTicket({ ...editTicket, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editTicket.description}
                  onChange={(e) => setEditTicket({ ...editTicket, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editTicket.status}
                    onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editTicket.priority}
                    onChange={(e) => setEditTicket({ ...editTicket, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lowest">Lowest</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="highest">Highest</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editTicket.type}
                  onChange={(e) => setEditTicket({ ...editTicket, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="improvement">Improvement</option>
                </select>
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
    </div>
  )
}

export default TicketDetail