import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Users } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import toast from 'react-hot-toast';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProjectData();
  }, [id]);

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
            {project.members.slice(0, 4).map((member, i) => (
              <div key={member.user._id} className="member-avatar" style={{ zIndex: 4 - i }} title={`${member.user.name} (${member.role})`}>
                {member.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            <button className="btn-icon" style={{ marginLeft: '0.5rem' }}>
              <Users size={18} />
            </button>
          </div>
          
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <button className="btn btn-secondary"><Settings size={18} /> Settings</button>
              <button className="btn btn-primary"><Plus size={18} /> Add Task</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <KanbanBoard 
          projectId={project._id} 
          tasks={tasks} 
          onTaskUpdate={fetchProjectData}
          onTaskClick={(task) => console.log('Clicked task', task)}
        />
      </div>
    </div>
  );
};

export default ProjectDetailPage;
