import React, { useState, useEffect } from 'react';
import './Components/Loader.css'; // Importing the Loader CSS for the loading spinner
import Loader from './Components/Loader'; // Importing the Loader component to show while fetching data
import { Toaster, toast } from "react-hot-toast";
import Loader2 from './Components/Loader2'; // Importing the second loader for backend connection status
import './Components/Loader2.css';
import { FaMapMarkerAlt, FaClock, FaEnvelope, FaPhone, FaDownload, FaTimes } from 'react-icons/fa';


//const API_BASE_URL = 'http://localhost:5001/api';

const API_BASE_URL = "https://skillfetch-portal.onrender.com";


// ==================== APP CONTAINER COMPONENT ====================


export default function App() {
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
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
      const res = await fetch(`${API_BASE_URL}/api/jobs`);
      if (!res.ok) throw new Error("Could not fetch jobs");
      const data = await res.json();
      console.log("API response:", data);
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobsError(true);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

// Automatically scroll to top whenever the page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // This tells the browser to animate the scroll!
    });
  }, [currentPage]);
  
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
        let appUrl = `${API_BASE_URL}/api/applications`;
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
          const userRes = await fetch(`${API_BASE_URL}/api/users`);
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
    toast.success("Logged out successfully!");
  };

  
    
    return (
    <div className="app-container">
      {/* Toast notifications container */}
      <Toaster />

      {/* Header Navigation */}
      <header className="header">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage("home");
          }}
          className="logo-link"
        >
          <img
            src="/skillfetch2.png"
            alt="SkillFetch Logo"
            className="logo-image"
          />
        </a>

        <nav>
          <div className="nav-bottom" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* IF NO USER IS LOGGED IN */}
            {!currentUser ? (
              <>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage("login");
                  }}
                  className="btn btn-secondary nav-btn"
                >
                  Login
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage("register");
                  }}
                  className="btn btn-secondary nav-btn"
                >
                  Register
                </a>
              </>
            ) : (
              /* IF A USER IS LOGGED IN */
              <>
                {currentUser.role === 'candidate' && (
                  <>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("tracker"); }} style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                      My Tracker
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("profile"); }} style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                      My Profile
                    </a>
                  </>
                )}

                {currentUser.role === 'employer' && (
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("employer-dashboard"); }} style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                    Employer Dashboard
                  </a>
                )}

                {currentUser.role === 'admin' && (
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("admin-panel"); }} style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                    Admin Panel
                  </a>
                )}

                <span style={{ fontSize: '14px', color: '#9ca3af', borderLeft: '1px solid #e5e7eb', paddingLeft: '15px' }}>
                  Hi, {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
                </span>

                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary nav-btn" 
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

  

      {/* Main Pages Content Router */}
      {/* The 'key' prop forces React to replay the animation every time currentPage changes */}
      <main className="container page-transition" key={currentPage}>

       
        {/* Backend connection status banner */}
        {loadingJobs && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="loader2"></div>
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
          <Home jobs={jobs} setCurrentPage={setCurrentPage} setSelectedJobId={setSelectedJobId}  loadingJobs={loadingJobs} jobsError={jobsError}/>
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
        
        {/* --- ADD THIS NEW BLOCK --- */}
        {currentPage === 'about' && (
          <AboutUs setCurrentPage={setCurrentPage} />
        )}

      </main>

      {/* Simple Footer */}
      <footer className="footer">
  <div className="container footer-content">
    
    <div className="footer-section">
      <h3>SkillFetch</h3>
      <p>
        Connecting talented professionals with top employers.
        Find your dream job and grow your career.
      </p>
    </div>

    <div className="footer-section">
      <h4>Quick Links</h4>
      <ul>
        <li><a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage('home');
            }}
          >
            Home
          </a></li>
        <li><a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage('job-listings');
            }}
          >
            Browse Jobs
          </a></li>
        <li><a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              // Directing employers to the login/register screen
              setCurrentPage('login'); 
            }}
          >
            Employers
          </a></li>
       <li>
  <a 
    href="#" 
    onClick={(e) => {
      e.preventDefault();
      setCurrentPage('about');
    }}
  >
    About Us
  </a>
</li>
      </ul>
    </div>

    <div className="footer-section">
      <h4>Contact</h4>
      <p>📧 support@skillfetch.com</p>
      <p>📞 +91 98765 43210</p>
      <p>📍 Kerala, India</p>
    </div>

  </div>

  <div className="footer-bottom">
    <p>
      © 2026 SkillFetch Job Portal. All Rights Reserved. Made with ❤️
    </p>
  </div>
