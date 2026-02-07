import React, { useState, useEffect } from 'react';
import './SwapRequests.css';

const SwapRequests = ({ user }) => {
  const [swapRequests, setSwapRequests] = useState({
    incoming: [],
    outgoing: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => {
    const fetchSwapRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/swaps/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSwapRequests(data);
        }
      } catch (err) {
        console.error('Error fetching swap requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSwapRequests();
  }, []);

  const handleAcceptRequest = async (swapId) => {
    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/swaps/${swapId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        // Update the local state
        const updatedIncoming = swapRequests.incoming.map(swap => 
          swap._id === swapId ? { ...swap, status: 'accepted' } : swap
        );
        setSwapRequests({ ...swapRequests, incoming: updatedIncoming });
      } else {
        console.error('Failed to accept swap request');
      }
    } catch (err) {
      console.error('Error accepting swap request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (swapId) => {
    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/swaps/${swapId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        // Update the local state
        const updatedIncoming = swapRequests.incoming.map(swap => 
          swap._id === swapId ? { ...swap, status: 'rejected' } : swap
        );
        setSwapRequests({ ...swapRequests, incoming: updatedIncoming });
      } else {
        console.error('Failed to reject swap request');
      }
    } catch (err) {
      console.error('Error rejecting swap request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSwap = async (swapId) => {
    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/swaps/${swapId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        // Update the local state
        const updatedIncoming = swapRequests.incoming.map(swap => 
          swap._id === swapId ? { ...swap, status: 'completed' } : swap
        );
        const updatedOutgoing = swapRequests.outgoing.map(swap => 
          swap._id === swapId ? { ...swap, status: 'completed' } : swap
        );
        setSwapRequests({ 
          incoming: updatedIncoming, 
          outgoing: updatedOutgoing 
        });
      } else {
        console.error('Failed to complete swap');
      }
    } catch (err) {
      console.error('Error completing swap:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading swap requests...</div>;
  }

  return (
    <div className="swap-requests">
      <h1 className="requests-title">Swap Requests</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming ({swapRequests.incoming.length})
        </button>
        <button 
          className={`tab ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Outgoing ({swapRequests.outgoing.length})
        </button>
      </div>
      
      <div className="requests-container">
        {activeTab === 'incoming' && (
          <div className="requests-list">
            {swapRequests.incoming.length > 0 ? (
              swapRequests.incoming.map(swap => (
                <div key={swap._id} className="request-card">
                  <div className="request-header">
                    <h3>Request from {swap.requester.username}</h3>
                    <span className={`status ${getStatusClass(swap.status)}`}>
                      {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="request-details">
                    <div className="skill-exchange">
                      <div className="skill-item">
                        <span className="skill-label">You'll teach:</span>
                        <span className="skill-value">{swap.recipientSkill}</span>
                      </div>
                      <div className="skill-item">
                        <span className="skill-label">You'll learn:</span>
                        <span className="skill-value">{swap.requesterSkill}</span>
                      </div>
                    </div>
                    
                    {swap.message && (
                      <div className="request-message">
                        <span className="message-label">Message:</span>
                        <p>{swap.message}</p>
                      </div>
                    )}
                    
                    <div className="request-date">
                      Requested on: {formatDate(swap.createdAt)}
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    {swap.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-accept"
                          onClick={() => handleAcceptRequest(swap._id)}
                          disabled={actionLoading}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-reject"
                          onClick={() => handleRejectRequest(swap._id)}
                          disabled={actionLoading}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {swap.status === 'accepted' && (
                      <button 
                        className="btn btn-complete"
                        onClick={() => handleCompleteSwap(swap._id)}
                        disabled={actionLoading}
                      >
                        Mark as Completed
                      </button>
                    )}
                    
                    {swap.status === 'completed' && (
                      <span className="completed-text">Swap completed</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-requests">
                <p>No incoming requests</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'outgoing' && (
          <div className="requests-list">
            {swapRequests.outgoing.length > 0 ? (
              swapRequests.outgoing.map(swap => (
                <div key={swap._id} className="request-card">
                  <div className="request-header">
                    <h3>Request to {swap.recipient.username}</h3>
                    <span className={`status ${getStatusClass(swap.status)}`}>
                      {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="request-details">
                    <div className="skill-exchange">
                      <div className="skill-item">
                        <span className="skill-label">You'll teach:</span>
                        <span className="skill-value">{swap.requesterSkill}</span>
                      </div>
                      <div className="skill-item">
                        <span className="skill-label">You'll learn:</span>
                        <span className="skill-value">{swap.recipientSkill}</span>
                      </div>
                    </div>
                    
                    {swap.message && (
                      <div className="request-message">
                        <span className="message-label">Message:</span>
                        <p>{swap.message}</p>
                      </div>
                    )}
                    
                    <div className="request-date">
                      Requested on: {formatDate(swap.createdAt)}
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    {swap.status === 'accepted' && (
                      <button 
                        className="btn btn-complete"
                        onClick={() => handleCompleteSwap(swap._id)}
                        disabled={actionLoading}
                      >
                        Mark as Completed
                      </button>
                    )}
                    
                    {swap.status === 'completed' && (
                      <span className="completed-text">Swap completed</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-requests">
                <p>No outgoing requests</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapRequests;