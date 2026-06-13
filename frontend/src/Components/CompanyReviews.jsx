import React, { useState } from 'react';
import { FaSearch, FaStar, FaRegStar } from 'react-icons/fa';

function CompanyReviews({ setCurrentPage }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data based on the screenshot
  const popularCompanies = [
    { name: 'Swiggy', reviews: 402, rating: 4, logoText: 'S', color: '#fc8019' },
    { name: 'Zomato', reviews: 401, rating: 4, logoText: 'Z', color: '#e23744' },
    { name: 'Urban Company', reviews: 44, rating: 4, logoText: 'UC', color: '#000000' },
    { name: 'Tata Motors', reviews: 1884, rating: 4, logoText: 'TATA', color: '#0033a0' },
    { name: 'Milky Mist Dairy', reviews: 4, rating: 4, logoText: 'MM', color: '#1d4ed8' },
    { name: 'Amazon.com', reviews: 55572, rating: 4, logoText: 'A', color: '#ff9900' },
    { name: 'EY', reviews: 10736, rating: 4, logoText: 'EY', color: '#ffe600' },
    { name: 'Axis Bank', reviews: 3723, rating: 4, logoText: 'A', color: '#97144d' },
    { name: 'Foxconn', reviews: 2528, rating: 4, logoText: 'H', color: '#000000' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Section */}
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '10px' }}>Find great places to work</h1>
      <p style={{ fontSize: '18px', color: '#595959', marginBottom: '30px' }}>Get access to millions of company reviews</p>

      {/* Search Section */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#2d2d2d' }}>Company name or job title</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '15px', color: '#767676' }} />
            <input 
              type="text" 
              style={{ width: '100%', padding: '14px 14px 14px 40px', fontSize: '16px', borderRadius: '8px', border: '1px solid #767676' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button style={{ backgroundColor: '#085ff7', color: 'white', padding: '0 30px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            Find Companies
          </button>
        </div>
      </div>

      <p 
        onClick={() => setCurrentPage('salaries')} 
        style={{ color: '#2557a7', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', marginBottom: '50px' }}
      >
        Do you want to search for salaries?
      </p>

      {/* Grid Section */}
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d2d2d', marginBottom: '20px' }}>Popular companies</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {popularCompanies.map((company, idx) => (
          <div key={idx} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: '#f3f2f1', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: company.color, fontSize: '18px', border: '1px solid #ececec' }}>
                {company.logoText}
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#2d2d2d' }}>{company.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                  <div style={{ color: '#2d2d2d', display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => i < company.rating ? <FaStar key={i} /> : <FaRegStar key={i} />)}
                  </div>
                  <span style={{ color: '#2557a7', cursor: 'pointer' }}>{company.reviews} reviews</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '14px', color: '#595959' }}>
              <span style={{ cursor: 'pointer', hover: { textDecoration: 'underline' }}}>Salaries</span>
              <span style={{ cursor: 'pointer' }}>Questions</span>
              <span style={{ cursor: 'pointer' }}>Open jobs</span>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompanyReviews;