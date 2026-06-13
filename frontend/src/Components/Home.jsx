import React, { useState, useMemo } from 'react';
import { FaSearch, FaMapMarkerAlt, FaRegBookmark } from 'react-icons/fa';

function JobSearchEngine({ jobs = [], setCurrentPage }) {
  // --- States ---
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeFilter, setActiveFilter] = useState('');
  
  // Dropdown visibility states
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);

  // --- Auto-Complete Data Generation ---
  // Get unique titles and locations from actual database jobs
  const uniqueTitles = useMemo(() => [...new Set(jobs.map(j => j.title))].filter(Boolean), [jobs]);
  const uniqueLocations = useMemo(() => [...new Set(jobs.map(j => j.location))].filter(Boolean), [jobs]);

  // Filter suggestions based on what is typed (or show top 5 if empty)
  const titleSuggestions = searchTitle 
    ? uniqueTitles.filter(t => t.toLowerCase().includes(searchTitle.toLowerCase())).slice(0, 5)
    : uniqueTitles.slice(0, 5);

  const locSuggestions = searchLocation 
    ? uniqueLocations.filter(l => l.toLowerCase().includes(searchLocation.toLowerCase())).slice(0, 5)
    : uniqueLocations.slice(0, 5);

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
    if (results.length > 0) setSelectedJob(results[0]);
    setHasSearched(true);
    
    // Hide dropdowns after search
    setShowTitleSuggestions(false);
    setShowLocSuggestions(false);
  };

  // --- Reusable Search Bar UI (Saved as a variable, NOT a component, to prevent focus loss) ---
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
          onBlur={() => setShowTitleSuggestions(false)} // Hides when clicking outside
        />
        
        {/* Title Suggestions Dropdown */}
        {showTitleSuggestions && titleSuggestions.length > 0 && (
          <div className="autocomplete-dropdown" style={{ top: '55px', width: '100%' }}>
            {titleSuggestions.map((sug, idx) => (
              <div 
                key={`title-${idx}`} 
                className="autocomplete-item" 
                // onMouseDown fires before onBlur, allowing the click to register!
                onMouseDown={() => { 
                  setSearchTitle(sug); 
                  setShowTitleSuggestions(false); 
                }}
              >
                <FaSearch style={{ color: '#767676', fontSize: '12px' }} /> {sug}
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
          <div className="autocomplete-dropdown" style={{ top: '55px', width: '100%' }}>
            {locSuggestions.map((sug, idx) => (
              <div 
                key={`loc-${idx}`} 
                className="autocomplete-item" 
                onMouseDown={() => { 
                  setSearchLocation(sug); 
                  setShowLocSuggestions(false); 
                }}
              >
                <FaMapMarkerAlt style={{ color: '#767676', fontSize: '12px' }} /> {sug}
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
          <button 
            className="get-started-btn"
            onClick={() => setCurrentPage('login')}
          >
            Get Started →
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
        <p style={{ fontSize: '14px', color: '#767676', margin: '0' }}>
          Upload your CV and find your next job on SkillFetch!
        </p>
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
                key={job.id} 
                className={`indeed-job-card ${selectedJob?.id === job.id ? 'active-card' : ''}`}
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
            
            <button 
              onClick={() => setCurrentPage('login')}
              style={{ backgroundColor: '#085ff7', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', width: '200px', marginBottom: '30px' }}
            >
              Apply now
            </button>

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
              
{/* We swap the <p> for a <div> and use React's built-in HTML renderer */}
<div 
  style={{ fontSize: '14px', lineHeight: '1.6', color: '#2d2d2d' }} 
  dangerouslySetInnerHTML={{ __html: selectedJob.description }} 
/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearchEngine;