import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

function SkillFetchNavbar({ currentUser, setCurrentPage, handleLogout }) {
  return (
    <nav className="sf-navbar">
      
      {/* Left side: Logo + Main Links */}
      <div className="sf-nav-left">
        <div 
          onClick={() => setCurrentPage('home')} 
          style={{ cursor: 'pointer', fontSize: '24px', fontWeight: '700', color: '#2557a7', letterSpacing: '-0.5px' }}
        >
          SkillFetch
        </div>
        
        {/* Indeed replica left-links */}
        <div className="sf-nav-main-links">
          <div className="sf-nav-main-link active">Home</div>
          <div className="sf-nav-main-link">Company reviews</div>
          <div className="sf-nav-main-link">Salary guide</div>
        </div>
      </div>

      {/* Right side: Auth Links */}
      <div className="sf-nav-links">
        {currentUser ? (
          <>
            <span className="sf-nav-item" onClick={() => setCurrentPage('profile')}>
              <FaUserCircle style={{ marginRight: '6px', fontSize: '18px' }}/> Profile
            </span>
            <div className="sf-nav-divider"></div>
            <span className="sf-nav-item" onClick={handleLogout}>Sign Out</span>
          </>
        ) : (
          <>
            <span className="sf-nav-item blue-text" onClick={() => setCurrentPage('login')}>Sign in</span>
            <div className="sf-nav-divider"></div>
            <span className="sf-nav-item" onClick={() => setCurrentPage('login')}>Employers / Post Job</span>
          </>
        )}
      </div>
    </nav>
  );
}
export default SkillFetchNavbar;