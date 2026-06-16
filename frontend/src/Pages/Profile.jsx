import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaUser, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaFileUpload, FaEye, FaDownload, FaBuilding, FaGlobe, FaHeading } from 'react-icons/fa';
import { defaultAvatars, getAvatarUrl } from '../utils/avatars';

function Profile({ currentUser, setCurrentUser, API_BASE_URL }) {
  const isCandidate = currentUser?.role === 'candidate';
  const isEmployer = currentUser?.role === 'employer';
  const isAdmin = currentUser?.role === 'admin';

  // Profile Form States
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [skills, setSkills] = useState(currentUser?.skills || '');
  const [education, setEducation] = useState(currentUser?.education || '');
  const [experience, setExperience] = useState(currentUser?.experience || '');
  const [headline, setHeadline] = useState(currentUser?.headline || '');

  // Employer Specific States
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [companyLocation, setCompanyLocation] = useState(currentUser?.companyLocation || '');
  const [companyDesc, setCompanyDesc] = useState(currentUser?.companyDesc || '');
  const [gender, setGender] = useState(currentUser?.gender || '');
  const [dbAvatars, setDbAvatars] = useState([]);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/avatars`);
        if (res.ok) {
          const data = await res.json();
          setDbAvatars(data);
        }
      } catch (err) {
        console.error('Failed to fetch avatars:', err);
      }
    };
    fetchAvatars();
  }, [API_BASE_URL]);

  // Avatar State
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || 'avatar1');
  const [customAvatarBase64, setCustomAvatarBase64] = useState('');

  // Resume State
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [resumeName, setResumeName] = useState(currentUser?.resumeName || currentUser?.resume?.name || '');
  const [showPreview, setShowPreview] = useState(false);

  // Handle avatar changes
  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
    setCustomAvatarBase64(''); // Reset custom upload if choosing a default
  };

  // Convert custom upload to base64
  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatarBase64(reader.result);
        setSelectedAvatar('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile submission handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Choose either the default avatar ID or the custom base64 string
    const avatarValue = selectedAvatar === 'custom' ? customAvatarBase64 : selectedAvatar;

    const payload = {
      name,
      phone,
      location,
      bio,
      skills,
      education,
      experience,
      headline,
      avatar: avatarValue,
      gender: isCandidate ? gender : '',
    };

    if (isEmployer) {
      payload.companyName = companyName;
      payload.companyLocation = companyLocation;
      payload.companyDesc = companyDesc;
      // For employers, we can sync companyLogo to their avatar as well
      payload.companyLogo = avatarValue;
    }

    try {
      const userId = currentUser.id || currentUser._id;
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) return toast.error(data.message || 'Profile update failed!');
      
      setCurrentUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      toast.success('Profile saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Network error during profile update.');
    }
  };

  // Resume upload handler
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5MB.');
      return;
    }

    setUploadStatus('⏳ Uploading resume...');
    const userId = currentUser.id || currentUser._id;
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', userId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setUploadStatus('✅ Uploaded successfully!');
        setResumeName(data.resumeName);
        
        // Sync user in localstorage
        const updatedUser = { 
          ...currentUser, 
          resumeName: data.resumeName, 
          resume: { name: data.resumeName } 
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        toast.success('Resume uploaded successfully!');
      } else {
        setUploadStatus('❌ Upload failed.');
        toast.error('Failed to upload resume.');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('❌ Connection error.');
      toast.error('Connection error uploading resume.');
    }
  };

  // Determine which image URL to preview in settings page
  const previewImgUrl = selectedAvatar === 'custom' 
    ? customAvatarBase64 
    : (selectedAvatar && selectedAvatar.startsWith('data:image') ? selectedAvatar : getAvatarUrl(selectedAvatar, name));

  return (
    <div className="profile-page-container">
      <div className="profile-header-banner">
        <h2>My Profile Settings</h2>
        <p>Keep your professional presence up to date to stand out to employers and connections.</p>
      </div>

      <div className="profile-grid">
        
        {/* LEFT PANEL: Editing Fields */}
        <div className="profile-card-edit card">
          <form onSubmit={handleProfileSubmit}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
              👤 Personal Information
            </h3>

            <div className="form-row-2col">
              <div className="form-group">
                <label><FaUser style={{ marginRight: '6px' }} /> Full Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label><FaPhone style={{ marginRight: '6px' }} /> Phone Number</label>
                <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label><FaMapMarkerAlt style={{ marginRight: '6px' }} /> Location / City</label>
                <input type="text" className="form-control" placeholder="e.g. Bangalore, Karnataka" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label><FaHeading style={{ marginRight: '6px' }} /> Headline</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={isEmployer ? "e.g. Recruiter at Aura Tech" : "e.g. Frontend React Dev | seeking roles"} 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Professional Bio / Summary</label>
              <textarea className="form-control" rows={3} placeholder="Write a short summary about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            {/* CANDIDATE SPECIFIC FIELDS */}
            {isCandidate && (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '30px 0 20px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                  💼 Career & Professional Details
                </h3>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label>Gender</label>
                    <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Skills (comma separated)</label>
                    <input type="text" className="form-control" placeholder="e.g. React, Node.js, CSS, Python" value={skills} onChange={(e) => setSkills(e.target.value)} />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label><FaGraduationCap /> Highest Education</label>
                    <input type="text" className="form-control" placeholder="e.g. BS Computer Science" value={education} onChange={(e) => setEducation(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label><FaBriefcase /> Work Experience</label>
                    <input type="text" className="form-control" placeholder="e.g. 2 years at TCS" value={experience} onChange={(e) => setExperience(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* EMPLOYER SPECIFIC FIELDS */}
            {isEmployer && (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '30px 0 20px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                  🏢 Company Details
                </h3>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label><FaBuilding /> Company Name</label>
                    <input type="text" className="form-control" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label><FaGlobe /> Company Location</label>
                    <input type="text" className="form-control" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Company Description</label>
                  <textarea className="form-control" rows={3} value={companyDesc} onChange={(e) => setCompanyDesc(e.target.value)} />
                </div>
              </>
            )}

            <button type="submit" className="btn" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: Avatar Picker & Resume Upload */}
        <div className="profile-card-addons">
          
          {/* AVATAR SYSTEM CARD */}
          <div className="card avatar-settings-card" style={{ padding: '25px', textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 15px 0', textAlign: 'left' }}>
              🖼️ Profile Avatar
            </h3>
            
            <img 
              src={previewImgUrl} 
              alt="My Avatar Preview" 
              className="settings-avatar-preview"
            />
            
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '10px 0 20px 0' }}>
              Choose a preset gradient avatar or upload a custom image.
            </p>

            {/* Default Avatar Preset Grid */}
            <div className="avatar-preset-grid">
              {isCandidate && gender === 'male' && dbAvatars.filter(av => av.name.startsWith('male')).map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleAvatarSelect(av.data)}
                  type="button"
                  className={`avatar-preset-dot ${selectedAvatar === av.data ? 'active-dot' : ''}`}
                  style={{ 
                    backgroundImage: `url(${av.data})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: selectedAvatar === av.data ? '3px solid #0a66c2' : '1px solid #e5e7eb',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%'
                  }}
                  title={av.name}
                />
              ))}

              {isCandidate && gender === 'female' && dbAvatars.filter(av => av.name.startsWith('female')).map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleAvatarSelect(av.data)}
                  type="button"
                  className={`avatar-preset-dot ${selectedAvatar === av.data ? 'active-dot' : ''}`}
                  style={{ 
                    backgroundImage: `url(${av.data})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: selectedAvatar === av.data ? '3px solid #0a66c2' : '1px solid #e5e7eb',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%'
                  }}
                  title={av.name}
                />
              ))}

              {/* Show gradient presets if not candidate, or gender is other/empty */}
              {(!isCandidate || (gender !== 'male' && gender !== 'female')) && defaultAvatars.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleAvatarSelect(av.id)}
                  type="button"
                  className={`avatar-preset-dot ${selectedAvatar === av.id ? 'active-dot' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${av.colors[0]}, ${av.colors[1]})` }}
                  title={av.label}
                />
              ))}
            </div>

            {isCandidate && !gender && (
              <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '10px', fontWeight: '600' }}>
                Select Male or Female gender in profile details to unlock vector avatars!
              </p>
            )}

            {/* Custom Image Upload */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
              <input
                type="file"
                id="custom-avatar-file"
                accept="image/*"
                onChange={handleCustomAvatarUpload}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="custom-avatar-file" 
                className="btn btn-secondary" 
                style={{ cursor: 'pointer', fontSize: '12px', padding: '6px 12px' }}
              >
                Upload Custom Picture
              </label>
            </div>
          </div>

          {/* RESUME MANAGEMENT CARD (CANDIDATES ONLY) */}
          {isCandidate && (
            <div className="card resume-settings-card" style={{ padding: '25px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 15px 0' }}>
                📄 Resume & Documents
              </h3>
              
              <div className="resume-upload-zone">
                <input 
                  type="file" 
                  id="resume-settings-upload"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="resume-settings-upload" className="resume-zone-label">
                  <FaFileUpload style={{ fontSize: '24px', color: '#3b82f6', marginBottom: '8px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>
                    {resumeName ? 'Change Resume PDF' : 'Upload Resume PDF'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>PDF only (Max 5MB)</span>
                </label>
              </div>

              {resumeName && (
                <div className="resume-details-box" style={{ marginTop: '15px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', wordBreak: 'break-all' }}>
                    📄 {resumeName}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <a 
                      href={`${API_BASE_URL}/api/users/${currentUser.id || currentUser._id}/resume`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', padding: '6px' }}
                    >
                      <FaDownload /> Download
                    </a>
                  </div>
                </div>
              )}

              {uploadStatus && (
                <div style={{ 
                  marginTop: '10px', padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
                  backgroundColor: uploadStatus.includes('✅') ? '#dcfce7' : '#fee2e2',
                  color: uploadStatus.includes('✅') ? '#166534' : '#991b1b',
                  fontWeight: '500'
                }}>
                  {uploadStatus}
                </div>
              )}

              {/* Embedded Resume Preview */}
              {resumeName && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>
                      <FaEye /> Live PDF Preview
                    </h4>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                  {showPreview && (
                    <div className="resume-preview-container">
                      <iframe 
                        src={`${API_BASE_URL}/api/users/${currentUser.id || currentUser._id}/resume`} 
                        title="Resume Preview"
                        width="100%" 
                        height="350px" 
                        style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Profile;
