import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaRegBookmark } from 'react-icons/fa';
import { toast } from 'react-hot-toast'; // Added toast for notifications

const API_BASE_URL = "https://skillfetch-portal.onrender.com";

// FIX 1: Added currentUser, applications, and setApplications to props
function JobSearchEngine({ jobs = [], setCurrentPage, currentUser, applications = [], setApplications }) {
  // --- States ---
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeFilter, setActiveFilter] = useState('');
  
  // Application specific states
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  // Dropdown visibility states
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);

  // --- Auto-Complete Logic (Optimized) ---
  const uniqueTitles = useMemo(() => [...new Set(jobs.map(j => j.title))].filter(Boolean), [jobs]);
  const uniqueLocations = useMemo(() => [...new Set(jobs.map(j => j.location))].filter(Boolean), [jobs]);

  const titleSuggestions = searchTitle.trim().length > 0 
    ? uniqueTitles.filter(t => t.toLowerCase().includes(searchTitle.toLowerCase())).slice(0, 5)
    : [];

  const locSuggestions = searchLocation.trim().length > 0 
    ? uniqueLocations.filter(l => l.toLowerCase().includes(searchLocation.toLowerCase())).slice(0, 5)
    : [];

  // Reset apply form when selecting a new job
  useEffect(() => {
    setShowApplyForm(false);
    setCoverLetter('');
  }, [selectedJob]);

  // --- Handlers ---
  const handleSearch = () => {
    let results = jobs.filter(job => {
      const matchTitle = job.title.toLowerCase().includes(searchTitle.toLowerCase()) || 
                         (job.companyName && job.companyName.toLowerCase().includes(searchTitle.toLowerCase()));
      const matchLoc = job.location.toLowerCase().includes(searchLocation.toLowerCase());
      return matchTitle && matchLoc;
    });

    if (activeFilter === 'Remote') {
      results = results.filter(j => j.type.toLowerCase().includes('remote') || j.location.toLowerCase().includes('remote'));
    }

    setFilteredJobs(results);
    
    if (results.length > 0) {
      const isStillInResults = results.find(j => (j._id || j.id) === (selectedJob?._id || selectedJob?.id));
      if (!isStillInResults) setSelectedJob(results[0]);
    } else {
      setSelectedJob(null);
    }
    
    setHasSearched(true);
    setShowTitleSuggestions(false);
    setShowLocSuggestions(false);
  };

  // FIX 3: Actual Application Logic
  const handleApplySubmit = async () => {
    try {
      const currentJobId = selectedJob._id || selectedJob.id;
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: currentJobId, candidateId: currentUser.id, coverLetter })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Application failed!');
        return;
      }
      setApplications([data, ...applications]);
      toast.success('Applied successfully!');
      setShowApplyForm(false);
    } catch (err) {
      console.error(err);
      toast.error('Network error during application submission.');
    }
  };

  // Check if current user applied to the selected job
  const currentJobId = selectedJob?._id || selectedJob?.id;
  const hasApplied = currentUser && applications?.some(app => app.jobId === currentJobId && app.candidateId === (currentUser?._id || currentUser?.id));

  // --- Reusable Search Bar UI (Optimized) ---
  const renderSearchBar = () => (
    <div className="search-bar-wrapper">
      
      {/* 1. Job Title Input */}
      <div className="search-input-group" style={{ position: 'relative' }}>
        <FaSearch style={{ color: '#2d2d2d', fontSize: '18px', marginLeft: '8px' }} />
        <input 
          type="text" 
          placeholder="Job title, keywords, or company" 
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          onFocus={() => setShowTitleSuggestions(true)}
          onBlur={() => setShowTitleSuggestions(false)} 
        />
        
        {/* Title Suggestions Dropdown */}
        {showTitleSuggestions && titleSuggestions.length > 0 && (
          <div style={{ 
            position: 'absolute', top: '100%', left: '0', width: '100%', 
            backgroundColor: '#ffffff', border: '1px solid #e4e2e0', borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)', zIndex: 9999, marginTop: '8px', overflow: 'hidden'
          }}>
            {titleSuggestions.map((sug, idx) => (
              <div 
                key={`title-${idx}`} 
                onMouseDown={() => { setSearchTitle(sug); setShowTitleSuggestions(false); }}
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                  borderBottom: idx === titleSuggestions.length - 1 ? 'none' : '1px solid #f3f2f1',
                  color: '#2d2d2d', fontSize: '15px', transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f2f1'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaSearch style={{ color: '#767676', fontSize: '14px' }} /> {sug}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="search-divider"></div>

      {/* 2. Location Input */}
      <div className="search-input-group" style={{ position: 'relative' }}>
        <FaMapMarkerAlt style={{ color: '#2d2d2d', fontSize: '18px' }} />
        <input 
          type="text" 
          placeholder="City, state, zip code, or remote" 
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          onFocus={() => setShowLocSuggestions(true)}
          onBlur={() => setShowLocSuggestions(false)}
        />

        {/* Location Suggestions Dropdown */}
        {showLocSuggestions && locSuggestions.length > 0 && (
          <div style={{ 
            position: 'absolute', top: '100%', left: '0', width: '100%', 
            backgroundColor: '#ffffff', border: '1px solid #e4e2e0', borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)', zIndex: 9999, marginTop: '8px', overflow: 'hidden'
          }}>
            {locSuggestions.map((sug, idx) => (
              <div 
                key={`loc-${idx}`} 
                onMouseDown={() => { setSearchLocation(sug); setShowLocSuggestions(false); }}
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                  borderBottom: idx === locSuggestions.length - 1 ? 'none' : '1px solid #f3f2f1',
                  color: '#2d2d2d', fontSize: '15px', transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f2f1'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaMapMarkerAlt style={{ color: '#767676', fontSize: '14px' }} /> {sug}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button className="search-btn" onClick={handleSearch}>Find jobs</button>
    </div>
  );

  // --- STATE 1: CLEAN LANDING PAGE ---
  if (!hasSearched) {
    return (
      <div className="hero-container">
        {renderSearchBar()}
        
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className="hero-logo-large">SkillFetch</h1>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>Your next job starts here</h2>
          <p style={{ color: '#4b4b4b', margin: '0 0 20px 0', fontSize: '14px' }}>
            Create an account or sign in to see your personalised job recommendations.
          </p>

          {/* FIX 2: Proper routing for the Get Started button */}
          <button 
            className="btn"
            onClick={() => {
              if (!currentUser) {
                setCurrentPage('register');
              } else {
                handleSearch(); // If logged in, instantly switch to the split-screen view
              }
            }}
          >
            {currentUser ? 'Browse Jobs Now' : 'Get Started'}
          </button>   

          <p style={{ marginTop: '50px', fontSize: '14px', color: '#2d2d2d', cursor: 'pointer' }}>
            What's trending on SkillFetch ⌄
          </p>
        </div>
      </div>
    );
  }

  // --- STATE 2: SPLIT SCREEN RESULTS ---
  return (
    <div className="results-container">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {renderSearchBar()}
      </div>

      <div className="filter-pills-row">
        {['Pay', 'Remote', 'Distance 1', 'Job type', 'Skills', 'Education level'].map(filter => (
          <div 
            key={filter} 
            className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter(activeFilter === filter ? '' : filter);
              setTimeout(handleSearch, 100); 
            }}
          >
            {filter}
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px solid #ececec', paddingBottom: '10px', marginBottom: '20px' }}>
        <p style={{ fontSize: '14px', color: '#767676', margin: '0' }}>Upload your CV and find your next job on SkillFetch!</p>
        <h3 style={{ margin: '15px 0 5px 0', color: '#2d2d2d', fontSize: '14px' }}>
          {searchTitle || 'All Jobs'} jobs in {searchLocation || 'any location'}
        </h3>
        <p style={{ fontSize: '13px', color: '#767676', margin: 0 }}>Sort by: <strong>relevance</strong> - date</p>
      </div>

      <div className="split-layout">
        
        {/* LEFT COLUMN: Job Cards */}
        <div className="jobs-list-column">
          {filteredJobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            filteredJobs.map(job => (
              <div 
                key={job._id || job.id} 
                className={`indeed-job-card ${(selectedJob?._id || selectedJob?.id) === (job._id || job.id) ? 'active-card' : ''}`}
                onClick={() => setSelectedJob(job)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="easily-apply-tag">Easily apply</div>
                  <FaRegBookmark style={{ color: '#2d2d2d', cursor: 'pointer', fontSize: '20px' }} />
                </div>
                
                <h2 style={{ fontSize: '18px', margin: '5px 0', color: '#2d2d2d' }}>{job.title}</h2>
                <p style={{ margin: '0 0 2px 0', fontSize: '14px', color: '#2d2d2d' }}>{job.companyName || 'SkillFetch Partner'}</p>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#4b4b4b' }}>{job.location}</p>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#f3f2f1', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', color: '#595959' }}>
                    {job.salaryRange || 'Pay not specified'}
                  </span>
                  <span style={{ backgroundColor: '#f3f2f1', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', color: '#595959' }}>
                    {job.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Job Details */}
        {selectedJob && (
          <div className="job-detail-sticky">
            <h2 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>{selectedJob.title}</h2>
            <p style={{ fontSize: '16px', color: '#2557a7', textDecoration: 'underline', marginBottom: '5px', cursor: 'pointer' }}>
              {selectedJob.companyName || 'SkillFetch Partner'}
            </p>
            <p style={{ fontSize: '16px', color: '#4b4b4b', marginBottom: '20px' }}>{selectedJob.location}</p>
            
            {selectedJob.source === 'Adzuna' ? (
              <a 
                href={selectedJob.applyUrl} target="_blank" rel="noopener noreferrer"
                style={{ backgroundColor: '#085ff7', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', width: '200px', marginBottom: '30px', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
              >
                Apply on Adzuna ↗
              </a>
            ) : hasApplied ? (
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '30px', display: 'inline-block', fontWeight: 'bold' }}>
                ✓ You applied for this job
              </div>
            ) : showApplyForm ? (
              <div style={{ marginBottom: '30px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Submit your application</h4>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Optional: Write a short pitch or cover letter..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  style={{ marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleApplySubmit} className="btn" style={{ padding: '8px 16px' }}>Confirm Apply</button>
                  <button onClick={() => setShowApplyForm(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button 
                className="btn"
                style={{ padding: '12px 30px', fontSize: '16px', fontWeight: 'bold', marginBottom: '30px' }}
                onClick={() => {
                  if (!currentUser) {
                    toast.error('You must log in to apply for jobs!');
                    setCurrentPage('login');
                    return;
                  }
                  if (currentUser.role !== 'candidate') {
                    toast.error('Only candidates can apply for jobs.');
                    return;
                  }
                  // Open the inline apply form
                  setShowApplyForm(true);
                }}
              >
                Apply Now
              </button>
            )}

            <div style={{ borderTop: '1px solid #ececec', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Job details</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#2d2d2d' }}>Pay</strong>
                <span style={{ backgroundColor: '#f3f2f1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', color: '#595959', display: 'inline-block', marginTop: '5px' }}>
                  {selectedJob.salaryRange || 'Not provided'}
                </span>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#2d2d2d' }}>Job type</strong>
                <span style={{ backgroundColor: '#f3f2f1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', color: '#595959', display: 'inline-block', marginTop: '5px' }}>
                  {selectedJob.type}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Full job description</h3>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#2d2d2d' }} dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearchEngine;