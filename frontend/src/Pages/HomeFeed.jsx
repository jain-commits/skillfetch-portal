import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaMapMarkerAlt, FaRegBookmark, FaBookmark, FaRegClock, FaTimes, FaUserCircle, FaPaperPlane, FaBriefcase, FaNewspaper } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getAvatarUrl } from '../utils/avatars';

const FALLBACK_STORIES = [
  {
    id: "story_fb1",
    _id: "story_fb1",
    title: "Bangalore GCCs Dominate Tech Hiring Trends",
    content: "Global Capability Centers (GCCs) in Bangalore and Hyderabad are expanding their high-tech footprints. Recent reports indicate GCCs will contribute over 55% of new technology hires in India in 2026, shifting focus towards AI engineering, cloud architects, and cybersecurity specialists.",
    summary: "GCCs in Bangalore and Hyderabad to drive tech hiring growth in India.",
    author: "Amit Sharma",
    readTime: "3 min read",
    publishedAt: new Date().toISOString()
  },
  {
    id: "story_fb2",
    _id: "story_fb2",
    title: "The Rise of EV and Green Tech Careers in India",
    content: "India's electric vehicle (EV) sector is seeing a massive surge in job creation. From battery design engineering to power electronics, major automotive companies are building large-scale R&D hubs in Chennai and Pune, driving a 30% YoY increase in green technology positions.",
    summary: "EV sector R&D hubs in Chennai and Pune drive 30% YoY increase in jobs.",
    author: "Priya Nair",
    readTime: "4 min read",
    publishedAt: new Date().toISOString()
  },
  {
    id: "story_fb3",
    _id: "story_fb3",
    title: "ATS Optimizers: How to Pass India's Top Recruiters",
    content: "With over 1,000 applications per job listing, major Indian tech firms are relying heavily on Application Tracking Systems (ATS). To beat the filter, candidates should use plain-text PDF resumes, standard section headers, and align their skills section with exact keywords from the job description.",
    summary: "How candidates can optimize resumes to pass ATS algorithms.",
    author: "Rajesh Patel",
    readTime: "2 min read",
    publishedAt: new Date().toISOString()
  },
  {
    id: "story_fb4",
    _id: "story_fb4",
    title: "Non-Metro Cities Emerge as New IT Hubs",
    content: "Cities like Kochi, Indore, Coimbatore, and Jaipur are witnessing significant infrastructure expansions as IT companies choose decentralized offices. Lower operational costs and talent retention are driving companies to establish secondary hubs, creating high-paying jobs locally.",
    summary: "Kochi, Indore, and Jaipur see tech job surge as companies expand.",
    author: "Sneha Iyer",
    readTime: "3 min read",
    publishedAt: new Date().toISOString()
  },
  {
    id: "story_fb5",
    _id: "story_fb5",
    title: "Upskilling in Generative AI Pays Off",
    content: "Indian professionals who certified in Generative AI and Large Language Model fine-tuning saw an average salary bump of 25% when changing jobs this year. Industry experts recommend building hands-on projects rather than just collecting theory certificates.",
    summary: "GenAI certifications and hands-on projects lead to higher salaries.",
    author: "Vikram Sen",
    readTime: "3 min read",
    publishedAt: new Date().toISOString()
  }
];

function HomeFeed({ jobs = [], currentUser, setCurrentPage, setSelectedJobId, applications = [], setApplications, API_BASE_URL }) {
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

  // Stories States
  const [stories, setStories] = useState(FALLBACK_STORIES);
  const [activeStory, setActiveStory] = useState(null);
  const [loadingStories, setLoadingStories] = useState(false);

  // Auto-Complete lists
  const uniqueTitles = useMemo(() => [...new Set(jobs.map(j => j.title))].filter(Boolean), [jobs]);
  const uniqueLocations = useMemo(() => [...new Set(jobs.map(j => j.location))].filter(Boolean), [jobs]);

  const titleSuggestions = searchTitle.trim().length > 0 
    ? uniqueTitles.filter(t => t.toLowerCase().includes(searchTitle.toLowerCase())).slice(0, 5)
    : [];

  const locSuggestions = searchLocation.trim().length > 0 
    ? uniqueLocations.filter(l => l.toLowerCase().includes(searchLocation.toLowerCase())).slice(0, 5)
    : [];

  // Fetch stories on load
  const fetchStories = async () => {
    setLoadingStories(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStories(data.slice(0, 6)); // Display first 6 stories
        } else {
          // Shuffle fallbacks client-side if DB is empty
          setStories([...FALLBACK_STORIES].sort(() => 0.5 - Math.random()).slice(0, 6));
        }
      } else {
        setStories([...FALLBACK_STORIES].sort(() => 0.5 - Math.random()).slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      setStories([...FALLBACK_STORIES].sort(() => 0.5 - Math.random()).slice(0, 6));
    } finally {
      setLoadingStories(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Update filtered jobs when jobs array loads
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      setFilteredJobs(jobs);
      setSelectedJob(jobs[0]);
    }
  }, [jobs]);

  // Reset apply form when selecting a new job
  useEffect(() => {
    setShowApplyForm(false);
    setCoverLetter('');
  }, [selectedJob]);

  // Search logic
  const handleSearch = () => {
    let results = jobs.filter(job => {
      const matchTitle = job.title.toLowerCase().includes(searchTitle.toLowerCase()) || 
                         (job.companyName && job.companyName.toLowerCase().includes(searchTitle.toLowerCase()));
      const matchLoc = job.location.toLowerCase().includes(searchLocation.toLowerCase());
      return matchTitle && matchLoc;
    });

    if (activeFilter === 'Remote') {
      results = results.filter(j => j.type.toLowerCase().includes('remote') || j.location.toLowerCase().includes('remote'));
    } else if (activeFilter === 'Full-time') {
      results = results.filter(j => j.type.toLowerCase() === 'full-time');
    } else if (activeFilter === 'Internship') {
      results = results.filter(j => j.type.toLowerCase() === 'internship');
    }

    setFilteredJobs(results);
    setSelectedJob(results.length > 0 ? results[0] : null);
    setShowTitleSuggestions(false);
    setShowLocSuggestions(false);
  };

  // Run search when filter changes
  useEffect(() => {
    handleSearch();
  }, [activeFilter, jobs]);

  // Application handler
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('You must log in to apply for jobs!');
      setCurrentPage('login');
      return;
    }
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

  const currentJobId = selectedJob?._id || selectedJob?.id;
  const hasApplied = currentUser && applications?.some(app => app.jobId === currentJobId && app.candidateId === (currentUser?._id || currentUser?.id));

  // Default avatars helper
  const userAvatar = currentUser ? getAvatarUrl(currentUser.avatar, currentUser.name) : '';

  return (
    <div className="home-feed-container">
      {/* Top Search Bar Row */}
      <div className="home-search-row">
        <div className="search-bar-wrapper">
          <div className="search-input-group">
            <FaSearch style={{ color: '#6b7280', fontSize: '16px', marginLeft: '8px' }} />
            <input 
              type="text" 
              placeholder="Job title, keywords, or company" 
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onFocus={() => setShowTitleSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 200)} 
            />
            {showTitleSuggestions && titleSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {titleSuggestions.map((sug, idx) => (
                  <div 
                    key={`title-${idx}`} 
                    onMouseDown={() => setSearchTitle(sug)}
                    className="suggestion-item"
                  >
                    <FaSearch style={{ color: '#9ca3af', fontSize: '12px' }} /> {sug}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="search-divider"></div>

          <div className="search-input-group">
            <FaMapMarkerAlt style={{ color: '#6b7280', fontSize: '16px' }} />
            <input 
              type="text" 
              placeholder="City, state, or remote" 
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onFocus={() => setShowLocSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)}
            />
            {showLocSuggestions && locSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {locSuggestions.map((sug, idx) => (
                  <div 
                    key={`loc-${idx}`} 
                    onMouseDown={() => setSearchLocation(sug)}
                    className="suggestion-item"
                  >
                    <FaMapMarkerAlt style={{ color: '#9ca3af', fontSize: '12px' }} /> {sug}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button className="search-btn" onClick={handleSearch}>Find jobs</button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="feed-layout-grid">
        
        {/* LEFT COLUMN: Profile Card / CTAs */}
        <div className="feed-left-col">
          {currentUser ? (
            <div className="card profile-preview-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="profile-card-banner"></div>
              <div style={{ padding: '0 20px 20px 20px', textAlign: 'center', marginTop: '-35px' }}>
                <img 
                  src={userAvatar} 
                  alt="My avatar" 
                  className="profile-preview-avatar"
                  onClick={() => setCurrentPage('profile')}
                />
                <h4 
                  style={{ margin: '10px 0 2px 0', fontSize: '16px', fontWeight: '700', cursor: 'pointer', color: '#111827' }}
                  onClick={() => setCurrentPage('profile')}
                  className="hover-underline"
                >
                  {currentUser.name}
                </h4>
                <p 
                  style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 15px 0', minHeight: '32px', lineHeight: '1.3' }}
                  onClick={() => setCurrentPage('profile')}
                  className="headline-preview hover-underline"
                >
                  {currentUser.headline || (currentUser.role === 'employer' ? `Hiring at ${currentUser.companyName}` : 'Add a headline to your profile')}
                </p>
                
                <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '15px 0' }} />
                
                <div style={{ textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Account Role:</span>
                    <span style={{ fontWeight: '600', textTransform: 'capitalize', color: '#111827' }}>{currentUser.role}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Location:</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{currentUser.location || currentUser.companyLocation || 'India'}</span>
                  </div>
                </div>
                
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    if (currentUser.role === 'employer') setCurrentPage('employer-dashboard');
                    else if (currentUser.role === 'admin') setCurrentPage('admin-panel');
                    else setCurrentPage('candidate-dashboard');
                  }}
                  style={{ width: '100%', marginTop: '20px', fontSize: '13px', padding: '8px 12px' }}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="card login-cta-card" style={{ padding: '25px 20px', textAlign: 'center' }}>
              <FaBriefcase style={{ fontSize: '32px', color: '#2563EB', marginBottom: '15px' }} />
              <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', fontWeight: '700' }}>Accelerate your career</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0', lineHeight: '1.4' }}>
                Join SkillFetch to network with candidates, post jobs, and apply directly with custom resumes.
              </p>
              <button 
                className="btn" 
                onClick={() => setCurrentPage('login')} 
                style={{ width: '100%', marginBottom: '10px' }}
              >
                Sign In
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setCurrentPage('register')} 
                style={{ width: '100%' }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Quick Stats / Footer links */}
          <div style={{ padding: '0 10px', fontSize: '11px', color: '#9ca3af', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 8px 0' }}>About • Help Center • Terms • Privacy</p>
            <p style={{ margin: 0 }}>SkillFetch © 2026</p>
          </div>
        </div>

        {/* MIDDLE COLUMN: Scrollable Job Feed + Sticky Detail */}
        <div className="feed-middle-col">
          <div className="filter-pills-row">
            {['All', 'Remote', 'Full-time', 'Internship'].map(filter => (
              <div 
                key={filter} 
                className={`filter-pill ${activeFilter === (filter === 'All' ? '' : filter) ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter === 'All' ? '' : filter)}
              >
                {filter}
              </div>
            ))}
          </div>

          <div className="split-layout">
            {/* Left Feed Column */}
            <div className="jobs-list-column">
              <h4 style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Recommended
              </h4>

              {filteredJobs.length === 0 ? (
                <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
                  <p style={{ margin: 0 }}>No matching jobs found.</p>
                </div>
              ) : (
                filteredJobs.map(job => (
                  <div 
                    key={job._id || job.id} 
                    className={`linkedin-job-card ${(selectedJob?._id || selectedJob?.id) === (job._id || job.id) ? 'active-card' : ''}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <img 
                        src={job.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName || 'C')}&background=2563EB&color=fff`}
                        alt={job.companyName}
                        className="feed-company-logo"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName || 'C')}&background=2563EB&color=fff`;
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3 className="job-card-title">{job.title}</h3>
                        <p className="job-card-company">{job.companyName}</p>
                        <p className="job-card-loc">{job.location}</p>
                        
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                          <span className="badge-modern badge-blue">{job.type}</span>
                          <span className="badge-modern badge-gray">{job.salaryRange || 'Pay not specified'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Sticky Detail Column */}
            <div className="job-detail-sticky">
              {selectedJob ? (
                <div style={{ padding: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
                    <img 
                      src={selectedJob.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedJob.companyName || 'C')}&background=2563EB&color=fff`} 
                      alt={selectedJob.companyName}
                      style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: 'contain', border: '1px solid #f3f4f6' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>{selectedJob.title}</h2>
                      <p style={{ margin: 0, fontSize: '15px', color: '#4b5563' }}>{selectedJob.companyName}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#6b7280' }}>{selectedJob.location}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
                    <div className="job-detail-spec">
                      <span className="spec-label">Job Type</span>
                      <span className="spec-val">{selectedJob.type}</span>
                    </div>
                    <div className="job-detail-spec">
                      <span className="spec-label">Salary Range</span>
                      <span className="spec-val">{selectedJob.salaryRange || 'Not disclosed'}</span>
                    </div>
                    {selectedJob.experienceLevel && (
                      <div className="job-detail-spec">
                        <span className="spec-label">Experience</span>
                        <span className="spec-val">{selectedJob.experienceLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Apply Actions */}
                  <div style={{ marginBottom: '25px' }}>
                    {hasApplied ? (
                      <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 16px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                        ✓ Application Submitted
                      </div>
                    ) : showApplyForm ? (
                      <form onSubmit={handleApplySubmit} style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700' }}>Write a cover letter</h4>
                        <textarea 
                          className="form-control" 
                          rows={3} 
                          placeholder="Introduce yourself and explain why you're a great fit for this job..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          style={{ marginBottom: '12px', fontSize: '13px' }}
                          required
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" className="btn" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            <FaPaperPlane style={{ marginRight: '5px' }} /> Submit App
                          </button>
                          <button type="button" onClick={() => setShowApplyForm(false)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        className="btn"
                        style={{ padding: '10px 24px', fontSize: '14px' }}
                        onClick={() => {
                          if (!currentUser) {
                            toast.error('Please log in as a candidate to apply!');
                            setCurrentPage('login');
                            return;
                          }
                          if (currentUser.role !== 'candidate') {
                            toast.error('Only candidates can apply to job listings.');
                            return;
                          }
                          setShowApplyForm(true);
                        }}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '20px 0' }} />

                  {/* Job Description details */}
                  <div className="job-desc-content" style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: '#111827' }}>Full Job Description</h3>
                    <div dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                    
                    {selectedJob.qualifications && (
                      <>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '20px', marginBottom: '10px', color: '#111827' }}>Qualifications</h3>
                        <p>{selectedJob.qualifications}</p>
                      </>
                    )}

                    {selectedJob.skillsRequired && (
                      <>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '20px', marginBottom: '10px', color: '#111827' }}>Required Skills</h3>
                        <p><code>{selectedJob.skillsRequired}</code></p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', padding: '40px' }}>
                  <FaBriefcase style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.3 }} />
                  <p>Select a job to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Shuffled India Career Stories */}
        <div className="feed-right-col">
          <div className="card news-sidebar-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaNewspaper style={{ color: '#2563EB' }} /> SkillFetch News
              </h3>
              <button 
                onClick={fetchStories} 
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                disabled={loadingStories}
              >
                {loadingStories ? 'Shuffling...' : 'Shuffle 🔄'}
              </button>
            </div>

            <div className="stories-list">
              {stories.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>No stories loaded.</p>
              ) : (
                stories.map((story, index) => (
                  <div 
                    key={story._id || story.id || index} 
                    className="story-sidebar-item"
                    onClick={() => setActiveStory(story)}
                  >
                    <h4 className="story-sidebar-title">{story.title}</h4>
                    <p className="story-sidebar-meta">
                      {story.readTime} • By {story.author}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* LinkedIn-style expand Story Modal */}
      {activeStory && (
        <div className="review-modal-overlay">
          <div className="review-modal-container story-modal-container" style={{ maxWidth: '650px', height: 'auto', maxHeight: '90vh' }}>
            <div className="review-modal-header" style={{ padding: '20px 25px', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <span className="badge-modern badge-blue" style={{ fontSize: '11px', marginBottom: '6px', display: 'inline-block' }}>
                  CAREER KNOWLEDGE
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#111827', lineHeight: '1.3' }}>
                  {activeStory.title}
                </h2>
              </div>
              <button 
                onClick={() => setActiveStory(null)} 
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={{ padding: '25px', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '13px', color: '#6b7280' }}>
                <div className="story-author-avatar">
                  {activeStory.author ? activeStory.author.charAt(0) : 'S'}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151' }}>{activeStory.author || 'SkillFetch Team'}</div>
                  <div>Published recently • {activeStory.readTime || '3 min read'}</div>
                </div>
              </div>

              <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', whiteSpace: 'pre-line' }}>
                <p style={{ fontWeight: '600', fontSize: '16px', color: '#111827', marginBottom: '15px', lineHeight: '1.5' }}>
                  {activeStory.summary}
                </p>
                {activeStory.content}
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '25px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn" 
                  onClick={() => setActiveStory(null)}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Done Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeFeed;
