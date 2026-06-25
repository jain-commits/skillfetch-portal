import React from 'react';
import { FaUserCircle, FaNetworkWired, FaBriefcase, FaSignOutAlt, FaInfoCircle, FaUser } from 'react-icons/fa';
import { getAvatarUrl } from '../utils/avatars';

function Navbar({ currentUser, currentPage, setCurrentPage, handleLogout }) {
  const isCandidate = currentUser?.role === 'candidate';
  const isEmployer = currentUser?.role === 'employer';
  const isAdmin = currentUser?.role === 'admin';

  const avatarUrl = currentUser ? getAvatarUrl(currentUser.avatar, currentUser.name) : '';

  return (
    <>
      <nav className="sf-navbar">
        <div className="sf-navbar-container">
          
          {/* Left Side: Logo + Main Nav Links */}
          <div className="sf-nav-left">
            <div 
              className="sf-nav-logo"
              onClick={() => setCurrentPage('home')}
            >
              <img src="/logo.png" alt="SkillFetch" />
            </div>

            <div className="sf-nav-links">
              <span 
                className={`sf-nav-link-item ${currentPage === 'home' || currentPage === 'job-listings' || currentPage === 'job-detail' ? 'active' : ''}`}
                onClick={() => setCurrentPage('home')}
              >
                <FaBriefcase className="nav-icon" /> Find Jobs
              </span>

              {isCandidate && (
                <span 
                  className={`sf-nav-link-item ${currentPage === 'network' ? 'active' : ''}`}
                  onClick={() => setCurrentPage('network')}
                >
                  <FaNetworkWired className="nav-icon" /> Network
                </span>
              )}

              {currentUser && (
                <span 
                  className={`sf-nav-link-item ${currentPage.includes('dashboard') || currentPage === 'admin-panel' || currentPage === 'post-job' ? 'active' : ''}`}
                  onClick={() => {
                    if (isEmployer) setCurrentPage('employer-dashboard');
                    else if (isAdmin) setCurrentPage('admin-panel');
                    else setCurrentPage('candidate-dashboard');
                  }}
                >
                  <FaUserCircle className="nav-icon" /> Dashboard
                </span>
              )}

              <span 
                className={`sf-nav-link-item ${currentPage === 'about' ? 'active' : ''}`}
                onClick={() => setCurrentPage('about')}
              >
                <FaInfoCircle className="nav-icon" /> About
              </span>
            </div>
          </div>

          {/* Right Side: Profile & Authentication */}
          <div className="sf-nav-right">
            {currentUser ? (
              <div className="sf-nav-user-area">
                <div 
                  className="sf-nav-profile-trigger"
                  onClick={() => setCurrentPage('profile')}
                >
                  <img 
                    src={avatarUrl} 
                    alt="My avatar" 
                    className="sf-nav-avatar"
                  />
                  <span className="sf-nav-username">{currentUser.name}</span>
                </div>
                <div className="sf-nav-divider"></div>
                <button 
                  onClick={handleLogout} 
                  className="sf-nav-signout-btn"
                  title="Sign Out"
                >
                  <FaSignOutAlt style={{ marginRight: '6px' }} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="sf-nav-auth-buttons">
                <span 
                  className="sf-nav-link-item blue-text"
                  onClick={() => setCurrentPage('login')}
                >
                  Sign In
                </span>
                <div className="sf-nav-divider"></div>
                
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sf-mobile-bottom-nav">
        <div className="sf-mobile-bottom-nav-container">
          <div 
            className={`sf-mobile-nav-item ${currentPage === 'home' || currentPage === 'job-listings' || currentPage === 'job-detail' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <FaBriefcase className="mobile-nav-icon" />
            <span>Jobs</span>
          </div>

          {isCandidate && (
            <div 
              className={`sf-mobile-nav-item ${currentPage === 'network' ? 'active' : ''}`}
              onClick={() => setCurrentPage('network')}
            >
              <FaNetworkWired className="mobile-nav-icon" />
              <span>Network</span>
            </div>
          )}

          {currentUser ? (
            <div 
              className={`sf-mobile-nav-item ${currentPage.includes('dashboard') || currentPage === 'admin-panel' || currentPage === 'post-job' ? 'active' : ''}`}
              onClick={() => {
                if (isEmployer) setCurrentPage('employer-dashboard');
                else if (isAdmin) setCurrentPage('admin-panel');
                else setCurrentPage('candidate-dashboard');
              }}
            >
              <FaUserCircle className="mobile-nav-icon" />
              <span>Dashboard</span>
            </div>
          ) : (
            <div 
              className={`sf-mobile-nav-item ${currentPage === 'login' ? 'active' : ''}`}
              onClick={() => setCurrentPage('login')}
            >
              <FaUser className="mobile-nav-icon" />
              <span>Sign In</span>
            </div>
          )}

          {currentUser && (
            <div 
              className={`sf-mobile-nav-item ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentPage('profile')}
            >
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="sf-mobile-nav-avatar"
              />
              <span>Profile</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
