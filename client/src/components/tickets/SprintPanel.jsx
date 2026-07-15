import { useState } from 'react'
import { createSprint, updateSprint, deleteSprint, assignTicketToSprint } from '../../api/sprints'

const STATUS_COLORS = {
  planning: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-600',
  completed: 'bg-blue-100 text-blue-600',
}

function SprintPanel({ sprints, setSprints, tickets, setTickets, projectId, myRole }) {
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newSprint, setNewSprint] = useState({ name: '', start_date: '', end_date: '' })
  const [expandedSprint, setExpandedSprint] = useState(null)

  const handleCreate = async () => {
    if (!newSprint.name.trim()) return
    setCreating(true)
    try {
      const created = await createSprint(projectId, newSprint)
      setSprints([created, ...sprints])
      setNewSprint({ name: '', start_date: '', end_date: '' })
      setShowModal(false)
    } catch (err) {
      console.error('Failed to create sprint')
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (sprint, newStatus) => {
    try {
      await updateSprint(projectId, sprint.id, { ...sprint, status: newStatus })
      setSprints(sprints.map(s => s.id === sprint.id ? { ...s, status: newStatus } : s))
    } catch (err) {
      console.error('Failed to update sprint')
    }
  }

  const handleDelete = async (sprintId) => {
    if (!window.confirm('Are you sure you want to delete this sprint?')) return
    try {
      await deleteSprint(projectId, sprintId)
      setSprints(sprints.filter(s => s.id !== sprintId))
    } catch (err) {
      console.error('Failed to delete sprint')
    }
  }

  const handleAssignTicket = async (sprintId, ticketId) => {
    try {
      await assignTicketToSprint(projectId, sprintId, ticketId)
      setTickets(tickets.map(t =>
        t.id === ticketId ? { ...t, sprint_id: sprintId } : t
      ))
      setSprints(sprints.map(s =>
        s.id === sprintId ? { ...s, ticket_count: s.ticket_count + 1 } : s
      ))
    } catch (err) {
      console.error('Failed to assign ticket')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Sprints</h2>
        {(myRole === 'admin' || myRole === 'developer') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Sprint
          </button>
        )}
      </div>

      {sprints.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No sprints yet</p>
          <p className="text-sm mt-1">Create a sprint to start planning your work</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sprints.map(sprint => (
            <div key={sprint.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Sprint Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedSprint(expandedSprint === sprint.id ? null : sprint.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedSprint === sprint.id ? '▼' : '▶'}
                  </button>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{sprint.name}</h3>
                    {sprint.start_date && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(sprint.start_date).toLocaleDateString()} — {new Date(sprint.end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[sprint.status]}`}>
                    {sprint.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {sprint.ticket_count} tickets
                  </span>
                </div>
                {(myRole === 'admin' || myRole === 'developer') && (
                  <div className="flex items-center gap-2">
                    <select
                      value={sprint.status}
                      onChange={(e) => handleStatusChange(sprint, e.target.value)}
                      className="border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 focus:outline-none"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(sprint.id)}
                      className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Sprint Tickets */}
              {expandedSprint === sprint.id && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Assign tickets to this sprint:</p>
                  <div className="space-y-2">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-700">{ticket.title}</span>
                        {(myRole === 'admin' || myRole === 'developer') && (
                          <button
                            onClick={() => handleAssignTicket(sprint.id, ticket.id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {ticket.sprint_id === sprint.id ? '✓ Assigned' : 'Assign'}
                          </button>
                        )}
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <p className="text-xs text-gray-400">No tickets in this project yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Sprint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Sprint</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Name</label>
                <input
                  type="text"
                  value={newSprint.name}
                  onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sprint 1"
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newSprint.start_date}
                    onChange={(e) => setNewSprint({ ...newSprint, start_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newSprint.end_date}
                    onChange={(e) => setNewSprint({ ...newSprint, end_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                {creating ? 'Creating...' : 'Create Sprint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SprintPanel