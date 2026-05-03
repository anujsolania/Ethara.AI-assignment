import { useState, useEffect } from 'react';
import { Filter, CheckSquare, Clock, Search, MoreVertical } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Tasks.css';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, my, overdue
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let query = '';
      if (filter === 'my') query = `?assignee=${user._id}`;
      if (filter === 'overdue') query = `?overdue=true`;
      if (search) query += `${query ? '&' : '?'}search=${search}`;

      const { data } = await api.get(`/tasks${query}`);
      setTasks(data.data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setAllUsers(data.data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAllUsers();
  }, [filter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-semibold">All Tasks</h2>
          <p className="text-muted">View and filter tasks across all your projects</p>
        </div>
      </div>

      <div className="tasks-toolbar glass-panel">
        <div className="toolbar-search">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="toolbar-filters">
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All Tasks
          </button>
          <button 
            className={`btn ${filter === 'my' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('my')}
          >
            My Tasks
          </button>
          <button 
            className={`btn ${filter === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('overdue')}
          >
            Overdue
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-8">
          <div className="pulse-glow" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state glass-panel mt-6">
          <CheckSquare size={48} className="text-muted mb-4" />
          <h3>No tasks found</h3>
          <p className="text-muted mt-2">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="tasks-table-container glass-panel mt-6 animate-fade-in">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task Details</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assignee</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id} className="task-row" onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
                  <td className="task-cell-primary">
                    <div className="task-title-cell">
                      <span className="font-medium">{task.title}</span>
                      {task.comments?.length > 0 && <span className="text-xs text-muted"> • {task.comments.length} comments</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="project-color-dot" style={{ backgroundColor: task.project?.color }}></div>
                      <span className="text-sm">{task.project?.name}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${task.status}`}>{task.status.replace('-', ' ')}</span></td>
                  <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                  <td className={new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-error font-medium' : 'text-muted'}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="member-avatar small">{task.assignee.name.charAt(0).toUpperCase()}</div>
                        <span className="text-sm">{task.assignee.name.split(' ')[0]}</span>
                      </div>
                    ) : <span className="text-muted text-sm">Unassigned</span>}
                  </td>
                  <td>
                    <button className="btn-icon"><MoreVertical size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={fetchTasks}
          currentUser={user}
          allUsers={allUsers}
        />
      )}
    </div>
  );
};

export default TasksPage;
