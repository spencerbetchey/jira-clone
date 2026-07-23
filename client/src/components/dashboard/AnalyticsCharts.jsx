import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STATUS_ORDER = ['backlog', 'todo', 'in_progress', 'in_review', 'done']
const STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}
const STATUS_HEX = {
  backlog: '#9ca3af',
  todo: '#3b82f6',
  in_progress: '#eab308',
  in_review: '#a855f7',
  done: '#22c55e',
}

const PRIORITY_ORDER = ['lowest', 'low', 'medium', 'high', 'highest']
const PRIORITY_LABELS = {
  lowest: 'Lowest',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  highest: 'Highest',
}
const PRIORITY_HEX = {
  lowest: '#9ca3af',
  low: '#3b82f6',
  medium: '#eab308',
  high: '#f97316',
  highest: '#ef4444',
}

function countBy(tickets, field, order) {
  const counts = {}
  order.forEach(key => { counts[key] = 0 })
  tickets.forEach(ticket => {
    if (counts[ticket[field]] !== undefined) {
      counts[ticket[field]] += 1
    }
  })
  return counts
}

function AnalyticsCharts({ tickets }) {
  const statusCounts = countBy(tickets, 'status', STATUS_ORDER)
  const statusData = STATUS_ORDER.map(key => ({
    name: STATUS_LABELS[key],
    value: statusCounts[key],
    key,
  }))

  const priorityCounts = countBy(tickets, 'priority', PRIORITY_ORDER)
  const priorityData = PRIORITY_ORDER.map(key => ({
    name: PRIORITY_LABELS[key],
    value: priorityCounts[key],
    key,
  }))

  if (tickets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 text-center text-gray-400 dark:text-gray-500 py-12">
        No tickets yet — create some to see your analytics
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Tickets by Status</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {statusData.map(entry => (
                <Cell key={entry.key} fill={STATUS_HEX[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Tickets by Priority</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {priorityData.map(entry => (
                <Cell key={entry.key} fill={PRIORITY_HEX[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AnalyticsCharts