import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './SwapRoom.css';

const SwapRoom = ({ user }) => {
  const params = useParams();
  const swapId = params.id || params.swapId;
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [meetingJoined, setMeetingJoined] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchSwapRoom = async () => {
      if (!swapId) {
        setError('Missing swap ID in URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/swaps/${swapId}/room`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contentType = res.headers.get('content-type');

        if (!res.ok) {
          const errorText = contentType && contentType.includes('application/json')
            ? await res.json().then(obj => obj.message || JSON.stringify(obj))
            : await res.text();

          if (res.status === 401) {
            setError('Not authorized for this swap room. Please return to Swap Requests.');
          } else if (res.status === 404) {
            setError('Swap not found. It may have been deleted or canceled.');
          } else {
            setError(errorText || 'Unable to load swap room. Please try again.');
          }
          setSwap(null);
          return;
        }

        if (!contentType || !contentType.includes('application/json')) {
          const invalidText = await res.text();
          setError(`Invalid API response, expected JSON. Received: ${invalidText.slice(0, 200)}`);
          setSwap(null);
          return;
        }

        const data = await res.json();
        setSwap(data);
        
        // Set up countdown if time is confirmed
        if (data.status === 'scheduled' && data.confirmedTime) {
          const confirmedTime = new Date(data.confirmedTime);
          const now = new Date();
          
          if (confirmedTime > now) {
            // Set up countdown
            setCountdown(confirmedTime);
            setTimeLeft(Math.floor((confirmedTime - now) / 1000));
          } else {
            // Time has passed, session can start
            setSessionStarted(true);
          }
        } else if (data.status === 'accepted') {
          // For accepted swaps, we need to wait for scheduling
          setSessionStarted(false);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unable to load swap room');
      } finally {
        setLoading(false);
      }
    };

    fetchSwapRoom();
  }, [swapId]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [swap?.chat]);

  useEffect(() => {
    // Countdown timer
    if (countdown && timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && countdown) {
      // Countdown finished, session can start
      setSessionStarted(true);
      setCountdown(null);
    }
  }, [countdown, timeLeft]);

  const formatTimeLeft = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleJoinMeeting = () => {
    setMeetingJoined(true);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    
    if (!noteInput.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/swaps/${swapId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: noteInput })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSwap(prev => ({
          ...prev,
          notes: data
        }));
        setNoteInput('');
      } else {
        setError('Failed to add note');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Server error. Please try again.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!chatInput.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/swaps/${swapId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: chatInput })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSwap(prev => ({
          ...prev,
          chat: data
        }));
        setChatInput('');
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Server error. Please try again.');
    }
  };

  const handleMarkCompleted = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/swaps/${swapId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSwap(data);
        
        // If both users have marked as completed, redirect to reviews
        if (data.status === 'completed') {
          setTimeout(() => {
            window.location.href = '/reviews';
          }, 2000);
        }
      } else {
        setError('Failed to mark as completed');
      }
    } catch (err) {
      console.error('Error marking as completed:', err);
      setError('Server error. Please try again.');
    }
  };

  const getOtherUser = () => {
    if (!swap) return null;
    return swap.requester._id === user._id ? swap.recipient : swap.requester;
  };

  const getStatusMessage = () => {
    if (!swap) return '';
    
    switch (swap.status) {
      case 'pending':
        return 'Waiting for the other user to accept your swap request';
      case 'accepted':
        return 'Swap request accepted! Waiting for meeting to be scheduled.';
      case 'scheduled':
        if (countdown && timeLeft > 0) {
          return `Meeting starts in ${formatTimeLeft(timeLeft)}`;
        } else if (!sessionStarted) {
          return 'Meeting time has arrived! You can now join the meeting.';
        } else {
          return 'Meeting in progress';
        }
      case 'completed':
        return 'Swap completed';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="swap-room-loading">Loading swap room...</div>;
  }

  if (error) {
    return (
      <div className="swap-room-error">
        <p>{error}</p>
        <Link to="/swap-requests" className="btn">Back to Swap Requests</Link>
      </div>
    );
  }

  if (!swap) {
    return (
      <div className="swap-room-empty">
        <p>Swap not found.</p>
        <Link to="/swap-requests" className="btn">Back to Swap Requests</Link>
      </div>
    );
  }

  const otherUser = getOtherUser();
  const meetingLink = swap.meetingLink || `https://meet.jit.si/teacheach-${swap._id}`;

  return (
    <div className="swap-room">
      <div className="swap-room-header">
        <h1>Swap Room</h1>
        <div className="swap-info">
          <h2>Swap with {otherUser.username}</h2>
          <div className="swap-details">
            <div className="skill-exchange">
              <span className="skill-item">
                <strong>You teach:</strong> {swap.requester._id === user._id ? swap.requesterSkill : swap.recipientSkill}
              </span>
              <span className="skill-item">
                <strong>You learn:</strong> {swap.requester._id === user._id ? swap.recipientSkill : swap.requesterSkill}
              </span>
            </div>
            <div className="swap-status">
              <strong>Status:</strong> {getStatusMessage()}
            </div>
          </div>
        </div>
      </div>

      <div className="swap-room-content">
        {swap.status === 'accepted' && (
          <div className="status-message">
            <p>This swap has been accepted! Waiting for the meeting to be scheduled.</p>
            <p>The recipient will schedule a meeting time and you'll be notified.</p>
            <Link to="/swap-requests" className="btn btn-back">Back to Requests</Link>
          </div>
        )}

        {countdown && timeLeft > 0 && (
          <div className="countdown-container">
            <div className="countdown-timer">
              <div className="countdown-label">Meeting starts in:</div>
              <div className="countdown-time">{formatTimeLeft(timeLeft)}</div>
            </div>
          </div>
        )}

        {sessionStarted && !meetingJoined && (
          <div className="join-meeting-container">
            <h3>Meeting is ready to start!</h3>
            <p>Click the button below to join the video meeting.</p>
            <a 
              href={meetingLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-join-meeting"
              onClick={handleJoinMeeting}
            >
              Join Meeting
            </a>
          </div>
        )}

        {meetingJoined && (
          <div className="session-container">
            <div className="meeting-container">
              <div className="meeting-header">
                <h3>Video Meeting</h3>
                <a 
                  href={meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-open-meeting"
                >
                  Open in New Tab
                </a>
              </div>
              <div className="meeting-iframe">
                <iframe
                  src={meetingLink}
                  title="Swap Meeting"
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  style={{ width: '100%', height: '400px', border: '0' }}
                />
              </div>
            </div>

            <div className="session-panel">
              <div className="notes-section">
                <h3>Shared Notes</h3>
                <div className="notes-list">
                  {swap.notes.length > 0 ? (
                    swap.notes.map((note, index) => (
                      <div key={index} className="note-item">
                        <div className="note-header">
                          <span className="note-author">{note.user.username}</span>
                          <span className="note-time">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="note-content">{note.content}</div>
                      </div>
                    ))
                  ) : (
                    <p className="no-notes">No notes yet. Add your first note!</p>
                  )}
                </div>
                <form onSubmit={handleAddNote} className="note-form">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a note..."
                    className="note-input"
                    rows="3"
                  />
                  <button type="submit" className="btn btn-add-note">Add Note</button>
                </form>
              </div>

              <div className="chat-section">
                <h3>Chat</h3>
                <div className="chat-messages">
                  {swap.chat.length > 0 ? (
                    swap.chat.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`chat-message ${msg.user._id === user._id ? 'own-message' : 'other-message'}`}
                      >
                        <div className="message-header">
                          <span className="message-author">{msg.user.username}</span>
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="message-content">{msg.message}</div>
                      </div>
                    ))
                  ) : (
                    <p className="no-messages">No messages yet. Start the conversation!</p>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="chat-form">
                  <div className="chat-input-container">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="chat-input"
                    />
                    <button type="submit" className="btn btn-send">Send</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="session-actions">
              {swap.status === 'scheduled' && !swap.requesterCompleted && swap.requester._id === user._id && (
                <button className="btn btn-complete" onClick={handleMarkCompleted}>
                  Mark Skill Learned
                </button>
              )}
              
              {swap.status === 'scheduled' && !swap.recipientCompleted && swap.recipient._id === user._id && (
                <button className="btn btn-complete" onClick={handleMarkCompleted}>
                  Mark Skill Learned
                </button>
              )}
              
              {swap.status === 'completed' && (
                <div className="completion-message">
                  <p>Swap completed! Both users have marked this session as complete.</p>
                  <Link to="/reviews" className="btn btn-review">Leave a Review</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {swap.status === 'pending' && (
          <div className="status-message">
            <p>Waiting for the other user to accept your swap request.</p>
            <Link to="/swap-requests" className="btn btn-back">Back to Requests</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapRoom;