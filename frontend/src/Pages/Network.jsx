import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaUserPlus, FaUserCheck, FaUserTimes, FaMapMarkerAlt, FaUsers, FaArrowRight } from 'react-icons/fa';
import { getAvatarUrl } from '../utils/avatars';

function Network({ currentUser, API_BASE_URL }) {
  const [connections, setConnections] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch connections and recommendations
  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Fetch connections
      const connRes = await fetch(`${API_BASE_URL}/api/connections?userId=${currentUser.id}`);
      if (connRes.ok) {
        const connData = await connRes.json();
        setConnections(connData);
      }

      // 2. Fetch recommendations
      const recRes = await fetch(`${API_BASE_URL}/api/users/network-recommendations?userId=${currentUser.id}`);
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching network data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Send request
  const handleConnectRequest = async (targetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, receiverId: targetId })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Request failed.');
        return;
      }
      toast.success('Connection request sent!');
      // Update local state: add to connections and remove from recommendations
      setConnections([...connections, data]);
      setRecommendations(recommendations.filter(r => (r._id !== targetId && r.id !== targetId)));
    } catch (err) {
      console.error(err);
      toast.error('Network error.');
    }
  };

  // Respond to request (accept or reject)
  const handleRespond = async (connectionId, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, status: action })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || 'Failed to respond.');
        return;
      }

      if (action === 'accepted') {
        toast.success('Connection accepted!');
        // Update connection in list
        setConnections(connections.map(c => (c._id === connectionId || c.id === connectionId) ? data : c));
      } else {
        toast.success('Connection request ignored.');
        // Remove from list
        setConnections(connections.filter(c => (c._id !== connectionId && c.id !== connectionId)));
      }
      
      // Refresh recommendations list as accepted users might have friends or we need clean lists
      const recRes = await fetch(`${API_BASE_URL}/api/users/network-recommendations?userId=${currentUser.id}`);
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error.');
    }
  };

  // Disconnect / Remove
  const handleRemove = async (connectionId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Connection removed.');
        setConnections(connections.filter(c => (c._id !== connectionId && c.id !== connectionId)));
        
        // Refresh recommendations
        const recRes = await fetch(`${API_BASE_URL}/api/users/network-recommendations?userId=${currentUser.id}`);
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData);
        }
      } else {
        toast.error('Failed to remove connection.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error.');
    }
  };

  // Filter lists
  const pendingRequests = connections.filter(c => c.status === 'pending' && (c.receiverId?._id === currentUser?.id || c.receiverId?.id === currentUser?.id));
  const sentPending = connections.filter(c => c.status === 'pending' && (c.senderId?._id === currentUser?.id || c.senderId?.id === currentUser?.id));
  const myConnections = connections.filter(c => c.status === 'accepted');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="loader2" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '15px', color: '#6b7280' }}>Loading your network...</p>
      </div>
    );
  }

  return (
    <div className="network-page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      {/* Network Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
        <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '50%', color: '#2563EB' }}>
          <FaUsers style={{ fontSize: '32px' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '26px', color: '#111827', fontWeight: '800', margin: 0 }}>My Professional Network</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
            Build connections, review requests, and discover opportunities through professionals in India.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="network-layout-grid">
        
        {/* LEFT PANEL: Recommendations & Connection List */}
        <div>
          
          {/* 1. Pending Connection Requests (Incoming) */}
          {pendingRequests.length > 0 && (
            <div className="card" style={{ padding: '20px', marginBottom: '35px', borderColor: '#e5e7eb' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 15px 0' }}>
                🔔 Pending Connection Requests ({pendingRequests.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {pendingRequests.map(req => {
                  const sender = req.senderId;
                  if (!sender) return null;
                  const senderAvatar = getAvatarUrl(sender.avatar, sender.name);
                  return (
                    <div key={req._id || req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={senderAvatar} alt={sender.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{sender.name}</h4>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#4b5563', lineHeight: '1.3' }}>{sender.headline || (sender.role === 'employer' ? 'Employer' : sender.role === 'admin' ? 'Administrator' : 'Software Professional')}</p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#9ca3af' }}><FaMapMarkerAlt /> {sender.location || 'India'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleRespond(req._id || req.id, 'accepted')} className="btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Accept
                        </button>
                        <button onClick={() => handleRespond(req._id || req.id, 'rejected')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Ignore
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. People You May Know */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 20px 0' }}>
              ✨ People You May Know
            </h3>
            
            {recommendations.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>No new recommendations at this time.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                {recommendations.map(person => {
                  const avatar = getAvatarUrl(person.avatar, person.name);
                  return (
                    <div key={person._id || person.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to right, #eff6ff, #dbeafe)' }}></div>
                      
                      <img 
                        src={avatar} 
                        alt={person.name} 
                        style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #ffffff', zIndex: 1, marginTop: '8px', objectFit: 'cover' }} 
                      />
                      
                      <h4 style={{ margin: '10px 0 2px 0', fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                        {person.name}
                      </h4>
                      
                      <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#4b5563', lineHeight: '1.3', minHeight: '30px' }}>
                        {person.headline || (person.role === 'employer' ? 'Employer' : person.role === 'admin' ? 'Administrator' : 'Software Developer')}
                      </p>
                      
                      <button 
                        onClick={() => handleConnectRequest(person._id || person.id)} 
                        className="btn btn-secondary" 
                        style={{ width: '100%', fontSize: '12px', padding: '6px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <FaUserPlus /> Connect
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: Connections Stats & Sent Requests */}
        <div>
          
          {/* Connections stats */}
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>
              Connection Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '13px', color: '#4b5563' }}>My Connections</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{myConnections.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ fontSize: '13px', color: '#4b5563' }}>Sent Pending Requests</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{sentPending.length}</span>
            </div>
          </div>

          {/* List of active connections */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 15px 0' }}>
              🤝 My Connections ({myConnections.length})
            </h3>
            
            {myConnections.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>You haven't connected with anyone yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myConnections.map(c => {
                  const partner = c.senderId?._id === currentUser.id ? c.receiverId : c.senderId;
                  if (!partner) return null;
                  const partnerAvatar = getAvatarUrl(partner.avatar, partner.name);
                  return (
                    <div key={c._id || c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={partnerAvatar} alt={partner.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{partner.name}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '130px' }}>{partner.headline || (partner.role === 'employer' ? 'Employer' : partner.role === 'admin' ? 'Administrator' : 'Connected')}</div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleRemove(c._id || c.id)} 
                        title="Disconnect" 
                        style={{ border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', padding: '5px' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                      >
                        <FaUserTimes />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Network;
