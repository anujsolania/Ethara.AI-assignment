import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, MoreVertical, Calendar, CheckSquare, Layers, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Projects.css';
import toast from 'react-hot-toast';

const ProjectCard = ({ project }) => {
  const progress = project.taskCount > 0 
    ? Math.round((project.completedCount / project.taskCount) * 100) 
    : 0;

  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? All associated tasks will be permanently removed.`)) return;
    
    try {
      await api.delete(`/projects/${project._id}`);
      toast.success('Project deleted successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <Link to={`/projects/${project._id}`} className="project-card glass-panel animate-fade-in">
      <div className="project-card-header">
        <div className="project-color" style={{ backgroundColor: project.color }}></div>
        <div className="relative" style={{ position: 'relative' }}>
          <button 
            className="btn-icon" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && user?.role === 'admin' && (
            <div className="dropdown-menu glass-panel animate-fade-in" style={{ 
              position: 'absolute', 
              right: 0, 
              top: '100%', 
              zIndex: 100, 
              minWidth: '150px', 
              padding: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}>
              <button 
                className="dropdown-item text-error flex items-center gap-2 w-full text-left p-2 hover:bg-white/10 rounded transition-colors text-sm"
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="project-card-body">
        <h3>{project.name}</h3>
        <p className="project-desc">{project.description || 'No description provided.'}</p>
        
        <div className="project-meta">
          <div className="meta-item">
            <CheckSquare size={14} />
            <span>{project.completedCount}/{project.taskCount} tasks</span>
          </div>
          {project.deadline && (
            <div className="meta-item">
              <Calendar size={14} />
              <span>{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="project-card-footer">
        <div className="project-progress">
          <div className="progress-header">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bg">
            <div className="progress-fill bg-primary" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        
        <div className="project-members">
          {project.members.filter(m => m.user).slice(0, 3).map((member, i) => (
            <div key={member.user._id} className="member-avatar" style={{ zIndex: 3 - i }}>
              {member.user.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members.length > 3 && (
            <div className="member-avatar more" style={{ zIndex: 0 }}>
              +{project.members.length - 3}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', deadline: '', color: '#8b5cf6' });

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      toast.success('Project created!');
      setShowModal(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="text-muted">Manage your team's projects and workspaces</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center mt-8">
          <div className="pulse-glow" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state glass-panel">
          <Layers size={48} className="text-muted mb-4" />
          <h3>No projects found</h3>
          <p className="text-muted mt-2 mb-4">Get started by creating a new project workspace.</p>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid mt-6">
          {projects.map((project, index) => (
            <div key={project._id} style={{ animationDelay: `${index * 50}ms` }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      {/* Basic Modal Implementation */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
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
                ></textarea>
              </div>
              <div className="flex gap-4">
                <div className="form-group flex-1">
                  <label className="form-label">Deadline</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input 
                    type="color" 
                    className="form-input color-picker" 
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer mt-6 flex justify-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
