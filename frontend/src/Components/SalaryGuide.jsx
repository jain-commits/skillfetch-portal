import React, { useState } from 'react';

function SalaryGuide() {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('India');

  const topJobs = [
    { title: 'Software Engineer', salary: '₹8,80,578' },
    { title: 'Registered Nurse', salary: '₹2,37,112' },
    { title: 'Accountant', salary: '₹2,68,603' },
    { title: 'Business Analyst', salary: '₹9,00,127' },
    { title: 'Nursing Assistant', salary: '₹2,82,647' },
    { title: 'Sales Executive', salary: '₹2,62,250' }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      
{/* Blue Hero Banner */}
<div style={{ 
  background: 'linear-gradient(135deg, #00225F 0%, #0044B0 100%)', // Modern Gradient Depth
  color: '#FFFFFF',
  padding: '80px 20px 120px 20px', 
  position: 'relative',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
  WebkitFontSmoothing: 'antialiased',
  textAlign: 'center' // Centering makes it feel more like a modern hero landing
}}>
  <div style={{ maxWidth: '800px', margin: '0 auto' }}>
    <h1 style={{ 
      fontSize: 'clamp(28px, 5vw, 42px)', // Fluid font sizing
      fontWeight: '700',
      letterSpacing: '-0.5px', // Modern typography kerning
      margin: '0 0 16px 0',
      color: '#FFFFFF'
    }}>
      Discover your earning potential
    </h1>
    <p style={{ 
      fontSize: 'clamp(16px, 2vw, 20px)', 
      fontWeight: '300', // Lighter weight feels more elegant
      color: 'rgba(255, 255, 255, 0.9)', // Slightly softer white for better hierarchy
      lineHeight: '1.5',
      margin: 0
    }}>
      Explore high-paying careers, salaries, and job openings tailored to your industry and location.
    </p>
  </div>
</div>


      {/* Floating Search Box */}
      <div style={{ maxWidth: '1000px', margin: '-50px auto 40px auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2d2d2d', fontSize: '14px' }}>What</label>
            <input 
              type="text" 
              placeholder="Job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #767676', borderRadius: '8px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2d2d2d', fontSize: '14px' }}>Where</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #767676', borderRadius: '8px' }}
            />
          </div>
          <button style={{ backgroundColor: '#9BB1E8', color: '#00225F', padding: '14px 30px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Search
          </button>
        </div>
      </div>

      {/* Grid Section */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '15px' }}>Browse top-paying jobs by industry</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#2d2d2d' }}>Choose an industry</label>
          <select style={{ padding: '10px 15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #767676', width: '250px' }}>
            <option>All Industries</option>
            <option>Technology</option>
            <option>Healthcare</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {topJobs.map((job, idx) => (
            <div key={idx} style={{ border: '1px solid #ececec', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#2d2d2d' }}>{job.title}</h3>
                <span style={{ color: '#2d2d2d', fontWeight: 'bold' }}>›</span>
              </div>
              <p style={{ margin: 0, color: '#2557a7', fontSize: '14px', fontWeight: 'bold' }}>Average salary {job.salary} per year</p>
              <span style={{ fontSize: '14px', color: '#595959', textDecoration: 'underline', marginTop: '10px' }}>Job openings</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default SalaryGuide;