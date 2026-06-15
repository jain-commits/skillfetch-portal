import React from 'react';

function CandidateDashboard({ currentUser, applications, jobs, setCurrentPage }) {
  const myApps = applications.filter(app => app.candidateId === currentUser.id);

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => (j._id === jobId || j.id === jobId));
    return job ? `${job.title} (${job.companyName})` : 'Unknown Job';
  };

  const getBadgeClass = (status) => {
    switch(status) {
      case 'Hired': return 'badge-success';
      case 'Shortlisted': return 'badge-warning';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-blue';
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Dashboard Header */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', color: '#111827', fontWeight: '800', margin: '0 0 10px 0' }}>Candidate Dashboard</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Track your active job applications and recruitment progress.</p>
      </div>

      <div className="card" style={{ padding: '25px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Application Tracker</h2>
        {myApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p style={{ marginBottom: '15px' }}>You haven't applied to any jobs yet.</p>
            <button onClick={() => setCurrentPage('home')} className="btn">
              Browse Jobs
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px' }}>Role / Company</th>
                  <th style={{ padding: '12px' }}>Date Applied</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myApps.map((app) => (
                  <tr key={app._id || app.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '15px 12px', fontWeight: '700', color: '#1f2937' }}>{getJobTitle(app.jobId)}</td>
                    <td style={{ padding: '15px 12px', color: '#6b7280', fontSize: '13px' }}>
                      {(app.appliedAt || app.createdAt) ? (app.appliedAt || app.createdAt).split('T')[0] : 'N/A'}
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <span className={`badge-modern ${getBadgeClass(app.status)}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                        {app.status || 'Applied'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateDashboard;
