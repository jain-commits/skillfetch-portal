import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaMapMarkerAlt, FaClock, FaEnvelope, FaPhone, FaDownload } from 'react-icons/fa';

function JobDetail({ jobs, selectedJobId, currentUser, applications, setApplications, setCurrentPage, API_BASE_URL }) {
  const [coverLetter, setCoverLetter] = useState('');
  
  const job = jobs.find(j => (j._id === selectedJobId || j.id === selectedJobId));
  if (!job) return <p style={{ textAlign: 'center', padding: '50px' }}>Job listing not found!</p>;

  const currentJobId = job._id || job.id;
  const hasApplied = currentUser && applications.some(app => app.jobId === currentJobId && app.candidateId === currentUser.id);

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
        body: JSON.stringify({ jobId: currentJobId, candidateId: currentUser.id, coverLetter })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Application failed!');
        return;
      }
      setApplications([data, ...applications]);
      toast.success('Applied successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Network error during application submission.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => setCurrentPage('job-listings')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        Back to Jobs
      </button>
      
      <div className="card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <img 
            src={job.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName || 'C')}&background=2563EB&color=fff`} 
            alt={`${job.companyName} logo`} 
            style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: 'contain', border: '1px solid #eee' }}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName || 'C')}&background=2563EB&color=fff`;
            }}
          />
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>{job.title}</h2>
            <p style={{ margin: 0, fontSize: '16px', color: '#4b5563' }}><strong>Company:</strong> {job.companyName}</p>
          </div>
        </div>

        <p style={{ color: '#4b5563' }}>
          <strong>Location:</strong> {job.location} | <strong>Salary Range:</strong> {job.salaryRange} | <strong>Type:</strong> {job.type}
        </p>
        
        <hr style={{ borderColor: '#f3f4f6', margin: '20px 0' }} />
        
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>Job Description</h3>
        <div style={{ lineHeight: '1.6', color: '#374151', marginBottom: '25px' }} dangerouslySetInnerHTML={{ __html: job.description }} />
        
        {job.qualifications && (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>Job Qualifications</h3>
            <p style={{ color: '#374151', lineHeight: '1.6' }}>{job.qualifications}</p>
          </>
        )}

        {job.skillsRequired && (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', marginTop: '20px' }}>Skills Required</h3>
            <p><code>{job.skillsRequired}</code></p>
          </>
        )}
      </div>

      <div className="card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Application Portal</h3>
        {!currentUser ? (
          <p>Please <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('login'); }}>Login as a Candidate</a> to apply for this job posting.</p>
        ) : currentUser.role !== 'candidate' ? (
          <p>You are logged in as an <strong>{currentUser.role}</strong>. Only candidates can apply for jobs.</p>
        ) : hasApplied ? (
          <p style={{ color: '#166534', fontWeight: 'bold', padding: '12px 16px', backgroundColor: '#dcfce7', borderRadius: '8px', margin: 0 }}>
            ✓ You have successfully applied for this role. You can track its status in your Dashboard.
          </p>
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
            <button type="submit" className="btn" style={{ width: '100%', padding: '12px' }}>Submit Application</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default JobDetail;
