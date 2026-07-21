import { useDraggable } from '@dnd-kit/core'
import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'

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

function KanbanTicket({ ticket, projectId, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: ticket.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing transition-shadow ${isDragging ? 'opacity-50' : 'hover:shadow-md'}`}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[ticket.type]}`}>
          {ticket.type}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>

      {/* Title */}
      <Link
        to={`/projects/${projectId}/tickets/${ticket.id}`}
        className="text-sm font-medium text-gray-800 hover:text-blue-600 block mb-2"
        onClick={(e) => e.stopPropagation()}
      >
        {ticket.title}
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <Avatar name={ticket.assignee_name} size="sm" />
          <span className="text-xs text-gray-400">
            {ticket.assignee_name || 'Unassigned'}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          #{ticket.id}
        </span>
      </div>
    </div>
  )
}

export default KanbanTicket