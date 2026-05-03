import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Users } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' });
  const [allUsers, setAllUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchProjectData = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.data.project);
      setTasks(data.data.tasks);
    } catch (error) {
      toast.error('Failed to load project details');
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
    fetchProjectData();
    fetchAllUsers();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...taskFormData, project: project._id });
      toast.success('Task created successfully');
      setShowTaskModal(false);
      setTaskFormData({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' });
      fetchProjectData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-container flex-col items-center justify-center text-center">
        <h2>Project not found</h2>
        <Link to="/projects" className="btn btn-primary mt-4">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
        <div className="flex-col gap-2">
          <Link to="/projects" className="text-muted flex items-center gap-2 text-sm hover:text-primary transition-colors" style={{ width: 'fit-content' }}>
            <ArrowLeft size={16} /> Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <div className="project-color" style={{ width: '24px', height: '24px', backgroundColor: project.color, borderRadius: '4px' }}></div>
            <h2 className="text-2xl font-semibold">{project.name}</h2>
            <span className="badge badge-info">{project.status}</span>
          </div>
          <p className="text-muted text-sm">{project.description}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="project-members flex items-center">
            {project.members.filter(m => m.user).slice(0, 4).map((member, i) => (
              <div key={member.user._id} className="member-avatar" style={{ zIndex: 4 - i }} title={`${member.user.name} (${member.role})`}>
                {member.user.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            <button className="btn-icon" style={{ marginLeft: '0.5rem' }}>
              <Users size={18} />
            </button>
          </div>
          
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <button className="btn btn-secondary"><Settings size={18} /> Settings</button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}><Plus size={18} /> Add Task</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <KanbanBoard 
          projectId={project._id} 
          tasks={tasks} 
          onTaskUpdate={fetchProjectData}
          onTaskClick={(task) => setSelectedTask(task)}
        />
      </div>

      {/* Task Detail/Edit Modal */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={fetchProjectData}
          currentUser={user}
          allUsers={allUsers}
        />
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="btn-icon" onClick={() => setShowTaskModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={taskFormData.title}
                  onChange={e => setTaskFormData({...taskFormData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={taskFormData.description}
                  onChange={e => setTaskFormData({...taskFormData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-4">
                <div className="form-group flex-1">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-input"
                    value={taskFormData.priority}
                    onChange={e => setTaskFormData({...taskFormData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Assign To</label>
                  <select 
                    className="form-input"
                    value={taskFormData.assignee}
                    onChange={e => setTaskFormData({...taskFormData, assignee: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {allUsers.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={taskFormData.dueDate}
                  onChange={e => setTaskFormData({...taskFormData, dueDate: e.target.value})}
                />
              </div>
              <div className="modal-footer mt-6 flex justify-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
