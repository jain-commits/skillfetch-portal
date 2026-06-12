import React, { useState, useEffect } from 'react';

//itconst API_BASE_URL = 'http://localhost:5001/api';
const API_BASE_URL = "https://skillfetch-portal.onrender.com";

// ==================== APP CONTAINER COMPONENT ====================

export default function App() {
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [jobs, setJobs] = useState([]);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;});
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Fetch all jobs on startup
  const fetchJobs = async () => {
    setLoadingJobs(true);
    setJobsError(false);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`);
      if (!res.ok) throw new Error("Could not fetch jobs");
      const data = await res.json();
      console.log("API response:", data);
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setJobsError(true);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch applications and users based on logged-in user role
  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setApplications([]);
      return;
    }

    const fetchUserData = async () => {
      // 1. Fetch applications
      try {
        let appUrl = `${API_BASE_URL}/applications`;
        if (currentUser.role === 'candidate') {
          appUrl += `?candidateId=${currentUser.id}`;
        }
        const appRes = await fetch(appUrl);
        const appData = await appRes.json();
        if (appRes.ok) {
          setApplications(appData);
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      }

      // 2. Fetch users list (required for Employer to show candidate names, and for Admin)
      if (currentUser.role === 'admin' || currentUser.role === 'employer') {
        try {
          const userRes = await fetch(`${API_BASE_URL}/users`);
          const userData = await userRes.json();
          if (userRes.ok) {
            setUsers(userData);
          }
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Authentication Helpers
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('home');
    alert('Logged out successfully.');
  };

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="header">
        <a href="#" onClick={() => setCurrentPage('home')} className="logo-link">
          SkillFetch <span className="logo-highlight">Portal</span>
        </a>
        <nav>
          <a href="#" onClick={() => setCurrentPage('home')}>Home</a>
          <a href="#" onClick={() => setCurrentPage('job-listings')}>Jobs</a>
          
          {currentUser && currentUser.role === 'candidate' && (
            <>
              <a href="#" onClick={() => setCurrentPage('profile')}>My Profile</a>
              <a href="#" onClick={() => setCurrentPage('tracker')}>My Applications</a>
            </>
          )}

          {currentUser && currentUser.role === 'employer' && (
            <>
              <a href="#" onClick={() => setCurrentPage('employer-dashboard')}>Employer Panel</a>
              <a href="#" onClick={() => setCurrentPage('post-job')}>Post a Job</a>
            </>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <a href="#" onClick={() => setCurrentPage('admin-panel')}>Admin Board</a>
          )}

          {!currentUser ? (
            <>
              <a href="#" onClick={() => setCurrentPage('login')} className="btn" style={{ padding: '5px 10px', fontSize: '14px' }}>Login</a>{' '}
              <a href="#" onClick={() => setCurrentPage('register')} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '14px' }}>Register</a>
            </>
          ) : (
            <span style={{ marginLeft: '10px' }}>
              <strong>{currentUser.name}</strong> ({currentUser.role}){' '}
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }}>Logout</button>
            </span>
          )}
        </nav>
      </header>

      {/* Main Pages Content Router */}
      <main className="container">

        {/* Backend connection status banner */}
        {loadingJobs && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <p>⏳ Connecting to server, please wait...</p>
          </div>
        )}
        {jobsError && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '15px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>⚠️ Cannot reach the backend server.</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Make sure you have run <code>npm start</code> inside the <code>backend/</code> folder.</p>
            </div>
            <button onClick={fetchJobs} className="btn" style={{ whiteSpace: 'nowrap', marginLeft: '15px' }}>🔄 Retry</button>
          </div>
        )}

        {currentPage === 'home' && (
          <Home jobs={jobs} setCurrentPage={setCurrentPage} setSelectedJobId={setSelectedJobId} />
        )}

        {currentPage === 'login' && (
          <Login setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'register' && (
          <Register setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'job-listings' && (
          <JobListings jobs={jobs} setCurrentPage={setCurrentPage} setSelectedJobId={setSelectedJobId} currentUser={currentUser} />
        )}

        {currentPage === 'job-detail' && (
          <JobDetail 
            jobs={jobs} 
            selectedJobId={selectedJobId} 
            currentUser={currentUser} 
            applications={applications} 
            setApplications={setApplications} 
            setCurrentPage={setCurrentPage} 
          />
        )}

        {currentPage === 'profile' && (
          <CandidateProfile currentUser={currentUser} setCurrentUser={setCurrentUser} />
        )}

        {currentPage === 'tracker' && (
          <ApplicationTracking applications={applications} jobs={jobs} currentUser={currentUser} />
        )}

        {currentPage === 'employer-dashboard' && (
          <EmployerDashboard 
            jobs={jobs} 
            setJobs={setJobs}
            applications={applications} 
            setApplications={setApplications}
            users={users} 
            currentUser={currentUser} 
            setCurrentPage={setCurrentPage} 
            setSelectedJobId={setSelectedJobId} 
          />
        )}

        {currentPage === 'post-job' && (
          <PostJob jobs={jobs} setJobs={setJobs} currentUser={currentUser} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'admin-panel' && (
          <AdminPanel 
            users={users} 
            setUsers={setUsers} 
            jobs={jobs} 
            setJobs={setJobs} 
            applications={applications} 
            setApplications={setApplications} 
            currentUser={currentUser} 
          />
        )}

      </main>

      {/* Simple Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 SkillFetch Job Portal Project. Made with ❤️</p>
        </div>
      </footer>
    </div>
  );
}

// ==================== PAGE COMPONENTS ====================

// 1. Home Page Component
function Home({ jobs, setCurrentPage, setSelectedJobId }) {
  // Get 3 most recent jobs
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const recentJobs = safeJobs.slice(0, 3);

  return (
    <div>
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1>Welcome to SkillFetch</h1>
        <p>A simple project where Job Seekers find job listings and Employers post job openings.</p>
        <button onClick={() => setCurrentPage('job-listings')} className="btn">Search All Jobs</button>
      </div>

      <h2>Recent Jobs</h2>
      {recentJobs.length === 0 ? (
        <p>Oops! There is no job listings available.</p>
      ) : (
        recentJobs.map((job) => (
          <div key={job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Logo display with fallback */}
              {job.companyLogo ? (
                <img 
                  src={job.companyLogo} 
                  alt={`${job.companyName} logo`} 
                  style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: 'contain', border: '1px solid #eee' }} 
                />
              ) : (
                <div style={{ width: "50px", height: "50px", borderRadius: "8px", backgroundColor: "#0056b3", color: "#fff", display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                  {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'J'}
                </div>
              )}
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{job.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                  <strong>Company:</strong> {job.companyName} | <strong>Type:</strong> {job.type} | <strong>Location:</strong> {job.location}
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedJobId(job.id); setCurrentPage('job-detail'); }} 
              className="btn btn-secondary"
            >
              View Details
            </button>
          </div>
        ))
      )}
    </div>
  );
}

// 2. Login Page Component
function Login({ setCurrentUser, setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Wrong email or password!');
        return;
      }
      setCurrentUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      alert('Logged in successfully!');
      if (data.role === 'admin') {
        setCurrentPage('admin-panel');
      } else if (data.role === 'employer') {
        setCurrentPage('employer-dashboard');
      } else {
        setCurrentPage('job-listings');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during login.');
    }
  };

  // Easy Login Buttons for Presentation
  const handleQuickLogin = (role) => {
    if (role === 'candidate') {
      setEmail('candidate@jobportal.com');
      setPassword('candidate123');
    } else if (role === 'employer') {
      setEmail('employer@jobportal.com');
      setPassword('employer123');
    } else if (role === 'admin') {
      setEmail('admin@jobportal.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Sign In</h2>
      
      {/* Quick prefill helpers */}
      <div style={{ marginBottom: '15px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Quick Prefill: </span>
        <button onClick={() => handleQuickLogin('candidate')} className="btn btn-secondary" style={{ padding: '3px 6px', fontSize: '11px', marginRight: '5px' }}>Candidate</button>
        <button onClick={() => handleQuickLogin('employer')} className="btn btn-secondary" style={{ padding: '3px 6px', fontSize: '11px', marginRight: '5px' }}>Employer</button>
        <button onClick={() => handleQuickLogin('admin')} className="btn btn-secondary" style={{ padding: '3px 6px', fontSize: '11px' }}>Admin</button>
      </div>

      <form onSubmit={handleLoginSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        Don't have an account? <a href="#" onClick={() => setCurrentPage('register')}>Register here</a>
      </p>
    </div>
  );
}

// 3. Register Page Component
function Register({ setCurrentPage }) {
  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name,
          email,
          password,
          companyName,
          companyLocation
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Registration failed!');
        return;
      }
      alert('Account created successfully! You can login now.');
      setCurrentPage('login');
    } catch (err) {
      console.error(err);
      alert('Network error during registration.');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '30px auto' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleRegisterSubmit}>
        <div className="form-group">
          <label>I want to register as:</label>
          <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="candidate">Job Seeker (Candidate)</option>
            <option value="employer">Employer / Recruiter</option>
          </select>
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        {role === 'employer' && (
          <>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" className="form-control" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Company Location</label>
              <input type="text" className="form-control" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} required />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="btn" style={{ width: '100%' }}>Register Account</button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        Already registered? <a href="#" onClick={() => setCurrentPage('login')}>Login here</a>
      </p>
    </div>
  );
}

// 4. Job Listings Page Component
function JobListings({ jobs, setCurrentPage, setSelectedJobId, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  // Simple category and location list extracting
  const categories = Array.from(new Set(safeJobs.map(j => j.category || '')));
  const locations = Array.from(new Set(safeJobs.map(j => j.location || '')));

  const filteredJobs = safeJobs.filter(job => {
    const title = job.title || '';
    const company = job.companyName || '';
    const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !categoryFilter || job.category === categoryFilter;
    const matchLocation = !locationFilter || job.location === locationFilter;
    return matchSearch && matchCategory && matchLocation;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Available Jobs</h2>
        {currentUser && currentUser.role === 'employer' && (
          <button onClick={() => setCurrentPage('post-job')} className="btn">Post a New Job</button>
        )}
      </div>

      {/* Simple Search Filters Panel */}
      <div className="card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search job title or company..." 
          className="form-control" 
          style={{ flex: 1, minWidth: '200px' }} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <select 
          className="form-control" 
          style={{ width: '180px' }} 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
        </select>
        <select 
          className="form-control" 
          style={{ width: '180px' }} 
          value={locationFilter} 
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
        </select>
      </div>

      {filteredJobs.length === 0 ? (
        <p>No jobs match your search filters.</p>
      ) : (
        filteredJobs.map((job) => (
          <div key={job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Logo display with fallback */}
              {job.companyLogo ? (
                <img 
                  src={job.companyLogo} 
                  alt={`${job.companyName} logo`} 
                  style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: 'contain', border: '1px solid #eee' }} 
                />
              ) : (
                <div style={{ width: "50px", height: "50px", borderRadius: "8px", backgroundColor: "#0056b3", color: "#fff", display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                  {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'J'}
                </div>
              )}
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{job.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                  <strong>{job.companyName}</strong> &bull; {job.location}
                </p>
                <div style={{ marginTop: '5px' }}>
                  <span className="badge">{job.type}</span>
                  <span className="badge">{job.experienceLevel}</span>
                  <span className="badge badge-success">{job.salaryRange}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedJobId(job.id); setCurrentPage('job-detail'); }} 
              className="btn"
            >
              Apply / Details
            </button>
          </div>
        ))
      )}
    </div>
  );
}

// 5. Job Detail & Apply Page Component
function JobDetail({ jobs, selectedJobId, currentUser, applications, setApplications, setCurrentPage }) {
  const [coverLetter, setCoverLetter] = useState('');
  
  const job = jobs.find(j => j.id === selectedJobId);
  if (!job) return <p>Job not found!</p>;

  // Check if candidate has already applied to this specific job
  const hasApplied = currentUser && applications.some(app => app.jobId === job.id && app.candidateId === currentUser.id);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'candidate') {
      alert('You must log in as a Candidate to apply!');
      setCurrentPage('login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          candidateId: currentUser.id,
          coverLetter
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Application failed!');
        return;
      }
      setApplications([data, ...applications]);
      alert('Applied successfully!');
      setCurrentPage('tracker');
    } catch (err) {
      console.error(err);
      alert('Network error during application submission.');
    }
  };

  return (
    <div>
      <button onClick={() => setCurrentPage('job-listings')} className="btn btn-secondary" style={{ marginBottom: '15px' }}>Back to Jobs</button>
      
      <div className="card">
        <h2>{job.title}</h2>
        <p><strong>Company:</strong> {job.companyName} | <strong>Location:</strong> {job.location}</p>
        <p><strong>Salary Range:</strong> {job.salaryRange} | <strong>Type:</strong> {job.type}</p>
        
        <hr style={{ borderColor: '#eeeeee', margin: '15px 0' }} />
        <h3>Job Description</h3>
        <div style={{ lineHeight: '1.6', whiteSpace: 'normal', marginBottom: '20px' }} dangerouslySetInnerHTML={{ __html: job.description }} />
        
        <h3>Job Qualifications</h3>
        <p>{job.qualifications}</p>
        
        <h3>Skills Required</h3>
        <p><code>{job.skillsRequired}</code></p>
      </div>

      {/* Simple Apply Box */}
      <div className="card">
        <h3>Application Portal</h3>
        {!currentUser ? (
          <p>Please <a href="#" onClick={() => setCurrentPage('login')}>Login as a Candidate</a> to apply for this job posting.</p>
        ) : currentUser.role !== 'candidate' ? (
          <p>You are logged in as an <strong>{currentUser.role}</strong>. Only candidates can apply for jobs.</p>
        ) : hasApplied ? (
          <p style={{ color: 'green', fontWeight: 'bold' }}>You have already applied for this job listing. Check your Tracker tab.</p>
        ) : (
          <form onSubmit={handleApplySubmit}>
            <div className="form-group">
              <label>Cover Letter / Pitch</label>
              <textarea 
                className="form-control" 
                placeholder="Write a short statement about why you fit this role..." 
                value={coverLetter} 
                onChange={(e) => setCoverLetter(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn">Submit Application</button>
          </form>
        )}
      </div>
    </div>
  );
}

// 6. Candidate Profile Page Component
function CandidateProfile({ currentUser, setCurrentUser }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [skills, setSkills] = useState(currentUser?.skills || '');
  const [education, setEducation] = useState(currentUser?.education || '');
  const [experience, setExperience] = useState(currentUser?.experience || '');
  const [resumeName, setResumeName] = useState(currentUser?.resumeName || '');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, location, bio, skills, education, experience, resumeName
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Profile update failed!');
        return;
      }
      setCurrentUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Network error during profile update.');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h2>My Profile Resume</h2>
      <form onSubmit={handleProfileSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Location / City</label>
          <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="form-group">
          <label>About Me</label>
          <textarea className="form-control" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Technical Skills</label>
          <input type="text" className="form-control" placeholder="e.g. HTML, CSS, JavaScript" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Highest Education</label>
          <input type="text" className="form-control" placeholder="e.g. BS Computer Science" value={education} onChange={(e) => setEducation(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Work Experience</label>
          <textarea className="form-control" placeholder="Describe your last job..." value={experience} onChange={(e) => setExperience(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Resume File Name (Mock Upload)</label>
          <input type="text" className="form-control" placeholder="resume_name.pdf" value={resumeName} onChange={(e) => setResumeName(e.target.value)} />
        </div>
        <button type="submit" className="btn">Save Profile Changes</button>
      </form>
    </div>
  );
}

// 7. Application Tracking Page Component
function ApplicationTracking({ applications, jobs, currentUser }) {
  const myApps = applications.filter(app => app.candidateId === currentUser.id);

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? `${job.title} (${job.companyName})` : 'Unknown Job';
  };

  return (
    <div>
      <h2>My Applications Tracker</h2>
      {myApps.length === 0 ? (
        <p>You have not submitted applications for any job listings yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Job Title / Company</th>
              <th>Date Applied</th>
              <th>Cover Letter Statement</th>
              <th>Current Status</th>
            </tr>
          </thead>
          <tbody>
            {myApps.map((app) => (
              <tr key={app.id}>
                <td><strong>{getJobTitle(app.jobId)}</strong></td>
                <td>{(app.appliedAt || app.createdAt) ? (app.appliedAt || app.createdAt).split('T')[0] : ''}</td>
                <td>{app.coverLetter}</td>
                <td>
                  <span className={`badge ${
                    app.status === 'Hired' ? 'badge-success' :
                    app.status === 'Rejected' ? 'badge-danger' :
                    app.status === 'Shortlisted' ? 'badge-warning' :
                    ''
                  }`}>
                    {app.status || 'Applied'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 8. Employer Dashboard Page Component
function EmployerDashboard({ jobs, setJobs, applications, setApplications, users, currentUser, setCurrentPage, setSelectedJobId }) {
  const [activeAppId, setActiveAppId] = useState(null); // Used to show simple candidate modal review

  const myJobs = jobs.filter(j => j.employerId === currentUser.id);
  const myJobIds = myJobs.map(j => j.id);
  const receivedApps = applications.filter(app => myJobIds.includes(app.jobId));

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Failed to delete job.');
        return;
      }
      setJobs(jobs.filter(j => j.id !== jobId));
      setApplications(applications.filter(app => app.jobId !== jobId));
      alert('Listing removed successfully.');
    } catch (err) {
      console.error(err);
      alert('Network error during job deletion.');
    }
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };

  const getCandidateName = (candidateId) => {
    const user = users.find(u => u.id === candidateId);
    return user ? user.name : 'Unknown Candidate';
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Failed to update status.');
        return;
      }
      setApplications(applications.map(app => app.id === appId ? data : app));
      alert('Status updated successfully!');
      setActiveAppId(null);
    } catch (err) {
      console.error(err);
      alert('Network error during status update.');
    }
  };

  const selectedApp = applications.find(app => app.id === activeAppId);
  const selectedCandidate = selectedApp ? users.find(u => u.id === selectedApp.candidateId) : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Employer Recruiter Dashboard</h2>
        <button onClick={() => setCurrentPage('post-job')} className="btn">Post a New Job</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Left Side: My Posted Listings */}
        <div>
          <h3>My Active Job Listings</h3>
          {myJobs.length === 0 ? (
            <p>You have not posted any jobs yet.</p>
          ) : (
            myJobs.map((job) => (
              <div key={job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{job.title}</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>{job.location} | {job.type}</p>
                </div>
                <div>
                  <button onClick={() => { setSelectedJobId(job.id); setCurrentPage('job-detail'); }} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}>Details</button>
                  <button onClick={() => handleDeleteJob(job.id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Received Applications */}
        <div>
          <h3>Applications Received</h3>
          {receivedApps.length === 0 ? (
            <p>No candidates have applied to your jobs yet.</p>
          ) : (
            receivedApps.map((app) => (
              <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{getCandidateName(app.candidateId)}</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>For: {getJobTitle(app.jobId)}</p>
                  <span className="badge">{app.status || 'Applied'}</span>
                </div>
                <button onClick={() => setActiveAppId(app.id)} className="btn">Review Application</button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Simple Modal Review Popup */}
      {selectedApp && selectedCandidate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', backgroundColor: '#fff', position: 'relative' }}>
            <button onClick={() => setActiveAppId(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
            <h3>Review: {selectedCandidate.name}</h3>
            <p><strong>Candidate Email:</strong> {selectedCandidate.email}</p>
            <p><strong>Phone:</strong> {selectedCandidate.phone || 'N/A'}</p>
            <p><strong>Location:</strong> {selectedCandidate.location || 'N/A'}</p>
            <p><strong>Bio:</strong> {selectedCandidate.bio || 'N/A'}</p>
            <p><strong>Skills:</strong> {selectedCandidate.skills || 'N/A'}</p>
            <p><strong>Education:</strong> {selectedCandidate.education || 'N/A'}</p>
            <p><strong>Experience:</strong> {selectedCandidate.experience || 'N/A'}</p>
            <p><strong>Resume Filename:</strong> <u>{selectedCandidate.resumeName || 'No resume file attached'}</u></p>
            
            <hr />
            <p><strong>Cover Letter text:</strong><br />"{selectedApp.coverLetter}"</p>
            
            <div style={{ display: 'flex', gap: '5px', marginTop: '15px' }}>
              <button onClick={() => handleUpdateStatus(selectedApp.id, 'Shortlisted')} className="btn btn-secondary">Shortlist</button>
              <button onClick={() => handleUpdateStatus(selectedApp.id, 'Hired')} className="btn">Hire Candidate</button>
              <button onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')} className="btn btn-danger">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 9. Post a Job Page Component
function PostJob({ jobs, setJobs, currentUser, setCurrentPage }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Frontend Development');
  const [type, setType] = useState('Full-time');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Junior');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [description, setDescription] = useState('');
  const [qualifications, setQualifications] = useState('');

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerId: currentUser.id,
          companyName: currentUser.companyName || 'My Company',
          title,
          category,
          type,
          location,
          salaryRange,
          experienceLevel,
          skillsRequired,
          description,
          qualifications
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Failed to post job.');
        return;
      }
      setJobs([data, ...jobs]);
      alert('Job opportunity posted successfully!');
      setCurrentPage('employer-dashboard');
    } catch (err) {
      console.error(err);
      alert('Network error during posting job.');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h2>Post a New Job</h2>
      <form onSubmit={handlePostSubmit}>
        <div className="form-group">
          <label>Job Title</label>
          <input type="text" className="form-control" placeholder="e.g. Frontend React Intern" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label>Job Category</label>
          <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Frontend Development">Frontend Development</option>
            <option value="Backend Development">Backend Development</option>
            <option value="Full Stack Development">Full Stack Development</option>
            <option value="Design & Creative">Design & Creative</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Job Type</label>
            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Experience Level</label>
            <select className="form-control" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
              <option value="Junior">Junior (Entry-level)</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" className="form-control" placeholder="e.g. San Francisco, CA or Remote" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Salary Package</label>
          <input type="text" className="form-control" placeholder="e.g. $60,000 - $80,000" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Required Skills (Comma separated)</label>
          <input type="text" className="form-control" placeholder="e.g. HTML, CSS, React" value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Job Description</label>
          <textarea className="form-control" rows={4} placeholder="Describe duties..." value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Candidate Qualifications</label>
          <textarea className="form-control" rows={2} placeholder="Describe requested degrees/skills..." value={qualifications} onChange={(e) => setQualifications(e.target.value)} required />
        </div>

        <button type="submit" className="btn">Post Opportunity</button>{' '}
        <button type="button" onClick={() => setCurrentPage('employer-dashboard')} className="btn btn-secondary">Cancel</button>
      </form>
    </div>
  );
}

// 10. Admin Panel Page Component
function AdminPanel({ users, setUsers, jobs, setJobs, applications, setApplications, currentUser }) {
  const [activeTab, setActiveTab] = useState('users'); // users, jobs

  const toggleSuspension = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/suspend`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Failed to toggle user suspension.');
        return;
      }
      setUsers(users.map(u => u.id === userId ? data : u));
      alert(`User is now ${data.isSuspended ? 'Suspended' : 'Unsuspended'}`);
    } catch (err) {
      console.error(err);
      alert('Network error during suspension update.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their posted jobs or submitted applications.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Failed to delete user.');
        return;
      }
      setUsers(users.filter(u => u.id !== userId));
      // Cascade update locally
      setApplications(applications.filter(app => app.candidateId !== userId));
      setJobs(jobs.filter(job => job.employerId !== userId));
      alert('User account deleted.');
    } catch (err) {
      console.error(err);
      alert('Network error during user deletion.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Failed to delete job.');
        return;
      }
      setJobs(jobs.filter(j => j.id !== jobId));
      setApplications(applications.filter(app => app.jobId !== jobId));
      alert('Job posting deleted.');
    } catch (err) {
      console.error(err);
      alert('Network error during job deletion.');
    }
  };

  return (
    <div>
      <h2>Administrative Panel</h2>
      
      {/* Simple stats bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center' }}>
          <strong>Total Accounts:</strong> {users.length}
        </div>
        <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center' }}>
          <strong>Job Postings:</strong> {jobs.length}
        </div>
        <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center' }}>
          <strong>Submitted Applications:</strong> {applications.length}
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => setActiveTab('users')} className={`btn ${activeTab === 'users' ? '' : 'btn-secondary'}`} style={{ marginRight: '10px' }}>Manage Users</button>
        <button onClick={() => setActiveTab('jobs')} className={`btn ${activeTab === 'jobs' ? '' : 'btn-secondary'}`}>Manage Jobs</button>
      </div>

      {activeTab === 'users' ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Account Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role.toUpperCase()}</td>
                <td>
                  {u.id !== currentUser.id ? (
                    <>
                      <button onClick={() => toggleSuspension(u.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '5px' }}>
                        {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        Delete
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#666' }}>Active Admin Session</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Job Title</th>
              <th>Company Name</th>
              <th>Location</th>
              <th>Category</th>
              <th>Listing Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td>{job.title}</td>
                <td>{job.companyName}</td>
                <td>{job.location}</td>
                <td>{job.category}</td>
                <td>
                  <button onClick={() => handleDeleteJob(job.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    
  );
}
