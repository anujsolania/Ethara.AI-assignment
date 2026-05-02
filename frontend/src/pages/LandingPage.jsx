import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Users, Layout, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">
          <CheckCircle2 className="text-primary" size={28} />
          <span>Ethara<span className="text-primary">.AI</span></span>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-secondary">Log In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="hero-content">
          <div className="badge-pill">
            <span className="pulse-dot"></span>
            v2.0 is now live
          </div>
          <h1 className="hero-title animate-fade-in">
            Manage your team's work, <br />
            <span className="text-gradient">intelligently.</span>
          </h1>
          <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '100ms' }}>
            The ultimate project management tool designed for modern teams. 
            Track tasks, assign roles, and hit your deadlines with style.
          </p>
          <div className="hero-cta animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start for free <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="features-grid animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="feature-card glass-panel">
            <div className="feature-icon"><Layout size={24} /></div>
            <h3>Kanban Boards</h3>
            <p>Drag and drop tasks through custom workflows with ease.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon"><Users size={24} /></div>
            <h3>Role-Based Access</h3>
            <p>Secure your projects with granular Admin and Member permissions.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon"><Shield size={24} /></div>
            <h3>Enterprise Ready</h3>
            <p>Built on scalable MERN stack architecture for absolute reliability.</p>
          </div>
        </div>
      </main>
      
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
    </div>
  );
};

export default LandingPage;
