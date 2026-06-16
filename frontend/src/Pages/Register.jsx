import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';

function Register({ setCurrentPage, API_BASE_URL }) {
  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (role === 'candidate' && !gender) {
      toast.error("Please select your gender.");
      return;
    }
    if (role === 'employer' && (!companyName || !companyLocation)) {
      toast.error("Please fill in company details.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name,
          email,
          password,
          gender: role === 'candidate' ? gender : '',
          companyName,
          companyLocation
        })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Registration failed.');
        return;
      }

      toast.success("Account created successfully! Please sign in.");
      setCurrentPage('login');
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join India's premium job search and networking hub</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-role">I want to register as:</label>
            <select 
              id="reg-role"
              className="form-control" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="candidate">Job Seeker (Candidate)</option>
              <option value="employer">Employer / Recruiter</option>
            </select>
          </div>

          {role === 'candidate' && (
            <div className="form-group" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
              <label htmlFor="reg-gender">Gender</label>
              <select 
                id="reg-gender"
                className="form-control" 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reg-name">
              <FaUser style={{ marginRight: '6px', color: '#6b7280' }} /> Full Name
            </label>
            <input 
              id="reg-name"
              type="text" 
              className="form-control" 
              placeholder="Enter your full name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">
              <FaEnvelope style={{ marginRight: '6px', color: '#6b7280' }} /> Email Address
            </label>
            <input 
              id="reg-email"
              type="email" 
              className="form-control" 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {role === 'employer' && (
            <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
              <div className="form-group">
                <label htmlFor="reg-company">
                  <FaBuilding style={{ marginRight: '6px', color: '#6b7280' }} /> Company Name
                </label>
                <input 
                  id="reg-company"
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Aura Tech Inc"
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-comploc">
                  <FaMapMarkerAlt style={{ marginRight: '6px', color: '#6b7280' }} /> Company Location
                </label>
                <input 
                  id="reg-comploc"
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Bangalore, India"
                  value={companyLocation} 
                  onChange={(e) => setCompanyLocation(e.target.value)} 
                  required 
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label htmlFor="reg-password">
              <FaLock style={{ marginRight: '6px', color: '#6b7280' }} /> Password
            </label>
            <input 
              id="reg-password"
              type="password" 
              className="form-control" 
              placeholder="Create a password"
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
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                setCurrentPage('login'); 
              }}
              className="auth-link"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
