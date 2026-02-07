import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard/');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
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
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard">
      <h1 className="leaderboard-title">Leaderboard</h1>
      <p className="leaderboard-subtitle">Top contributors in the SkillSwap community</p>
      
      <div className="leaderboard-container">
        {users.length > 0 ? (
          <div className="leaderboard-table">
            <div className="table-header">
              <div className="header-cell rank">Rank</div>
              <div className="header-cell user">User</div>
              <div className="header-cell points">Skill Points</div>
              <div className="header-cell swaps">Swaps</div>
              <div className="header-cell rating">Rating</div>
              <div className="header-cell badges">Badges</div>
            </div>
            
            {users.map((user, index) => (
              <div key={user._id} className="table-row">
                <div className="cell rank">
                  <div className="rank-display">
                    {getRankIcon(index + 1)}
                  </div>
                </div>
                
                <div className="cell user">
                  <div className="user-info">
                    <div className="username">{user.username}</div>
                    <div className="user-stats">
                      {user.completedSwaps} swaps completed
                    </div>
                  </div>
                </div>
                
                <div className="cell points">
                  <div className="points-display">{user.skillPoints}</div>
                </div>
                
                <div className="cell swaps">
                  <div className="swaps-display">{user.completedSwaps}</div>
                </div>
                
                <div className="cell rating">
                  <div className="rating-display">
                    {renderStars(Math.round(user.averageRating))}
                    <span className="rating-number">({user.averageRating.toFixed(1)})</span>
                  </div>
                </div>
                
                <div className="cell badges">
                  <div className="badges-display">
                    {user.badges.length > 0 ? (
                      <div className="badge-list">
                        {user.badges.map((badge, badgeIndex) => (
                          <span key={badgeIndex} className="badge">🏅</span>
                        ))}
                        <span className="badge-count">{user.badges.length}</span>
                      </div>
                    ) : (
                      <span className="no-badges">0</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-users">
            <p>No users found on the leaderboard</p>
          </div>
        )}
      </div>
      
      <div className="leaderboard-info">
        <h2>How Points Are Earned</h2>
        <ul>
          <li>Complete a skill swap: +10 points</li>
          <li>Receive a 5-star rating: +5 bonus points</li>
          <li>Help others in the community: +3 points (verified by moderators)</li>
          <li>Contribute quality content: +2 points (verified by moderators)</li>
        </ul>
        
        <h2>Badge System</h2>
        <ul>
          <li>First Swap: Complete your first skill swap</li>
          <li>Skill Swapper: Complete 5 skill swaps</li>
          <li>Master Exchanger: Complete 10 skill swaps</li>
          <li>Top Contributor: Reach the top 10 on the leaderboard</li>
          <li>Expert: Maintain a 5-star average rating with at least 5 reviews</li>
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;