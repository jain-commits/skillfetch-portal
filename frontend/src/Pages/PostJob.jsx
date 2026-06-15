import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function PostJob({ jobs, setJobs, currentUser, setCurrentPage, API_BASE_URL }) {
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
          // Auto-pass employer's logo
          companyLogo: currentUser.companyLogo || currentUser.avatar || '',
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

      if (!response.ok) {
        let errorMessage = 'Failed to post job.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        toast.error(errorMessage);
        return;
      }

      const data = await response.json();
      setJobs([data, ...jobs]);
      toast.success('Job opportunity posted successfully!');
      setCurrentPage('employer-dashboard');
      
    } catch (err) {
      console.error(err);
      toast.error('Network error during posting job.');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '20px auto', padding: '25px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px', color: '#111827' }}>Post a New Job Opportunity</h2>
      <form onSubmit={handlePostSubmit}>
        <div className="form-group">
          <label>Job Title</label>
          <input type="text" className="form-control" placeholder="e.g. Senior Frontend React Engineer" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label>Job Category</label>
          <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Software Development">Software Development</option>
            <option value="Frontend Development">Frontend Development</option>
            <option value="Backend Development">Backend Development</option>
            <option value="Full Stack Development">Full Stack Development</option>
            <option value="Design & Creative">Design & Creative</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Cloud & DevOps">Cloud & DevOps</option>
            <option value="Data Science & AI">Data Science & AI</option>
            <option value="IT & Security">IT & Security</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Job Type</label>
            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
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
          <input type="text" className="form-control" placeholder="e.g. Bangalore, Karnataka or Remote" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Salary Package (CTC)</label>
          <input type="text" className="form-control" placeholder="e.g. ₹8,00,000 - ₹12,00,000 INR" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Required Skills (Comma separated)</label>
          <input type="text" className="form-control" placeholder="e.g. React, Node.js, AWS, TailwindCSS" value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Job Description</label>
          <textarea className="form-control" rows={4} placeholder="Describe the role, responsibilities, and team environment..." value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Candidate Qualifications</label>
          <textarea className="form-control" rows={2} placeholder="Describe requested degrees, experience, or certifications..." value={qualifications} onChange={(e) => setQualifications(e.target.value)} required />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
          <button type="submit" className="btn" style={{ flex: 1, padding: '10px' }}>Post Opportunity</button>
          <button type="button" onClick={() => setCurrentPage('employer-dashboard')} className="btn btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default PostJob;
