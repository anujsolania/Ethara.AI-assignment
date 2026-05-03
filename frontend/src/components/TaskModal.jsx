import { useState } from 'react';
import { X, Calendar, User, Tag, Clock, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TaskModal = ({ task, onClose, onUpdate, currentUser, allUsers }) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee?._id || task.assignee || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const isAdmin = currentUser.role === 'admin';
  const isAssignee = task.assignee?._id === currentUser._id || task.assignee === currentUser._id;
  const canEditEverything = isAdmin;
  const canEditStatus = isAdmin || isAssignee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/tasks/${task._id}`, formData);
      toast.success('Task updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
      toast.success('Status updated');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="project-color-dot" style={{ backgroundColor: task.project?.color }}></div>
            <span className="text-muted text-sm">{task.project?.name}</span>
            <ChevronRight size={14} className="text-muted" />
            <span className="text-sm font-medium">Task Details</span>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              disabled={!canEditEverything}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows="3"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              disabled={!canEditEverything}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-input"
                value={formData.status}
                onChange={e => {
                  setFormData({...formData, status: e.target.value});
                  if (!canEditEverything && canEditStatus) {
                    handleStatusChange(e.target.value);
                  }
                }}
                disabled={!canEditStatus}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select 
                className="form-input"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                disabled={!canEditEverything}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select 
                className="form-input"
                value={formData.assignee}
                onChange={e => setFormData({...formData, assignee: e.target.value})}
                disabled={!canEditEverything}
              >
                <option value="">Unassigned</option>
                {allUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                disabled={!canEditEverything}
              />
            </div>
          </div>

          <div className="modal-footer mt-8 flex justify-between items-center">
            <div className="text-xs text-muted flex flex-col gap-1">
              <div className="flex items-center gap-1"><Clock size={12} /> Created: {new Date(task.createdAt).toLocaleString()}</div>
              {task.createdBy && <div className="flex items-center gap-1"><User size={12} /> By: {task.createdBy.name}</div>}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
              {canEditEverything && (
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
