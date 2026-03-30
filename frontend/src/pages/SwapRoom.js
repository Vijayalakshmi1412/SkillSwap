import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './SwapRoom.css';

const SwapRoom = ({ user }) => {
  const { id: swapId } = useParams();
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSwap = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/swaps/${swapId}`, {
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
      } catch (err) {
        console.error(err);
        setError(err.message || 'Unable to load swap room');
      } finally {
        setLoading(false);
      }
    };

    fetchSwap();
  }, [swapId]);

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

  const otherUser = swap.requester.username === user?.username ? swap.recipient.username : swap.requester.username;
  const yourTeachingSkill = swap.requester.username === user?.username ? swap.recipientSkill : swap.requesterSkill;
  const yourLearningSkill = swap.requester.username === user?.username ? swap.requesterSkill : swap.recipientSkill;

  return (
    <div className="swap-room">
      <h1>Swap Room</h1>
      <p>Status: <strong>{swap.status}</strong></p>
      <p>
        You are in a session with <strong>{swap.requester.username === user?.username ? swap.recipient.username : swap.requester.username}</strong>
      </p>
      <p>
        Skill to teach: <strong>{swap.requester.username === user?.username ? swap.requesterSkill : swap.recipientSkill}</strong>
      </p>
      <p>
        Skill to learn: <strong>{swap.requester.username === user?.username ? swap.recipientSkill : swap.requesterSkill}</strong>
      </p>
      {swap.meetingLink && (
        <div className="meeting-actions">
          <a href={swap.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-join">
            Open Meeting in New Tab
          </a>
        </div>
      )}

      <div className="meeting-iframe"> 
        {swap.meetingLink ? (
          <iframe
            src={swap.meetingLink}
            title="Swap Meeting"
            allow="camera; microphone; fullscreen; speaker; display-capture"
            style={{ width: '100%', height: '80vh', border: '0' }}
          />
        ) : (
          <p>No meeting link available yet. Please wait for the recipient to accept the swap.</p>
        )}
      </div>

      <Link to="/swap-requests" className="btn btn-back">
        Back to Swap Requests
      </Link>
    </div>
  );
};

export default SwapRoom;
