import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Component imports
import Navbar from './Components/Navbar';
import Loader2 from './Components/Loader2';

// Page imports
import HomeFeed from './Pages/HomeFeed';
import Profile from './Pages/Profile';
import Network from './Pages/Network';
import Login from './Pages/Login';
import Register from './Pages/Register';
import JobListings from './Pages/JobListings';
import JobDetail from './Pages/JobDetail';
import CandidateDashboard from './Pages/CandidateDashboard';
import EmployerDashboard from './Pages/EmployerDashboard';
import PostJob from './Pages/PostJob';
import AdminPanel from './Pages/AdminPanel';
import AboutUs from './Pages/AboutUs';

// CSS imports
import './Components/Loader2.css';
import './index.css';

const API_BASE_URL = "https://skillfetch-portal.onrender.com";

export default function App() {
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState(false);
  const [jobs, setJobs] = useState([]);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  
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

  // Fetch updated info when user profile refreshes
  const refreshUserProfile = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (res.ok) {
        const allUsers = await res.json();
        const updatedMe = allUsers.find(u => u.id === currentUser.id || u._id === currentUser.id);
        if (updatedMe) {
          setCurrentUser(updatedMe);
          localStorage.setItem('currentUser', JSON.stringify(updatedMe));
        }
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  };

  // Run on page focus or transition to keep profile updated
  useEffect(() => {
    if (currentUser) {
      refreshUserProfile();
    }
  }, [currentPage]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
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

      // 2. Fetch users list (required for Employer reviews, and Admin panel)
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
      <Toaster />

      {/* Navigation Header */}
      <Navbar 
        currentUser={currentUser} 
        currentPage={currentPage}  
        setCurrentPage={setCurrentPage} 
        handleLogout={handleLogout} 
      />

      {/* Main Pages Router */}
      <main className="container page-transition" key={currentPage} style={{ paddingTop: '80px', minHeight: 'calc(100vh - 220px)' }}>

        {loadingJobs && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 />
          </div>
        )}
        
        {jobsError && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '15px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>⚠️ Cannot reach the backend server.</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Please check connection status or retry.</p>
            </div>
            <button onClick={fetchJobs} className="btn" style={{ whiteSpace: 'nowrap', marginLeft: '15px' }}>🔄 Retry</button>
          </div>
        )}

        {/* Route definitions */}
        {currentPage === 'home' && (
          <HomeFeed 
            jobs={jobs}
            currentUser={currentUser} 
            setCurrentPage={setCurrentPage} 
            setSelectedJobId={setSelectedJobId}
            applications={applications}
            setApplications={setApplications}
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {currentPage === 'profile' && (
          <Profile 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {currentPage === 'network' && (
          <Network 
            currentUser={currentUser}
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {currentPage === 'login' && (
          <Login 
            setCurrentUser={setCurrentUser} 
            setCurrentPage={setCurrentPage} 
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {currentPage === 'register' && (
          <Register 
            setCurrentPage={setCurrentPage} 
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {currentPage === 'job-listings' && (
          <JobListings 
            jobs={jobs} 
            setCurrentPage={setCurrentPage} 
            setSelectedJobId={setSelectedJobId} 
            currentUser={currentUser} 
          />
        )}

        {currentPage === 'job-detail' && (
          <JobDetail 
            jobs={jobs} 
            selectedJobId={selectedJobId} 
            currentUser={currentUser} 
            applications={applications} 
            setApplications={setApplications} 
            setCurrentPage={setCurrentPage} 
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {currentPage === 'candidate-dashboard' && (
          <CandidateDashboard 
            currentUser={currentUser} 
            applications={applications} 
            jobs={jobs} 
            setCurrentPage={setCurrentPage}
          />
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
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {currentPage === 'post-job' && (
          <PostJob 
            jobs={jobs} 
            setJobs={setJobs} 
            currentUser={currentUser} 
            setCurrentPage={setCurrentPage} 
            API_BASE_URL={API_BASE_URL}
          />
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
            API_BASE_URL={API_BASE_URL}
          />
        )}
        
        {currentPage === 'about' && (
          <AboutUs 
            setCurrentPage={setCurrentPage} 
          />
        )}

      </main>
    
      {/* Page Footer */}
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
              <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>Home Feed</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('about'); }}>About Us</a></li>
              {currentUser && (
                <li><a href="#" onClick={(e) => {
                  e.preventDefault();
                  if (currentUser.role === 'employer') setCurrentPage('employer-dashboard');
                  else if (currentUser.role === 'admin') setCurrentPage('admin-panel');
                  else setCurrentPage('candidate-dashboard');
                }}>Dashboard</a></li>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Support</h4>
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
