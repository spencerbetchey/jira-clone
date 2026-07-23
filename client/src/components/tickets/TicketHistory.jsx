import { useState, useEffect } from 'react'
import { fetchTicketHistory } from '../../api/tickets'

function TicketHistory({ ticketId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [ticketId])

  const loadHistory = async () => {
    try {
      const data = await fetchTicketHistory(ticketId)
      setHistory(data)
    } catch (err) {
      console.error('Failed to load ticket history:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value) => {
    if (!value) return 'none'
    return value.replace('_', ' ')
  }

  const formatFieldName = (field) => {
    return field.replace('_', ' ')
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const seconds = Math.floor((new Date() - date) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return <div className="text-sm text-gray-400 dark:text-gray-500">Loading history...</div>
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
      <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Activity</h2>

      {history.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">No activity yet</p>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-800 dark:text-gray-100">{entry.user_name}</span>
                  {' changed '}
                  <span className="font-medium">{formatFieldName(entry.field_changed)}</span>
                  {' from '}
                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {formatValue(entry.old_value)}
                  </span>
                  {' to '}
                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {formatValue(entry.new_value)}
                  </span>
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatTimeAgo(entry.changed_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TicketHistory