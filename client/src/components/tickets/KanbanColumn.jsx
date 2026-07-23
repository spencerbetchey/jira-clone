import { useDroppable } from '@dnd-kit/core'
import KanbanTicket from './KanbanTicket'

const COLUMN_COLORS = {
  backlog: 'bg-gray-100 dark:bg-gray-800',
  todo: 'bg-blue-50 dark:bg-blue-950',
  in_progress: 'bg-yellow-50 dark:bg-yellow-950',
  in_review: 'bg-purple-50 dark:bg-purple-950',
  done: 'bg-green-50 dark:bg-green-950',
}

const COLUMN_HEADER_COLORS = {
  backlog: 'text-gray-600 dark:text-gray-300',
  todo: 'text-blue-600 dark:text-blue-400',
  in_progress: 'text-yellow-600 dark:text-yellow-400',
  in_review: 'text-purple-600 dark:text-purple-400',
  done: 'text-green-600 dark:text-green-400',
}

function KanbanColumn({ column, tickets, projectId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex-shrink-0 w-64">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${COLUMN_HEADER_COLORS[column.id]}`}>
          {column.label}
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {tickets.length}
        </span>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`min-h-96 rounded-lg p-2 transition-colors ${COLUMN_COLORS[column.id]} ${isOver ? 'ring-2 ring-blue-400' : ''}`}
      >
        <div className="space-y-2">
          {tickets.map(ticket => (
            <KanbanTicket
              key={ticket.id}
              ticket={ticket}
              projectId={projectId}
            />
          ))}
        </div>

        {tickets.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-400 dark:text-gray-500">
            No tickets
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanColumn