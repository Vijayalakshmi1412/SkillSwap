import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [swapStats, setSwapStats] = useState({
    incoming: 0,
    outgoing: 0,
    pending: 0,
    accepted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSwapStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/swaps/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const incomingCount = data.incoming ? data.incoming.length : 0;
          const outgoingCount = data.outgoing ? data.outgoing.length : 0;
          const pendingCount = [
            ...(data.incoming || []),
            ...(data.outgoing || [])
          ].filter(swap => swap.status === 'pending').length;
          const acceptedCount = [
            ...(data.incoming || []),
            ...(data.outgoing || [])
          ].filter(swap => swap.status === 'accepted').length;
          
          setSwapStats({
            incoming: incomingCount,
            outgoing: outgoingCount,
            pending: pendingCount,
            accepted: acceptedCount,
          });
        }
      } catch (err) {
        console.error('Error fetching swap stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSwapStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Welcome back, {user.username}!</h1>
      <p className="dashboard-subtitle">Here's an overview of your SkillSwap activity</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{user.credits}</div>
          <div className="stat-label">Credits</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{user.skillPoints}</div>
          <div className="stat-label">Skill Points</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{user.badges.length}</div>
          <div className="stat-label">Badges Earned</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{user.completedSwaps}</div>
          <div className="stat-label">Completed Swaps</div>
        </div>
      </div>
      
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/profile" className="action-card">
            <div className="action-icon">👤</div>
            <div className="action-title">Edit Profile</div>
            <div className="action-description">Update your skills and availability</div>
          </Link>
          
          <Link to="/skills" className="action-card">
            <div className="action-icon">🔍</div>
            <div className="action-title">Find Skills</div>
            <div className="action-description">Browse and search for skills to learn</div>
          </Link>
          
          <Link to="/swap-requests" className="action-card">
            <div className="action-icon">📨</div>
            <div className="action-title">Swap Requests</div>
            <div className="action-description">
              {swapStats.pending > 0 
                ? `${swapStats.pending} pending requests` 
                : 'View your swap requests'}
            </div>
          </Link>
          
          <Link to="/leaderboard" className="action-card">
            <div className="action-icon">🏆</div>
            <div className="action-title">Leaderboard</div>
            <div className="action-description">See top contributors</div>
          </Link>
        </div>
      </div>
      
      <div className="dashboard-section">
        <h2 className="section-title">Your Badges</h2>
        {user.badges.length > 0 ? (
          <div className="badges-container">
            {user.badges.map((badge, index) => (
              <div key={index} className="badge-item">
                <div className="badge-icon">🏅</div>
                <div className="badge-name">{badge}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-badges">Complete skill swaps to earn badges!</p>
        )}
      </div>
      
      <div className="dashboard-section">
        <h2 className="section-title">Your Skills</h2>
        <div className="skills-container">
          <div className="skill-group">
            <h3>Skills You Offer</h3>
            {user.skillsOffered.length > 0 ? (
              <div className="skill-list">
                {user.skillsOffered.map((skill, index) => (
                  <div key={index} className="skill-tag">{skill}</div>
                ))}
              </div>
            ) : (
              <p className="no-skills">No skills offered yet</p>
            )}
          </div>
          
          <div className="skill-group">
            <h3>Skills You Want</h3>
            {user.skillsWanted.length > 0 ? (
              <div className="skill-list">
                {user.skillsWanted.map((skill, index) => (
                  <div key={index} className="skill-tag">{skill}</div>
                ))}
              </div>
            ) : (
              <p className="no-skills">No skills wanted yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;