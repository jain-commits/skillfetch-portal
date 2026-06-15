import React from 'react';

function AboutUs({ setCurrentPage }) {
  const teamMembers = [
    { name: 'Dixon Anto', role: 'Backend Developer', github: 'https://github.com/DixonAnto' },
    { name: 'Karthik', role: 'Frontend Developer', github: 'https://github.com/karthi-1010' },
    { name: 'Ajay', role: 'Backend Developer', github: 'https://github.com/ajay1428' },
    { name: 'Fasil', role: 'Frontend Developer', github: 'https://github.com/fasilv29' },
    { name: 'Jain', role: 'Backend Developer', github: 'https://github.com/jain-commits' },
  ];

  return (
    <div className="card" style={{ padding: '40px 20px', maxWidth: '850px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '26px', fontWeight: '800' }}>About SkillFetch</h2>
      
      <div style={{ lineHeight: '1.8', fontSize: '15px', color: '#4b5563' }}>
        <p>
          Welcome to <strong>SkillFetch</strong>, a comprehensive professional networking and job discovery platform. Designed with a seamless user experience in mind, our goal is to bridge the gap between talented job seekers and actively hiring recruiters.
        </p>
        
        <p>
          Whether you are a professional looking to take the next step in your career, or an employer searching for the perfect candidate to join your team, SkillFetch provides the tools you need:
        </p>

        <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
          <li><strong>For Job Seekers:</strong> Browse open roles, connect with peers, submit applications, and track your hiring status in real time.</li>
          <li><strong>For Employers & Recruiters:</strong> Post job listings, manage incoming applications, and shortlist top-tier talent through an intuitive ATS dashboard.</li>
        </ul>

        <hr style={{ borderColor: '#e5e7eb', margin: '40px 0' }} />

        {/* Team Section Header */}
        <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '20px', fontWeight: '700' }}>The Team Behind SkillFetch</h3>
        <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '14px' }}>
          SkillFetch is the result of a collaborative project built by a dedicated team of 5 members. 
        </p>

        {/* Modern Team Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {teamMembers.map((member, index) => (
            <div key={index} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px 10px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
              {/* Profile Avatar Circle */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#2563EB', // Uses your app's primary blue
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto 15px auto'
              }}>
                {member.name.charAt(0)}
              </div>
              
              <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#111827', fontWeight: '700' }}>{member.name}</h4>
              <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#6b7280' }}>{member.role}</p>
              
              <a 
                href={member.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '15px' }}
              >
                GitHub Profile
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AboutUs;