</footer>
    </div>
  );
}

// ==================== PAGE COMPONENTS ====================

// 11. About Us Page Component
function AboutUs({ setCurrentPage }) {
  
  // Update your actual team details here!
  const teamMembers = [
    { name: 'Dixon Anto', role: 'Backend Developer', github: 'https://github.com/DixonAnto' },
    { name: 'Karthik', role: 'Frontend Developer', github: 'https://github.com/karthi-1010' },
    { name: 'Ajay', role: 'Backend Developer', github: 'https://github.com/yourusername3' },
    { name: 'Fasil', role: 'Frontend Developer', github: 'https://github.com/fasilv29' },
    { name: 'Jain', role: 'Backend Developer', github: 'https://github.com/jain-commits' },
  ];

  return (
    <div className="card" style={{ padding: '40px 20px', maxWidth: '850px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>About SkillFetch</h2>
      
      <div style={{ lineHeight: '1.8', fontSize: '16px', color: '#444' }}>
        <p>
          Welcome to <strong>SkillFetch</strong>, a comprehensive professional networking and job discovery platform. Designed with a seamless user experience in mind, our goal is to bridge the gap between talented job seekers and actively hiring recruiters.
        </p>
        
        <p>
          Whether you are a professional looking to take the next step in your career, or an employer searching for the perfect candidate to join your team, SkillFetch provides the tools you need:
        </p>

        <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
          <li><strong>For Job Seekers:</strong> Browse open roles, pitch your skills, submit applications, and track your hiring status all in one place.</li>
          <li><strong>For Employers & Recruiters:</strong> Post job listings, manage incoming applications, and shortlist top-tier talent through an intuitive dashboard.</li>
        </ul>

        <hr style={{ borderColor: '#eeeeee', margin: '40px 0' }} />

        {/* Team Section Header */}
        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>The Team Behind SkillFetch</h3>
        <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '15px' }}>
          SkillFetch is the proud result of a collaborative project built by a dedicated team of 5 members. 
        </p>

        {/* Modern Team Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {teamMembers.map((member, index) => (
            <div key={index} style={{
              border: '1px solid #eaeaea',
              borderRadius: '12px',
              padding: '20px 10px',
              textAlign: 'center',
              backgroundColor: '#fafafa',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
              {/* Profile Avatar Circle */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#0056b3', // Uses your app's primary blue
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto 15px auto'
              }}>
                {member.name.charAt(0)} {/* Shows the first letter of their name */}
              </div>
              
              <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#333' }}>{member.name}</h4>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#777' }}>{member.role}</p>
              
              {/* GitHub Link Button */}
              <a 
                href={member.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none', display: 'inline-block' }}
              >
                View GitHub
              </a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <button onClick={() => setCurrentPage('job-listings')} className="btn">
            Start Browsing Jobs
          </button>
        </div>
      </div>
    </div>
  );
}
// 1. Home Page Component
function Home({ jobs, setCurrentPage, setSelectedJobId, loadingJobs, jobsError }) {
  // Get 3 most recent jobs
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const recentJobs = safeJobs.slice(0, 3);

  return (
    <div>
    {/* Compact Welcome Card */}
<div className="card" style={{ 
  textAlign: 'center', 
  padding: '30px 20px',    /* Slightly reduced padding for a tighter look */
  maxWidth: '650px',       /* This restricts how wide the card can get */
  margin: '0 auto 40px'    /* Centers the card and adds space below it */
}}>
  <h1 style={{ fontSize: '32px', marginBottom: '15px' }}>
    Welcome to SkillFetch
  </h1>
  
  <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6', marginBottom: '25px' }}>
    Accelerate Your Career. Connect with top employers, <br />
    discover roles that match your skills, and apply in seconds.
  </p>
  
  <button onClick={() => setCurrentPage('job-listings')} className="btn">
    Search All Jobs
  </button>
</div>

{loadingJobs ? (
  <Loader />
) : jobsError ? (
  <p>Failed to load jobs. Please try again later.</p>
) : recentJobs.length === 0 ? (
  <p>Oops! There are no job listings available.</p>
) : (
  recentJobs.map((job) => (
    <div
      key={job.id}
      className="card"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {/* Logo display with fallback */}
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={`${job.companyName} logo`}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "8px",
              objectFit: "contain",
              border: "1px solid #eee",
            }}
          />
        ) : (
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "8px",
              backgroundColor: "#0056b3",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            {job.companyName
              ? job.companyName.charAt(0).toUpperCase()
              : "J"}
          </div>
        )}

        <div>
          <h3 style={{ margin: "0 0 2px 0", color: "#111827" }}>
            {job.title}
          </h3>
          <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
            <strong>{job.companyName}</strong> &bull; {job.type} &bull; {job.location}
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          setSelectedJobId(job.id);
          setCurrentPage("job-detail");
        }}
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
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Wrong email or password!');
        return;
      }
      setCurrentUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      toast.success("Logged in successfully!");
      if (data.role === 'admin') {
        setCurrentPage('admin-panel');
      } else if (data.role === 'employer') {
        setCurrentPage('employer-dashboard');
      } else {
        setCurrentPage('job-listings');
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error during login.");
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
        toast.error(data.message || 'Registration failed!');
        return;
      }
      toast.success("Account created successfully! You can login now.");
      setCurrentPage('login');
    } catch (err) {
      console.error(err);
      toast.error("Network error during registration.");
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
      toast.error('You must log in as a Candidate to apply!');
      setCurrentPage('login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
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
        toast.error(data.message || 'Application failed!');
        return;
      }
      setApplications([data, ...applications]);
      toast.success('Applied successfully!');
      setCurrentPage('tracker');
    } catch (err) {
      console.error(err);
      toast.error('Network error during application submission.');
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


// State to hold the actual file and upload status messages
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, location, bio, skills, education, experience, resumeName
        })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Profile update failed!');
        return;
      }
      setCurrentUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Network error during profile update.');
    }
  };

  // 1. Handle File Selection & Validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate File Size (e.g., Max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setUploadStatus('❌ File is too large. Maximum size is 5MB.');
        setResumeFile(null);
        e.target.value = null; // Reset the input
        return;
      }

      // Validate File Type (Only PDF or Word)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setUploadStatus('❌ Please upload a valid PDF or Word document.');
        setResumeFile(null);
        e.target.value = null; // Reset the input
        return;
      }

      setResumeFile(file);
      setUploadStatus(''); // Clear any previous errors
    }
  };

