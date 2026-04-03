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
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch swap stats
        const swapsRes = await fetch('/api/swaps/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (swapsRes.ok) {
          const swapsData = await swapsRes.json();
          const incomingCount = swapsData.incoming ? swapsData.incoming.length : 0;
          const outgoingCount = swapsData.outgoing ? swapsData.outgoing.length : 0;
          const pendingCount = [
            ...(swapsData.incoming || []),
            ...(swapsData.outgoing || [])
          ].filter(swap => swap.status === 'pending').length;
          const acceptedCount = [
            ...(swapsData.incoming || []),
            ...(swapsData.outgoing || [])
          ].filter(swap => swap.status === 'accepted').length;
          
          setSwapStats({
            incoming: incomingCount,
            outgoing: outgoingCount,
            pending: pendingCount,
            accepted: acceptedCount,
          });
        }
        
        // Fetch recent reviews
        const reviewsRes = await fetch(`/api/reviews/user/${user._id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          // Get the 3 most recent reviews
          setRecentReviews(reviewsData.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user._id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Welcome back, {user?.username ?? 'User'}!</h1>
      <p className="dashboard-subtitle">Here's an overview of your TeachEach activity</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{user?.credits ?? 0}</div>
          <div className="stat-label">Credits</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{user?.skillPoints ?? 0}</div>
          <div className="stat-label">Skill Points</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{(user?.badges || []).length}</div>
          <div className="stat-label">Badges Earned</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{user?.completedSwaps ?? 0}</div>
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
      
      {/* New Reviews Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Reviews</h2>
          <Link to="/reviews" className="view-all-link">View All</Link>
        </div>
        
        {recentReviews.length > 0 ? (
          <div className="reviews-grid">
            {recentReviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <h3>From {review.reviewer.username}</h3>
                  <div className="review-date">{formatDate(review.date)}</div>
                </div>
                
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                
                {review.comment && (
                  <div className="review-comment">
                    <p>{review.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <p>No reviews yet. Complete skill swaps to receive reviews!</p>
          </div>
        )}
      </div>
      
      <div className="dashboard-section">
        <h2 className="section-title">Your Badges</h2>
        {(user?.badges || []).length > 0 ? (
          <div className="badges-container">
            {(user.badges || []).map((badge, index) => (
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
            {(user?.skillsOffered || []).length > 0 ? (
              <div className="skill-list">
                {(user.skillsOffered || []).map((skill, index) => (
                  <div key={index} className="skill-tag">{skill}</div>
                ))}
              </div>
            ) : (
              <p className="no-skills">No skills offered yet</p>
            )}
          </div>
          
          <div className="skill-group">
            <h3>Skills You Want</h3>
            {(user?.skillsWanted || []).length > 0 ? (
              <div className="skill-list">
                {(user.skillsWanted || []).map((skill, index) => (
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