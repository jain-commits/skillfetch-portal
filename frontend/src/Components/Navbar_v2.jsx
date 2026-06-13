import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

function SkillFetchNavbar({ currentUser, currentPage, setCurrentPage, handleLogout }) {
  return (
   <nav className="sf-navbar"> {/* Added missing wrapper */}
      
      {/* Left side: Logo + Main Links */}
      <div className="sf-nav-left">
        <div 
          onClick={() => setCurrentPage('home')} 
          style={{ cursor: 'pointer', fontSize: '24px', fontWeight: '700', color: '#2557a7', letterSpacing: '-0.5px' }}
        >
          SkillFetch
        </div>

        <div className="sf-nav-main-links">
          <div 
            className={`sf-nav-main-link ${currentPage === 'home' ? 'active' : ''}`} 
            onClick={() => setCurrentPage('home')}
          >
            Home
          </div>

          <div 
            className={`sf-nav-main-link ${currentPage === 'reviews' ? 'active' : ''}`} 
            onClick={() => setCurrentPage('reviews')}
          >
            Company reviews
          </div>

          <div 
            className={`sf-nav-main-link ${currentPage === 'salaries' ? 'active' : ''}`} 
            onClick={() => setCurrentPage('salaries')}
          >
            Salary guide
          </div>
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