// 2. Handle the Actual Upload Process
  const handleUpload = async () => {
    if (!resumeFile) {
      setUploadStatus('⚠️ Please select a file first.');
      return;
    }

    setUploadStatus('⏳ Uploading...');

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('userId', currentUser.id); 

    try {
      // THE REAL BACKEND CALL
      const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
        method: 'POST',
        body: formData, 
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus('✅ Resume uploaded successfully!');
        
        // Update the local user state so the UI knows about the resume immediately
        const updatedUser = { 
          ...currentUser, 
          resumeName: data.resumeName,
          resume: { name: data.resumeName } // Match the new DB structure
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        setResumeFile(null); 
      } else {
        setUploadStatus('❌ Upload failed. Please try again.');
      }

    } catch (error) {
      console.error(error);
      setUploadStatus('❌ An error occurred connecting to the server.');
    }
  };



  return (
    <div>
      {/* --- PROFILE DETAILS FORM --- */}
      <div className="card" style={{ maxWidth: '600px', margin: '20px auto' }}>
        <h2>My Profile Details</h2>
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
          
          <button type="submit" className="btn">Save Profile Changes</button>
        </form>
      </div>

      {/* --- RESUME UPLOAD SECTION (Separated from form above) --- */}
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '30px' }}>
        <h2 style={{ marginBottom: '5px' }}>Upload Your Resume</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
          Employers will use this document to evaluate your application. Accepted formats: PDF, DOC, DOCX (Max 5MB).
        </p>

        <div style={{
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '30px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          marginBottom: '20px'
        }}>
          <input 
            type="file" 
            id="resume-upload"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }} 
          />
          
          <label 
            htmlFor="resume-upload" 
            className="btn btn-secondary" 
            style={{ cursor: 'pointer', display: 'inline-block', marginBottom: '10px' }}
          >
            Browse Files
          </label>
          
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
            {resumeFile ? `Selected: ${resumeFile.name}` : 'No file selected'}
          </div>
        </div>

        {uploadStatus && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '10px', 
            borderRadius: '6px',
            backgroundColor: uploadStatus.includes('✅') ? '#dcfce7' : '#fee2e2',
            color: uploadStatus.includes('✅') ? '#166534' : '#991b1b',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {uploadStatus}
          </div>
        )}

        <button 
          type="button" 
          onClick={handleUpload} 
          className="btn"
          disabled={!resumeFile || uploadStatus.includes('⏳')}
          style={{ width: '100%', opacity: (!resumeFile || uploadStatus.includes('⏳')) ? 0.5 : 1 }}
        >
          {uploadStatus.includes('⏳') ? 'Uploading...' : 'Upload Resume Document'}
        </button>
      </div>
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
  const [activeAppId, setActiveAppId] = useState(null);

  // --- Derived Data (Optimized Filtering) ---
  const myJobs = jobs.filter(j => j.employerId === currentUser.id);
  const myJobIds = myJobs.map(j => j.id);
  const receivedApps = applications.filter(app => myJobIds.includes(app.jobId));
  
  // Stats Calculations
  const totalHires = receivedApps.filter(app => app.status === 'Hired').length;
  const totalShortlisted = receivedApps.filter(app => app.status === 'Shortlisted').length;

  // --- Helpers ---
  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : 'Unknown Job';
  };

  const getCandidateName = (candidateId) => {
    const user = users.find(u => u.id === candidateId);
    return user ? user.name : 'Unknown Candidate';
  };

  const getBadgeClass = (status) => {
    switch(status) {
      case 'Hired': return 'badge-hired';
      case 'Shortlisted': return 'badge-shortlisted';
      case 'Rejected': return 'badge-rejected';
      default: return 'badge-applied';
    }
  };

  // --- Handlers ---
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This will also delete all associated applications.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete job.');
      
      setJobs(jobs.filter(j => j.id !== jobId));
      setApplications(applications.filter(app => app.jobId !== jobId));
      toast.success('Listing removed successfully.');
    } catch (err) {
      toast.error('Network error during job deletion.');
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status.');
      
      const data = await response.json();
      setApplications(applications.map(app => app.id === appId ? data : app));
      toast.success(`Candidate marked as ${newStatus}!`);
      setActiveAppId(null); // Close modal automatically
    } catch (err) {
      toast.error('Network error during status update.');
    }
  };

  const selectedApp = applications.find(app => app.id === activeAppId);
  const selectedCandidate = selectedApp ? users.find(u => u.id === selectedApp.candidateId) : null;

  return (
    <div>
      {/* Header Area */}
      <div className="dashboard-header">
        <div>
          <h2 style={{ margin: 0 }}>Employer Dashboard</h2>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>Manage your job postings and review candidates.</p>
        </div>
        <button onClick={() => setCurrentPage('post-job')} className="btn">
          + Post New Job
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Active Listings</h4>
          <div className="stat-number">{myJobs.length}</div>
        </div>
        <div className="stat-card">
          <h4>Total Applicants</h4>
          <div className="stat-number">{receivedApps.length}</div>
        </div>
        <div className="stat-card">
          <h4>Shortlisted</h4>
          <div className="stat-number">{totalShortlisted}</div>
        </div>
        <div className="stat-card">
          <h4>Hired</h4>
          <div className="stat-number" style={{ color: '#166534' }}>{totalHires}</div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="dashboard-content-grid">
        
        {/* Left Side: My Posted Listings */}
        <div>
          <h3 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginBottom: '20px' }}>
            Active Job Listings
          </h3>
          
          {myJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
              <p>You have not posted any jobs yet.</p>
              <button onClick={() => setCurrentPage('post-job')} className="btn btn-secondary" style={{ marginTop: '10px' }}>Create your first listing</button>
            </div>
          ) : (
            myJobs.map((job) => (
              <div key={job.id} className="list-item-card">
                <div>
                  <strong style={{ fontSize: '16px', color: '#111827' }}>{job.title}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}><FaMapMarkerAlt style={{ marginRight: '4px' }} /> {job.location}</span>
                    <span>|</span>
                    <span style={{ display: 'flex', alignItems: 'center' }}><FaClock style={{ marginRight: '4px' }} /> {job.type}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setSelectedJobId(job.id); setCurrentPage('job-detail'); }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>View</button>
                  <button onClick={() => handleDeleteJob(job.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Received Applications */}
        <div>
          <h3 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginBottom: '20px' }}>
            Recent Applications
          </h3>

          {receivedApps.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
              <p>No candidates have applied to your jobs yet.</p>
            </div>
          ) : (
            receivedApps.map((app) => (
              <div key={app.id} className="list-item-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '16px', color: '#111827' }}>{getCandidateName(app.candidateId)}</strong>
                    <span className={`badge ${getBadgeClass(app.status)}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {app.status || 'Applied'}
                    </span>
                  </div>
                  <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                    Applying for: <strong>{getJobTitle(app.jobId)}</strong>
                  </p>
                </div>
                <button onClick={() => setActiveAppId(app.id)} className="btn" style={{ padding: '6px 14px', fontSize: '13px' }}>
                  Review
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Candidate Review Modal */}

    {/* Sleek ATS Split-Screen Review Modal */}
      {selectedApp && selectedCandidate && (
        <div className="review-modal-overlay">
          <div className="review-modal-container">
            
            {/* Header */}
            <div className="review-modal-header">
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a' }}>
                  {selectedCandidate.name}
                </h2>
                <span className={`badge ${getBadgeClass(selectedApp.status)}`} style={{ fontSize: '12px' }}>
                  Status: {selectedApp.status || 'Applied'}
                </span>
              </div>
              <button 
                onClick={() => setActiveAppId(null)} 
                style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Split Body */}
            <div className="review-modal-body">
              
              {/* Left Panel: Info & Actions */}
              <div className="review-left-panel">
                
                {/* Mobile-Only PDF Button */}
                {(selectedCandidate.resume?.name || selectedCandidate.resumeName) && (
                  <div className="mobile-resume-action">
                    <a 
                      href={`${API_BASE_URL}/api/users/${selectedCandidate.id}/resume`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                    >
                      <FaDownload /> Open Resume PDF
                    </a>
                  </div>
                )}

                <div className="info-section">
                  <h5>Contact Details</h5>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><FaEnvelope style={{ color: '#94a3b8', marginRight: '6px' }}/> {selectedCandidate.email}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><FaPhone style={{ color: '#94a3b8', marginRight: '6px' }}/> {selectedCandidate.phone || 'N/A'}</p>
                  <p style={{ margin: 0, fontSize: '14px' }}><FaMapMarkerAlt style={{ color: '#94a3b8', marginRight: '6px' }}/> {selectedCandidate.location || 'N/A'}</p>
                </div>

                <div className="info-section">
                  <h5>Professional Summary</h5>
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', lineHeight: '1.5' }}><strong>Skills:</strong> {selectedCandidate.skills || 'Not listed'}</p>
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', lineHeight: '1.5' }}><strong>Exp:</strong> {selectedCandidate.experience || 'Not listed'}</p>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}><strong>Edu:</strong> {selectedCandidate.education || 'Not listed'}</p>
                </div>

                <div className="info-section" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h5>Applicant Pitch</h5>
                  <p style={{ margin: 0, fontStyle: 'italic', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                    "{selectedApp.coverLetter}"
                  </p>
                </div>

                {/* Actions */}
                <div className="action-buttons-grid">
                  <button onClick={() => handleUpdateStatus(selectedApp.id, 'Shortlisted')} className="btn" style={{ background: '#fef08a', color: '#854d0e', border: '1px solid #fde047' }}>⭐ Shortlist</button>
                  <button onClick={() => handleUpdateStatus(selectedApp.id, 'Hired')} className="btn" style={{ background: '#166534', color: '#fff', border: 'none' }}>✅ Hire</button>
                  <button onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')} className="btn btn-danger">❌ Reject</button>
                </div>
              </div>

              {/* Right Panel: Laptop PDF Viewer */}
              <div className="review-right-panel">
                {(selectedCandidate.resume?.name || selectedCandidate.resumeName) ? (
                  <iframe 
                    src={`${API_BASE_URL}/api/users/${selectedCandidate.id}/resume`} 
                    title="Resume Preview"
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', backgroundColor: '#f1f5f9' }}>
                    <FaDownload style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: '500' }}>No resume uploaded</p>
                  </div>
                )}
              </div>

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
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
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
        toast.error(data.message || 'Failed to post job.');
        return;
      }
      setJobs([data, ...jobs]);
      toast.success('Job opportunity posted successfully!');
      setCurrentPage('employer-dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Network error during posting job.');
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
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/suspend`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Failed to toggle user suspension.');
        return;
      }
      setUsers(users.map(u => u.id === userId ? data : u));
      toast.success(`User is now ${data.isSuspended ? 'Suspended' : 'Unsuspended'}`);
    } catch (err) {
      console.error(err);
      toast.error('Network error during suspension update.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their posted jobs or submitted applications.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete user.');
        return;
      }
      setUsers(users.filter(u => u.id !== userId));
      // Cascade update locally
      setApplications(applications.filter(app => app.candidateId !== userId));
      setJobs(jobs.filter(job => job.employerId !== userId));
      toast.success('User account deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Network error during user deletion.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete job.');
        return;
      }
      setJobs(jobs.filter(j => j.id !== jobId));
      setApplications(applications.filter(app => app.jobId !== jobId));
      toast.success('Job posting deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Network error during job deletion.');
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
