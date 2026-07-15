import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import KanbanTicket from './KanbanTicket'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
]

function KanbanBoard({ tickets, onTicketMove, projectId, myRole }) {
  const [activeTicket, setActiveTicket] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status)
  }

  const handleDragStart = (event) => {
    if (myRole === 'viewer') return
    const { active } = event
    const ticket = tickets.find(t => t.id === active.id)
    setActiveTicket(ticket)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveTicket(null)

    if (!over) return
    if (myRole === 'viewer') return

    const ticketId = active.id
    const newStatus = over.id

    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket || ticket.status === newStatus) return

    onTicketMove(ticketId, newStatus)
  }

  //Viewers just see the board without drag and drop
  if (myRole === 'viewer') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tickets={getTicketsByStatus(column.id)}
            projectId={projectId}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tickets={getTicketsByStatus(column.id)}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <KanbanTicket ticket={activeTicket} projectId={projectId} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard