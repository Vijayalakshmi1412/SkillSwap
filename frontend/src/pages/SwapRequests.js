import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SwapRequests.css';

const SwapRequests = ({ user, refreshUser }) => {
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
        const updatedSwap = await res.json();
        // Update the local state with meeting link and accepted status
        const meetingLink = updatedSwap.meetingLink || getMeetingLink(updatedSwap);
        const updatedIncoming = swapRequests.incoming.map(swap => 
          swap._id === swapId ? { ...swap, status: 'accepted', meetingLink } : swap
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
        const updatedSwap = await res.json();

        // Update the local state based on updated swap data
        const updatedIncoming = swapRequests.incoming.map(swap => 
          swap._id === swapId ? updatedSwap : swap
        );
        const updatedOutgoing = swapRequests.outgoing.map(swap => 
          swap._id === swapId ? updatedSwap : swap
        );
        setSwapRequests({ 
          incoming: updatedIncoming, 
          outgoing: updatedOutgoing 
        });

        if (refreshUser) await refreshUser();
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

  const getMeetingLink = (swap) => {
    if (swap.meetingLink) return swap.meetingLink;
    if (swap._id) return `https://meet.jit.si/skillswap-${swap._id}`;
    return 'https://meet.jit.si/skillswap-fallback';
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
                      <>
                        <Link
                          to={`/swap-room/${swap._id}`}
                          className="btn btn-join"
                        >
                          Enter Room
                        </Link>
                        <a
                          href={swap.meetingLink || `https://meet.jit.si/skillswap-${swap._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-join"
                        >
                          Join Meeting
                        </a>
                        <button 
                          className="btn btn-complete"
                          onClick={() => handleCompleteSwap(swap._id)}
                          disabled={
                            actionLoading ||
                            (user._id === swap.requester._id && swap.requesterCompleted) ||
                            (user._id === swap.recipient._id && swap.recipientCompleted)
                          }
                        >
                          {user._id === swap.requester._id
                            ? (swap.requesterCompleted ? 'You marked completed' : 'Mark Skill Taught')
                            : (swap.recipientCompleted ? 'You marked completed' : 'Mark Skill Learned')
                          }
                        </button>
                      </>
                    )}
                    
                    {swap.status === 'completed' && (
                      <>
                        <span className="completed-text">Swap completed</span>
                        <a href="/reviews" className="btn btn-review-link">Leave Review</a>
                      </>
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
                      <>
                        <Link
                          to={`/swap-room/${swap._id}`}
                          className="btn btn-join"
                        >
                          Enter Room
                        </Link>
                        <a
                          href={swap.meetingLink || `https://meet.jit.si/skillswap-${swap._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-join"
                        >
                          Join Meeting
                        </a>
                        <button 
                          className="btn btn-complete"
                          onClick={() => handleCompleteSwap(swap._id)}
                          disabled={
                            actionLoading ||
                            (user._id === swap.requester._id && swap.requesterCompleted) ||
                            (user._id === swap.recipient._id && swap.recipientCompleted)
                          }
                        >
                          {user._id === swap.requester._id
                            ? (swap.requesterCompleted ? 'You marked completed' : 'Mark Skill Taught')
                            : (swap.recipientCompleted ? 'You marked completed' : 'Mark Skill Learned')
                          }
                        </button>
                      </>
                    )}
                    
                    {swap.status === 'completed' && (
                      <>
                        <span className="completed-text">Swap completed</span>
                        <a href="/reviews" className="btn btn-review-link">Leave Review</a>
                      </>
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