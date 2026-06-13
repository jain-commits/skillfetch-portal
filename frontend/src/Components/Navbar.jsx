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


// .css file to be pasted on index.css when used

// .apple-navbar {
//   background-color: rgba(255, 255, 255, 0.72); /* Slight transparency */
//   backdrop-filter: saturate(180%) blur(20px); /* The frosted glass effect */
//   -webkit-backdrop-filter: saturate(180%) blur(20px); /* For Safari */
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   height: 44px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   z-index: 9999;
//   border-bottom: 1px solid rgba(0, 0, 0, 0.05); /* Very subtle bottom border */
//   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
// }

// .apple-navbar-container {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   width: 100%;
//   max-width: 1024px; /* Keeps links from spreading too far on giant screens */
//   padding: 0 16px;
// }

// .apple-nav-link,
// .apple-nav-icon {
//   color: rgba(0, 0, 0, 0.8);
//   text-decoration: none;
//   font-size: 12px;
//   font-weight: 400;
//   letter-spacing: -0.01em;
//   transition: color 0.3s ease, opacity 0.3s ease;
//   display: flex;
//   align-items: center;
//   cursor: pointer;
// }

// .apple-nav-icon {
//   font-size: 16px; /* Icons are slightly larger than the text */
//   opacity: 0.8;
// }

// /* Hover effect: text gets slightly darker, just like Apple's site */
// .apple-nav-link:hover {
//   color: #000000;
// }

// .apple-nav-icon:hover {
//   opacity: 1;
// }

// /* Ensure the rest of your app doesn't hide behind the fixed navbar */
// body {
//   padding-top: 44px; 
// }

// /* Mobile Responsiveness - Hide text links on small screens */
// @media (max-width: 833px) {
//   .apple-nav-link {
//     display: none;
//   }
// }
