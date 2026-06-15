import React, { useState } from 'react';

function JobListings({ jobs, setCurrentPage, setSelectedJobId, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const safeJobs = Array.isArray(jobs) ? jobs : [];

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
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Available Job Listings</h2>
        {currentUser && currentUser.role === 'employer' && (
          <button onClick={() => setCurrentPage('post-job')} className="btn">Post a New Job</button>
        )}
      </div>

      {/* Simple Search Filters Panel */}
      <div className="card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
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
        <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
          No jobs match your search filters.
        </div>
      ) : (
        filteredJobs.map((job) => (
          <div key={job._id || job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img 
                src={job.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName || 'C')}&background=2563EB&color=fff`} 
                alt={`${job.companyName} logo`} 
                style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: 'contain', border: '1px solid #eee' }}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName || 'C')}&background=2563EB&color=fff`;
                }}
              />
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827' }}>{job.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
                  <strong>{job.companyName}</strong> • {job.location}
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span className="badge-modern badge-blue">{job.type}</span>
                  <span className="badge-modern badge-gray">{job.salaryRange}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => { setSelectedJobId(job._id || job.id); setCurrentPage('job-detail'); }} 
              className="btn btn-secondary"
              style={{ fontSize: '13px' }}
            >
              View Details
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default JobListings;
