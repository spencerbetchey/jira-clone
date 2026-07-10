import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllTickets } from '../../api/tickets'

const PRIORITY_COLORS = {
  lowest: 'bg-gray-100 text-gray-600',
  low: 'bg-blue-100 text-blue-600',
  medium: 'bg-yellow-100 text-yellow-600',
  high: 'bg-orange-100 text-orange-600',
  highest: 'bg-red-100 text-red-600',
}

const TYPE_COLORS = {
  bug: 'bg-red-100 text-red-600',
  feature: 'bg-purple-100 text-purple-600',
  improvement: 'bg-blue-100 text-blue-600',
  task: 'bg-gray-100 text-gray-600',
}

const STATUS_COLORS = {
  backlog: 'bg-gray-100 text-gray-600',
  todo: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-yellow-100 text-yellow-600',
  in_review: 'bg-purple-100 text-purple-600',
  done: 'bg-green-100 text-green-600',
}

function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    priority: 'all',
    type: 'all',
    status: 'all'
  })

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const data = await fetchAllTickets()
      setTickets(data)
    } catch (err) {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      if (search && !ticket.title.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false
      if (filters.type !== 'all' && ticket.type !== filters.type) return false
      if (filters.status !== 'all' && ticket.status !== filters.status) return false
      return true
    })
  }

  if (loading) return <div className="text-gray-500">Loading tickets...</div>

  const filteredTickets = getFilteredTickets()

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">View and search tickets across all your projects</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">{error}</div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-200 rounded-md px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="border border-gray-200 rounded-md px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="border border-gray-200 rounded-md px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="improvement">Improvement</option>
          </select>

          {(search || filters.priority !== 'all' || filters.type !== 'all' || filters.status !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilters({ priority: 'all', type: 'all', status: 'all' }) }}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">
            {filteredTickets.length} of {tickets.length} tickets
          </span>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No tickets found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table Header */}
            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Reporter</div>
            </div>

            {filteredTickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/projects/${ticket.project_id}/tickets/${ticket.id}`}
                className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-800 truncate">{ticket.title}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 truncate">{ticket.project_name}</p>
                </div>
                <div className="col-span-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[ticket.type]}`}>
                    {ticket.type}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">{ticket.reporter_name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tickets