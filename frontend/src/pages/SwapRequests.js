import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SwapRequests.css';

const SwapRequests = ({ user, refreshUser }) => {
  const [swapRequests, setSwapRequests] = useState({
    incoming: [],
    outgoing: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSwapRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/swaps/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setSwapRequests(data);
        }
      } catch (err) {
        console.error(err);
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
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedSwap = await res.json();

        const updatedIncoming = swapRequests.incoming.map(swap =>
          swap._id === swapId ? updatedSwap : swap
        );

        setSwapRequests({ ...swapRequests, incoming: updatedIncoming });

        navigate(`/schedule-meeting/${swapId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (swapId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/swaps/${swapId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedIncoming = swapRequests.incoming.map(swap =>
        swap._id === swapId ? { ...swap, status: 'rejected' } : swap
      );

      setSwapRequests({ ...swapRequests, incoming: updatedIncoming });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = (swapId) => {
    navigate(`/schedule-meeting/${swapId}`);
  };

  const handleConfirmTime = async (swapId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/swaps/${swapId}/confirm-time`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedSwap = await res.json();

        // Update the appropriate list
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
      }
    } catch (err) {
      console.error(err);
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
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedSwap = await res.json();

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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFriendlyStatus = (swap) => {
    // Use detailedStatus if available, otherwise derive from status and other fields
    if (swap.detailedStatus) {
      switch (swap.detailedStatus) {
        case 'pending':
          return 'Pending';
        case 'accepted-not-scheduled':
          return 'Accepted - not scheduled';
        case 'accepted-scheduled':
          return 'Accepted and scheduled';
        case 'accepted-confirmed':
          return 'Accepted and confirmed';
        case 'rejected':
          return 'Rejected';
        case 'accepted-completed':
          return 'Accepted and completed';
        default:
          return swap.detailedStatus;
      }
    }
    
    // Fallback to original logic if detailedStatus is not available
    if (swap.status === 'pending') return 'Pending';
    if (swap.status === 'accepted' && !swap.proposedTime) return 'Accepted - not scheduled';
    if (swap.status === 'accepted' && swap.proposedTime) return 'Accepted - scheduling pending';
    if (swap.status === 'scheduled' && !swap.confirmedTime) return 'Scheduled - awaiting confirmation';
    if (swap.status === 'scheduled' && swap.confirmedTime) return 'Accepted and scheduled';
    if (swap.status === 'completed') return 'Accepted and completed';
    if (swap.status === 'rejected') return 'Rejected';
    return swap.status;
  };

  const getStatusClass = (status) => {
    return `status-${status.replace(/\s+/g, '-').toLowerCase()}`;
  };

  if (loading) {
    return <div className="loading">Loading swap requests...</div>;
  }

  // Fixed logic here
  const displayedSwaps =
    activeTab === 'incoming'
      ? swapRequests.incoming
      : activeTab === 'outgoing'
      ? swapRequests.outgoing
      : [...swapRequests.incoming, ...swapRequests.outgoing];

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
        <div className="requests-list">

          {displayedSwaps.map(swap => (
            <div key={swap._id} className="request-card">

              <div className="request-header">
                <h3>
                  {swap.requester._id === user._id
                    ? `Request to ${swap.recipient.username}`
                    : `Request from ${swap.requester.username}`}
                </h3>

                <span className={`status ${getStatusClass(getFriendlyStatus(swap))}`}>
                  {getFriendlyStatus(swap)}
                </span>
              </div>

              <div className="request-details">
                <p><strong>You teach:</strong> {swap.requesterSkill}</p>
                <p><strong>You learn:</strong> {swap.recipientSkill}</p>

                {swap.proposedTime && (
                  <p>
                    <strong>Proposed Time:</strong> {formatDate(swap.proposedTime)}
                  </p>
                )}

                {swap.confirmedTime && (
                  <p>
                    <strong>Confirmed Time:</strong> {formatDate(swap.confirmedTime)}
                  </p>
                )}
              </div>

              <div className="request-actions">

                {swap.status === 'pending' && swap.recipient._id === user._id && (
                  <>
                    <button
                      className="btn btn-accept"
                      onClick={() => handleAcceptRequest(swap._id)}
                    >
                      Accept
                    </button>

                    <button
                      className="btn btn-reject"
                      onClick={() => handleRejectRequest(swap._id)}
                    >
                      Reject
                    </button>
                  </>
                )}

                {swap.status === 'accepted' && !swap.proposedTime && swap.recipient._id === user._id && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/schedule-meeting/${swap._id}`)}
                  >
                    Schedule Meeting
                  </button>
                )}

                {swap.status === 'scheduled' && (
                  <>
                    {swap.proposedTime && !(swap.requesterConfirmed && swap.recipientConfirmed) && (
                      <div className="confirmation-status">
                        <p>Waiting for confirmation:</p>
                        <div className="confirmation-flags">
                          <span className={swap.requesterConfirmed ? 'confirmed' : 'pending'}>
                            {swap.requester.username}: {swap.requesterConfirmed ? 'Confirmed' : 'Pending'}
                          </span>
                          <span className={swap.recipientConfirmed ? 'confirmed' : 'pending'}>
                            {swap.recipient.username}: {swap.recipientConfirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {!swap.requesterConfirmed && swap.requester._id === user._id && (
                      <button
                        className="btn btn-confirm"
                        onClick={() => handleConfirmTime(swap._id)}
                        disabled={actionLoading}
                      >
                        Confirm Time
                      </button>
                    )}
                    
                    {!swap.recipientConfirmed && swap.recipient._id === user._id && (
                      <button
                        className="btn btn-confirm"
                        onClick={() => handleConfirmTime(swap._id)}
                        disabled={actionLoading}
                      >
                        Confirm Time
                      </button>
                    )}
                    
                    {swap.requesterConfirmed && swap.recipientConfirmed && (
                      <button
                        className="btn btn-room"
                        onClick={() => navigate(`/swap-room/${swap._id}`)}
                      >
                        Enter Swap Room
                      </button>
                    )}

                    <button
                      className="btn btn-reschedule"
                      onClick={() => handleReschedule(swap._id)}
                    >
                      Reschedule
                    </button>

                    {((swap.requester._id === user._id && !swap.requesterCompleted) ||
                      (swap.recipient._id === user._id && !swap.recipientCompleted)) && (
                      <button
                        className="btn btn-complete"
                        onClick={() => handleCompleteSwap(swap._id)}
                        disabled={actionLoading}
                      >
                        Mark as Completed
                      </button>
                    )}

                    {(swap.requesterCompleted || swap.recipientCompleted) && (
                      <p className="mini-status">
                        {swap.requesterCompleted ? 'Requester marked complete' : ''}
                        {swap.recipientCompleted ? 'Recipient marked complete' : ''}
                      </p>
                    )}
                  </>
                )}

                {swap.status === 'completed' && (
                  <span className="completed-text">Completed</span>
                )}

              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default SwapRequests;