import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function AdminPanel({ users, setUsers, jobs, setJobs, applications, setApplications, currentUser, API_BASE_URL }) {
  const [activeTab, setActiveTab] = useState('users');

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
      setUsers(users.map(u => (u.id === userId || u._id === userId) ? data : u));
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
      setUsers(users.filter(u => (u.id !== userId && u._id !== userId)));
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
      setJobs(jobs.filter(j => (j.id !== jobId && j._id !== jobId)));
      setApplications(applications.filter(app => app.jobId !== jobId));
      toast.success('Job posting deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Network error during job deletion.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#111827' }}>Administrative Panel</h2>
      
      {/* Simple stats bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center', padding: '15px' }}>
          <strong>Total Accounts:</strong> {users.length}
        </div>
        <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center', padding: '15px' }}>
          <strong>Job Postings:</strong> {jobs.length}
        </div>
        <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center', padding: '15px' }}>
          <strong>Submitted Applications:</strong> {applications.length}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('users')} className={`btn ${activeTab === 'users' ? '' : 'btn-secondary'}`} style={{ marginRight: '10px' }}>Manage Users</button>
        <button onClick={() => setActiveTab('jobs')} className={`btn ${activeTab === 'jobs' ? '' : 'btn-secondary'}`}>Manage Jobs</button>
      </div>

      {activeTab === 'users' ? (
        <div style={{ overflowX: 'auto' }}>
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
                <tr key={u.id || u._id}>
                  <td>{u.id || u._id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'uppercase', fontWeight: '600' }}>{u.role}</td>
                  <td>
                    {(u.id !== currentUser.id && u._id !== currentUser.id) ? (
                      <>
                        <button onClick={() => toggleSuspension(u.id || u._id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '5px' }}>
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button onClick={() => handleDeleteUser(u.id || u._id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Active Admin Session</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
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
                <tr key={job.id || job._id}>
                  <td>{job.id || job._id}</td>
                  <td>{job.title}</td>
                  <td>{job.companyName}</td>
                  <td>{job.location}</td>
                  <td>{job.category}</td>
                  <td>
                    <button onClick={() => handleDeleteJob(job.id || job._id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
