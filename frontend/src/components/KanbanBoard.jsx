import { useState, useEffect } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Calendar } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Kanban.css';

// TaskCard component for the board
const SortableTaskCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="kanban-task-card"
      onClick={() => onClick(task)}
    >
      <div className="task-labels">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
      </div>
      <h4 className="task-title">{task.title}</h4>
      
      <div className="task-footer">
        <div className="task-icons">
          {task.comments?.length > 0 && (
            <span className="task-icon-item"><MessageSquare size={14} /> {task.comments.length}</span>
          )}
          {task.dueDate && (
            <span className={`task-icon-item ${new Date(task.dueDate) < new Date() ? 'text-error' : ''}`}>
              <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="task-assignee" title={task.assignee.name}>
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ projectId, tasks, onTaskUpdate, onTaskClick }) => {
  const [columns, setColumns] = useState({
    todo: [],
    'in-progress': [],
    review: [],
    done: []
  });
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    // Distribute tasks into columns
    const cols = { todo: [], 'in-progress': [], review: [], done: [] };
    tasks.forEach(t => {
      if (cols[t.status]) cols[t.status].push(t);
      else cols.todo.push(t);
    });
    setColumns(cols);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the source and destination columns
    let sourceCol = null;
    let destCol = null;

    Object.keys(columns).forEach(key => {
      if (columns[key].find(t => t._id === activeId)) sourceCol = key;
      if (key === overId || columns[key].find(t => t._id === overId)) destCol = key;
    });

    if (!sourceCol || !destCol) return;

    // Moving between columns
    if (sourceCol !== destCol) {
      setColumns(prev => {
        const sourceItems = [...prev[sourceCol]];
        const destItems = [...prev[destCol]];
        
        const taskIndex = sourceItems.findIndex(t => t._id === activeId);
        const [movedTask] = sourceItems.splice(taskIndex, 1);
        movedTask.status = destCol;
        
        // Find insert position
        let insertIndex = destItems.length;
        if (overId !== destCol) {
          insertIndex = destItems.findIndex(t => t._id === overId);
        }
        
        destItems.splice(insertIndex, 0, movedTask);
        
        return {
          ...prev,
          [sourceCol]: sourceItems,
          [destCol]: destItems
        };
      });

      // API call to update status
      try {
        await api.patch(`/tasks/${activeId}/status`, { status: destCol });
        onTaskUpdate(); // Refresh parent data
      } catch (error) {
        toast.error('Failed to update task status');
        onTaskUpdate(); // Revert
      }
    } 
    // Reordering within the same column
    else if (activeId !== overId) {
      setColumns(prev => {
        const items = [...prev[sourceCol]];
        const oldIndex = items.findIndex(t => t._id === activeId);
        const newIndex = items.findIndex(t => t._id === overId);
        
        return {
          ...prev,
          [sourceCol]: arrayMove(items, oldIndex, newIndex)
        };
      });
    }
  };

  const getColumnTitle = (key) => {
    const titles = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      review: 'In Review',
      done: 'Done'
    };
    return titles[key];
  };

  return (
    <div className="kanban-container">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {Object.keys(columns).map(colKey => (
            <div key={colKey} className="kanban-column glass-panel">
              <div className="kanban-column-header">
                <h3>{getColumnTitle(colKey)}</h3>
                <span className="kanban-count">{columns[colKey].length}</span>
              </div>
              
              <div className="kanban-droppable" id={colKey}>
                <SortableContext items={columns[colKey].map(t => t._id)} strategy={verticalListSortingStrategy}>
                  {columns[colKey].map(task => (
                    <SortableTaskCard key={task._id} task={task} onClick={onTaskClick} />
                  ))}
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="kanban-task-card overlay">
              <div className="task-labels">
                <span className={`badge badge-${activeTask.priority}`}>{activeTask.priority}</span>
              </div>
              <h4 className="task-title">{activeTask.title}</h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
