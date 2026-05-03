import { useState, useEffect } from 'react';
import { Layers, CheckSquare, AlertCircle, Users } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <div className="stat-card glass-panel animate-fade-in">
    <div className="stat-card-header">
      <div className="stat-info">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    {subtitle && <p className="stat-subtitle">{subtitle}</p>}
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, overdueRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/overdue')
        ]);
        setStats(statsRes.data.data.stats);
        setOverdueTasks(overdueRes.data.data.tasks);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header animate-fade-in">
        <div>
        <div className="flex items-center gap-3">
          <h2>Welcome back, {user?.name.split(' ')[0]} 👋</h2>
          <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
            {user?.role}
          </span>
        </div>
        <p className="text-muted">Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Projects" 
          value={stats?.totalProjects || 0} 
          icon={Layers} 
          colorClass="icon-primary"
          subtitle={`${stats?.activeProjects || 0} active projects`}
        />
        <StatCard 
          title="Total Tasks" 
          value={stats?.totalTasks || 0} 
          icon={CheckSquare} 
          colorClass="icon-info"
          subtitle={`${stats?.completionRate || 0}% completion rate`}
        />
        <StatCard 
          title="Overdue Tasks" 
          value={stats?.overdueTasks || 0} 
          icon={AlertCircle} 
          colorClass="icon-error"
          subtitle="Needs immediate attention"
        />
        {user?.role === 'admin' && (
          <StatCard 
            title="Total Members" 
            value={stats?.totalMembers || 0} 
            icon={Users} 
            colorClass="icon-warning"
          />
        )}
      </div>

      <div className="dashboard-content grid-2-col mt-8">
        <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="section-title mb-4">Task Status</h3>
          <div className="status-bars">
            <div className="status-bar-item">
              <div className="status-label">
                <span>To Do</span>
                <span>{stats?.byStatus?.todo || 0}</span>
              </div>
              <div className="progress-bg"><div className="progress-fill bg-info" style={{ width: `${(stats?.byStatus?.todo / stats?.totalTasks) * 100 || 0}%` }}></div></div>
            </div>
            <div className="status-bar-item">
              <div className="status-label">
                <span>In Progress</span>
                <span>{stats?.byStatus?.inProgress || 0}</span>
              </div>
              <div className="progress-bg"><div className="progress-fill bg-warning" style={{ width: `${(stats?.byStatus?.inProgress / stats?.totalTasks) * 100 || 0}%` }}></div></div>
            </div>
            <div className="status-bar-item">
              <div className="status-label">
                <span>In Review</span>
                <span>{stats?.byStatus?.review || 0}</span>
              </div>
              <div className="progress-bg"><div className="progress-fill bg-primary" style={{ width: `${(stats?.byStatus?.review / stats?.totalTasks) * 100 || 0}%` }}></div></div>
            </div>
            <div className="status-bar-item">
              <div className="status-label">
                <span>Done</span>
                <span>{stats?.byStatus?.done || 0}</span>
              </div>
              <div className="progress-bg"><div className="progress-fill bg-success" style={{ width: `${(stats?.byStatus?.done / stats?.totalTasks) * 100 || 0}%` }}></div></div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h3 className="section-title mb-4 text-error flex items-center gap-2">
            <AlertCircle size={20} /> Overdue Tasks
          </h3>
          {overdueTasks.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={48} className="text-success mb-2" opacity={0.5} />
              <p className="text-muted">Great job! No overdue tasks.</p>
            </div>
          ) : (
            <div className="task-list">
              {overdueTasks.map(task => (
                <div key={task._id} className="task-list-item">
                  <div className="task-list-info">
                    <h4>{task.title}</h4>
                    <p className="text-xs text-muted">{task.project?.name} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`badge badge-${task.priority}`}>
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
