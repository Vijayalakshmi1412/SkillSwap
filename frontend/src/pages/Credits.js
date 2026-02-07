import React, { useState, useEffect } from 'react';
import './Credits.css';

const Credits = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch transaction history from the API
    // For this demo, we'll create mock transaction data
    const mockTransactions = [
      {
        id: 1,
        type: 'earned',
        amount: 5,
        description: 'Completed a skill swap with John',
        date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      },
      {
        id: 2,
        type: 'earned',
        amount: 5,
        description: 'Completed a skill swap with Sarah',
        date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      },
      {
        id: 3,
        type: 'earned',
        amount: 10,
        description: 'Welcome bonus',
        date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
      },
    ];
    
    setTransactions(mockTransactions);
    setLoading(false);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const useCredits = (amount) => {
    // In a real app, this would make an API call to use credits
    alert(`Using ${amount} credits for a premium feature. This would normally open a payment/confirmation flow.`);
  };

  if (loading) {
    return <div className="loading">Loading credits...</div>;
  }

  return (
    <div className="credits">
      <h1 className="credits-title">Credits</h1>
      
      <div className="credits-overview">
        <div className="credits-balance">
          <h2>Current Balance</h2>
          <div className="balance-amount">{user.credits}</div>
          <p className="balance-description">Credits can be used to request sessions with experts</p>
        </div>
        
        <div className="earn-credits">
          <h2>How to Earn Credits</h2>
          <ul>
            <li>Complete a skill swap: +5 credits</li>
            <li>Receive a 5-star rating: +2 bonus credits</li>
            <li>Refer a new user: +10 credits</li>
            <li>Daily login: +1 credit</li>
          </ul>
        </div>
      </div>
      
      <div className="credits-features">
        <h2>Premium Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Priority Matching</h3>
            <p>Get matched with skill partners faster</p>
            <div className="feature-cost">5 credits</div>
            <button 
              className="btn btn-feature"
              onClick={() => useCredits(5)}
              disabled={user.credits < 5}
            >
              Use Credits
            </button>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>View detailed insights about your skill exchanges</p>
            <div className="feature-cost">10 credits</div>
            <button 
              className="btn btn-feature"
              onClick={() => useCredits(10)}
              disabled={user.credits < 10}
            >
              Use Credits
            </button>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>Verified Badge</h3>
            <p>Get a verified badge on your profile</p>
            <div className="feature-cost">15 credits</div>
            <button 
              className="btn btn-feature"
              onClick={() => useCredits(15)}
              disabled={user.credits < 15}
            >
              Use Credits
            </button>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>Gift Credits</h3>
            <p>Send credits to another user as a gift</p>
            <div className="feature-cost">Variable</div>
            <button 
              className="btn btn-feature"
              onClick={() => useCredits(1)}
              disabled={user.credits < 1}
            >
              Send Gift
            </button>
          </div>
        </div>
      </div>
      
      <div className="transactions-history">
        <h2>Transaction History</h2>
        {transactions.length > 0 ? (
          <div className="transactions-list">
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className={`transaction-icon ${transaction.type}`}>
                  {transaction.type === 'earned' ? '+' : '-'}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">{transaction.description}</div>
                  <div className="transaction-date">{formatDate(transaction.date)}</div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-transactions">
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Credits;