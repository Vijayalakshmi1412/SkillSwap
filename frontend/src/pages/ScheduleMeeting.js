import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ScheduleMeeting.css';

const ScheduleMeeting = ({ user }) => {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    proposedTime: '',
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    const fetchSwap = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/swaps/${swapId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSwap(data);
          
          // Check if this is a reschedule (swap has proposedTime)
          if (data.proposedTime) {
            setIsRescheduling(true);
            // Pre-fill the form with existing time
            const date = new Date(data.proposedTime);
            const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
              .toISOString().slice(0, 16);
            setForm({
              proposedTime: localDateTime,
            });
          }
        } else {
          const data = await res.json();
          setError(data.message || 'Failed to fetch swap details');
        }
      } catch (err) {
        console.error('Error fetching swap details:', err);
        setError('Server error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSwap();
  }, [swapId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.proposedTime) {
      setFormError('Please select a date and time');
      return;
    }
    
    setFormError('');
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Log the exact data being sent
      const requestData = {
        proposedTime: form.proposedTime,
      };
      console.log('Sending request data:', requestData);
      
      // Use relative URL (will work with proxy in development)
      const endpoint = isRescheduling ? `/api/swaps/${swapId}/reschedule` : `/api/swaps/${swapId}/schedule`;
      
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
      
      // Log the response status and body text
      console.log('Response status:', res.status);
      const responseText = await res.text();
      console.log('Response text:', responseText);

      let responseData = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        responseData = null;
      }

      if (res.ok) {
        console.log('Response data:', responseData);
        setSuccess(isRescheduling ? 'Meeting rescheduled successfully!' : 'Meeting time scheduled successfully!');
        setTimeout(() => {
          navigate('/swap-requests');
        }, 2000);
      } else {
        const errorMessage = responseData?.message || responseText || 'Failed to schedule meeting';
        setFormError(errorMessage);
      }
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      setFormError('Server error. Please try again. ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSwap = async () => {
    if (!swap) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/swaps/${swapId}/complete`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await res.text();
      let responseData = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        responseData = null;
      }

      if (res.ok) {
        setSuccess('Meeting marked as completed. Thank you!');
        const updatedSwap = responseData || null;
        if (updatedSwap) setSwap(updatedSwap);
      } else {
        const errorMessage = responseData?.message || responseText || 'Failed to mark as complete';
        setFormError(errorMessage);
      }
    } catch (err) {
      console.error('Error completing meeting:', err);
      setFormError('Server error. Please try again. ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading swap details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button className="btn" onClick={() => navigate('/swap-requests')}>
          Back to Swap Requests
        </button>
      </div>
    );
  }

  if (!swap) {
    return (
      <div className="error-container">
        <p>Swap not found</p>
        <button className="btn" onClick={() => navigate('/swap-requests')}>
          Back to Swap Requests
        </button>
      </div>
    );
  }

  // Check if the current user is the recipient (who should schedule the meeting)
  // For rescheduling, both users can reschedule if the meeting hasn't been completed
  const canSchedule = swap.recipient._id === user._id || 
    (swap.requester._id === user._id && swap.status === 'scheduled' && !swap.requesterCompleted && !swap.recipientCompleted);
  
  if (!canSchedule) {
    return (
      <div className="error-container">
        <p>{swap.recipient._id === user._id ? 'Only the recipient can schedule the meeting' : 'You cannot schedule this meeting'}</p>
        <button className="btn" onClick={() => navigate('/swap-requests')}>
          Back to Swap Requests
        </button>
      </div>
    );
  }

  // Check if swap is in accepted status (for initial scheduling)
  // or scheduled status (for rescheduling)
  if (swap.status !== 'accepted' && swap.status !== 'scheduled') {
    return (
      <div className="error-container">
        <p>This swap cannot be scheduled. Current status: {swap.status}</p>
        <button className="btn" onClick={() => navigate('/swap-requests')}>
          Back to Swap Requests
        </button>
      </div>
    );
  }

  // Check if swap is already completed
  if (swap.status === 'completed') {
    return (
      <div className="error-container">
        <p>This swap has already been completed and cannot be rescheduled.</p>
        <button className="btn" onClick={() => navigate('/swap-requests')}>
          Back to Swap Requests
        </button>
      </div>
    );
  }

  return (
    <div className="schedule-meeting">
      <h1 className="page-title">
        {isRescheduling ? 'Reschedule Meeting' : 'Schedule Meeting'}
      </h1>
      
      <div className="swap-details">
        <h2>Swap Details</h2>
        <div className="detail-row">
          <span className="label">With:</span>
          <span className="value">{swap.requester.username}</span>
        </div>
        <div className="detail-row">
          <span className="label">You'll teach:</span>
          <span className="value">{swap.recipientSkill}</span>
        </div>
        <div className="detail-row">
          <span className="label">You'll learn:</span>
          <span className="value">{swap.requesterSkill}</span>
        </div>
        {swap.message && (
          <div className="detail-row">
            <span className="label">Message:</span>
            <span className="value">{swap.message}</span>
          </div>
        )}
        {swap.proposedTime && (
          <div className="detail-row">
            <span className="label">Current meeting time:</span>
            <span className="value">
              {new Date(swap.proposedTime).toLocaleString()}
            </span>
          </div>
        )}
        {swap.confirmedTime && (
          <div className="detail-row">
            <span className="label">Confirmed meeting time:</span>
            <span className="value">
              {new Date(swap.confirmedTime).toLocaleString()}
            </span>
          </div>
        )}
      </div>
      
      <div className="schedule-form-container">
        <h2>
          {isRescheduling ? 'Propose a New Meeting Time' : 'Propose a Meeting Time'}
        </h2>
        
        {formError && <div className="error-message">{formError}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label htmlFor="proposedTime">Date and Time</label>
            <input
              type="datetime-local"
              id="proposedTime"
              name="proposedTime"
              value={form.proposedTime}
              onChange={handleChange}
              className="form-control"
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/swap-requests')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Scheduling...' : (isRescheduling ? 'Reschedule Meeting' : 'Schedule Meeting')}
            </button>
          </div>
        </form>

        {swap.status === 'scheduled' && (!swap.requesterCompleted || !swap.recipientCompleted) && (
          <div className="complete-section">
            <button
              type="button"
              className="btn btn-complete"
              onClick={handleCompleteSwap}
              disabled={submitting}
            >
              {submitting ? 'Marking...' : 'Mark as Completed'}
            </button>
            <p className="info-text">You can mark the meeting completed when the session is done.</p>
          </div>
        )}

        {swap.status === 'completed' && (
          <div className="complete-section">
            <span className="success-message">This swap is completed.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleMeeting;