import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-glow bg-glow-1"></div>
      
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="logo justify-center mb-6">
            <CheckCircle2 className="text-primary" size={28} />
            <span>Ethara<span className="text-primary">.AI</span></span>
          </Link>
          <h2>Welcome back</h2>
          <p className="text-muted">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                className="form-input has-icon" 
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                className="form-input has-icon" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-muted text-sm">
            Don't have an account? <Link to="/register" className="text-primary font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
