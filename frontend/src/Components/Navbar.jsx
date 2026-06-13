
//This nav bar is only used for testing; never used. 

import React from 'react';
import { FaApple } from 'react-icons/fa';
import { IoSearchOutline, IoBagOutline } from 'react-icons/io5';

function AppleNavbar() {
  return (
    <nav className="apple-navbar">
      <div className="apple-navbar-container">
        
        {/* Logo */}
        <a href="/" className="apple-nav-icon">
          <FaApple style={{ fontSize: '18px' }} />
        </a>

        {/* Navigation Links */}
        <a href="#store" className="apple-nav-link">Store</a>
        <a href="#mac" className="apple-nav-link">Mac</a>
        <a href="#ipad" className="apple-nav-link">iPad</a>
        <a href="#iphone" className="apple-nav-link">iPhone</a>
        <a href="#watch" className="apple-nav-link">Watch</a>
        <a href="#vision" className="apple-nav-link">Vision</a>
        <a href="#airpods" className="apple-nav-link">AirPods</a>
        <a href="#tv" className="apple-nav-link">TV & Home</a>
        <a href="#entertainment" className="apple-nav-link">Entertainment</a>
        <a href="#accessories" className="apple-nav-link">Accessories</a>
        <a href="#support" className="apple-nav-link">Support</a>

        {/* Right Side Icons */}
        <a href="#search" className="apple-nav-icon">
          <IoSearchOutline />
        </a>
        <a href="#cart" className="apple-nav-icon">
          <IoBagOutline />
        </a>

      </div>
    </nav>
  );
}

export default AppleNavbar;