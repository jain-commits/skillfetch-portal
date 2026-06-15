import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaLock, FaEnvelope } from 'react-icons/fa';

function Login({ setCurrentUser, setCurrentPage, API_BASE_URL }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Invalid email or password.');
        return;
      }
      setCurrentUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      toast.success("Welcome back! Logged in successfully.");
      
      if (data.role === 'admin') {
        setCurrentPage('admin-panel');
      } else if (data.role === 'employer') {
        setCurrentPage('employer-dashboard');
      } else {
        setCurrentPage('home'); 
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card card">
        <div className="auth-header">
          <h2>Sign In</h2>
          <p>Stay updated on your professional world</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">
              <FaEnvelope style={{ marginRight: '6px', color: '#6b7280' }} /> Email Address
            </label>
            <input 
              id="login-email"
              type="email" 
              className="form-control" 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label htmlFor="login-password">
              <FaLock style={{ marginRight: '6px', color: '#6b7280' }} /> Password
            </label>
            <input 
              id="login-password"
              type="password" 
              className="form-control" 
              placeholder="Enter your password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to SkillFetch?{' '}
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                setCurrentPage('register'); 
              }}
              className="auth-link"
            >
              Join now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
