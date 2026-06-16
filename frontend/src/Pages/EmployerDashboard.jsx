import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { FaMapMarkerAlt, FaClock, FaEnvelope, FaPhone, FaDownload, FaTimes, FaUserCheck, FaUserTimes, FaEye } from 'react-icons/fa';
import { getAvatarUrl } from '../utils/avatars';

function EmployerDashboard({ jobs, setJobs, applications, setApplications, users, currentUser, setCurrentPage, setSelectedJobId, API_BASE_URL }) {
  const [activeAppId, setActiveAppId] = useState(null);

  const currentUserId = currentUser._id || currentUser.id;

  const myJobs = jobs.filter(j => j.employerId === currentUserId);
  const myJobIds = myJobs.map(j => j._id || j.id);
  const receivedApps = applications.filter(app => myJobIds.includes(app.jobId));
  
  const totalHires = receivedApps.filter(app => app.status === 'Hired').length;
  const totalShortlisted = receivedApps.filter(app => app.status === 'Shortlisted').length;

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => (j._id === jobId || j.id === jobId));
    return job ? job.title : 'Unknown Job';
  };

  const getCandidateName = (candidateId) => {
    const user = users.find(u => (u._id === candidateId || u.id === candidateId));
    return user ? user.name : 'Unknown Candidate';
  };

  const getCandidateAvatar = (candidateId) => {
    const user = users.find(u => (u._id === candidateId || u.id === candidateId));
    return user ? getAvatarUrl(user.avatar, user.name) : '';
  };

  const getBadgeClass = (status) => {
    switch(status) {
      case 'Hired': return 'badge-success';
      case 'Shortlisted': return 'badge-warning';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-blue';
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This will also delete all associated applications.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete job.');
      
      setJobs(jobs.filter(j => (j._id !== jobId && j.id !== jobId)));
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
      setApplications(applications.map(app => (app._id === appId || app.id === appId) ? data : app));
      toast.success(`Candidate marked as ${newStatus}!`);
      setActiveAppId(null); // Close modal automatically
    } catch (err) {
      toast.error('Network error during status update.');
    }
  };

  const selectedApp = applications.find(app => (app._id === activeAppId || app.id === activeAppId));
  const selectedCandidate = selectedApp ? users.find(u => (u._id === selectedApp.candidateId || u.id === selectedApp.candidateId)) : null;
  const selectedCandidateAvatar = selectedCandidate ? getAvatarUrl(selectedCandidate.avatar, selectedCandidate.name) : '';

  return (
    <div>
      {/* Header Area */}
      <div className="dashboard-header" style={{ marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Employer Dashboard</h2>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Manage your job postings and review candidates.</p>
        </div>
        <button onClick={() => setCurrentPage('post-job')} className="btn">
          + Post New Job
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
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
          <h3 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
            Active Job Listings
          </h3>
          
          {myJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
              <p>You have not posted any jobs yet.</p>
              <button onClick={() => setCurrentPage('post-job')} className="btn btn-secondary" style={{ marginTop: '10px' }}>Create your first listing</button>
            </div>
          ) : (
            myJobs.map((job) => (
              <div key={job._id || job.id} className="list-item-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#111827' }}>{job.title}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}><FaMapMarkerAlt style={{ marginRight: '4px' }} /> {job.location}</span>
                    <span>|</span>
                    <span style={{ display: 'flex', alignItems: 'center' }}><FaClock style={{ marginRight: '4px' }} /> {job.type}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setSelectedJobId(job._id || job.id); setCurrentPage('job-detail'); }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>View</button>
                  <button onClick={() => handleDeleteJob(job._id || job.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Received Applications */}
        <div>
          <h3 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
            Recent Applications
          </h3>

          {receivedApps.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
              <p>No candidates have applied to your jobs yet.</p>
            </div>
          ) : (
            receivedApps.map((app) => (
              <div key={app._id || app.id} className="list-item-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={getCandidateAvatar(app.candidateId)} 
                    alt="Candidate Avatar" 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }} 
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '15px', color: '#111827' }}>{getCandidateName(app.candidateId)}</strong>
                      <span className={`badge-modern ${getBadgeClass(app.status)}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {app.status || 'Applied'}
                      </span>
                    </div>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                      Applying for: <strong>{getJobTitle(app.jobId)}</strong>
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveAppId(app._id || app.id)} className="btn" style={{ padding: '6px 14px', fontSize: '13px' }}>
                  Review
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Sleek ATS Split-Screen Review Modal */}
      {selectedApp && selectedCandidate && createPortal(
        <div className="review-modal-overlay">
          <div className="review-modal-container" style={{ maxWidth: '900px' }}>
            
            {/* Header */}
            <div className="review-modal-header" style={{ padding: '20px 25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img 
                  src={selectedCandidateAvatar} 
                  alt={selectedCandidate.name} 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563EB' }} 
                />
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#111827', fontWeight: '800' }}>
                    {selectedCandidate.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#4b5563' }}>{selectedCandidate.headline || 'Job Seeker'}</span>
                    <span style={{ color: '#d1d5db' }}>•</span>
                    <span className={`badge-modern ${getBadgeClass(selectedApp.status)}`} style={{ fontSize: '11px' }}>
                      {selectedApp.status || 'Applied'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveAppId(null)} 
                style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Split Body */}
            <div className="review-modal-body" style={{ padding: '0 25px 25px 25px', gap: '25px' }}>
              
              {/* Left Panel: Info & Actions */}
              <div className="review-left-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', maxHeight: '60vh' }}>
                
                {/* Mobile-Only PDF Button */}
                {(selectedCandidate.resume?.name || selectedCandidate.resumeName) && (
                  <div className="mobile-resume-action" style={{ display: 'none' }}>
                    <a 
                      href={`${API_BASE_URL}/api/users/${selectedCandidate._id || selectedCandidate.id}/resume`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                      <FaDownload /> Open Resume PDF
                    </a>
                  </div>
                )}

                <div className="info-section" style={{ border: '1px solid #f3f4f6', padding: '15px', borderRadius: '8px' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#111827' }}>Contact Details</h5>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#4b5563' }}><FaEnvelope style={{ color: '#9ca3af', marginRight: '6px' }}/> {selectedCandidate.email}</p>
                  <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#4b5563' }}><FaPhone style={{ color: '#9ca3af', marginRight: '6px' }}/> {selectedCandidate.phone || 'N/A'}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}><FaMapMarkerAlt style={{ color: '#9ca3af', marginRight: '6px' }}/> {selectedCandidate.location || 'N/A'}</p>
                </div>

                <div className="info-section" style={{ border: '1px solid #f3f4f6', padding: '15px', borderRadius: '8px' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#111827' }}>Professional Summary</h5>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', lineHeight: '1.5', color: '#4b5563' }}><strong>Skills:</strong> {selectedCandidate.skills || 'Not listed'}</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', lineHeight: '1.5', color: '#4b5563' }}><strong>Exp:</strong> {selectedCandidate.experience || 'Not listed'}</p>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#4b5563' }}><strong>Edu:</strong> {selectedCandidate.education || 'Not listed'}</p>
                </div>

                <div className="info-section" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#111827' }}>Applicant Pitch</h5>
                  <p style={{ margin: 0, fontStyle: 'italic', color: '#475569', fontSize: '13px', lineHeight: '1.6' }}>
                    "{selectedApp.coverLetter}"
                  </p>
                </div>

                {/* Actions */}
                <div className="action-buttons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                  <button onClick={() => handleUpdateStatus(selectedApp._id || selectedApp.id, 'Shortlisted')} className="btn" style={{ background: '#fffbeb', color: '#854d0e', border: '1px solid #fde047', fontSize: '13px', padding: '8px' }}>⭐ Shortlist</button>
                  <button onClick={() => handleUpdateStatus(selectedApp._id || selectedApp.id, 'Hired')} className="btn" style={{ background: '#166534', color: '#fff', border: 'none', fontSize: '13px', padding: '8px' }}>✅ Hire</button>
                  <button onClick={() => handleUpdateStatus(selectedApp._id || selectedApp.id, 'Rejected')} className="btn btn-danger" style={{ gridColumn: 'span 2', fontSize: '13px', padding: '8px' }}>❌ Reject Applicant</button>
                </div>
              </div>

              {/* Right Panel: Laptop PDF Viewer */}
              <div className="review-right-panel" style={{ height: '420px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                {(selectedCandidate.resume?.name || selectedCandidate.resumeName) ? (
                  <iframe 
                    src={`${API_BASE_URL}/api/users/${selectedCandidate._id || selectedCandidate.id}/resume`} 
                    title="Resume Preview"
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', backgroundColor: '#f8fafc' }}>
                    <FaDownload style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>No resume uploaded by candidate</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default EmployerDashboard;
