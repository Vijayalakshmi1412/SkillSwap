import React, { useState, useEffect } from 'react';
import './Reviews.css';

const Reviews = ({ user }) => {
  const [reviewsReceived, setReviewsReceived] = useState([]);
  const [reviewsGiven, setReviewsGiven] = useState([]);
  const [completedSwaps, setCompletedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch reviews received
        const reviewsRes = await fetch(`/api/reviews/user/${user._id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviewsReceived(reviewsData);
        }
        
        // Fetch reviews given
        const myReviewsRes = await fetch('/api/reviews/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (myReviewsRes.ok) {
          const myReviewsData = await myReviewsRes.json();
          setReviewsGiven(myReviewsData);
        }
        
        // Fetch swap requests to find completed swaps without reviews
        const swapsRes = await fetch('/api/swaps/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (swapsRes.ok) {
          const swapsData = await swapsRes.json();
          const allSwaps = [...(swapsData.incoming || []), ...(swapsData.outgoing || [])];
          const completedSwaps = allSwaps.filter(swap => 
            swap.status === 'completed' && 
            !myReviewsData.some(review => review.swap._id === swap._id)
          );
          setCompletedSwaps(completedSwaps);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id]);

  const openReviewForm = (swap) => {
    setSelectedSwap(swap);
    setReviewForm({
      rating: 5,
      comment: '',
    });
    setFormError('');
    setFormSuccess('');
    setShowReviewForm(true);
  };

  const closeReviewForm = () => {
    setShowReviewForm(false);
    setSelectedSwap(null);
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: value,
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!selectedSwap) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          swapId: selectedSwap._id,
          rating: parseInt(reviewForm.rating),
          comment: reviewForm.comment,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setFormSuccess('Review submitted successfully!');
        setReviewsGiven([...reviewsGiven, data]);
        
        // Remove the swap from completed swaps
        setCompletedSwaps(completedSwaps.filter(swap => swap._id !== selectedSwap._id));
        
        setTimeout(() => {
          closeReviewForm();
        }, 2000);
      } else {
        setFormError(data.message);
      }
    } catch (err) {
      setFormError('Server error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="reviews">
      <h1 className="reviews-title">Reviews & Ratings</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Reviews Received ({reviewsReceived.length})
        </button>
        <button 
          className={`tab ${activeTab === 'given' ? 'active' : ''}`}
          onClick={() => setActiveTab('given')}
        >
          Reviews Given ({reviewsGiven.length})
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Reviews ({completedSwaps.length})
        </button>
      </div>
      
      <div className="reviews-container">
        {activeTab === 'received' && (
          <div className="reviews-list">
            {reviewsReceived.length > 0 ? (
              reviewsReceived.map(review => (
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
                  
                  <div className="review-swap">
                    Swap: {review.swap.requesterSkill} ↔ {review.swap.recipientSkill}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews received yet</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'given' && (
          <div className="reviews-list">
            {reviewsGiven.length > 0 ? (
              reviewsGiven.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <h3>To {review.reviewed.username}</h3>
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
                  
                  <div className="review-swap">
                    Swap: {review.swap.requesterSkill} ↔ {review.swap.recipientSkill}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews given yet</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'pending' && (
          <div className="pending-list">
            {completedSwaps.length > 0 ? (
              completedSwaps.map(swap => {
                const otherUser = swap.requester._id === user._id ? swap.recipient : swap.requester;
                return (
                  <div key={swap._id} className="pending-card">
                    <div className="pending-header">
                      <h3>Swap with {otherUser.username}</h3>
                      <div className="pending-date">Completed on: {formatDate(swap.completedDate)}</div>
                    </div>
                    
                    <div className="pending-details">
                      <div className="skill-exchange">
                        <div className="skill-item">
                          <span className="skill-label">You taught:</span>
                          <span className="skill-value">
                            {swap.requester._id === user._id ? swap.requesterSkill : swap.recipientSkill}
                          </span>
                        </div>
                        <div className="skill-item">
                          <span className="skill-label">You learned:</span>
                          <span className="skill-value">
                            {swap.requester._id === user._id ? swap.recipientSkill : swap.requesterSkill}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pending-actions">
                      <button 
                        className="btn btn-review"
                        onClick={() => openReviewForm(swap)}
                      >
                        Leave a Review
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-reviews">
                <p>No pending reviews</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {showReviewForm && selectedSwap && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Leave a Review</h2>
              <button className="modal-close" onClick={closeReviewForm}>&times;</button>
            </div>
            
            <div className="modal-body">
              <p>Reviewing your swap with {selectedSwap.requester._id === user._id ? selectedSwap.recipient.username : selectedSwap.requester.username}</p>
              
              {formError && <div className="error-message">{formError}</div>}
              {formSuccess && <div className="success-message">{formSuccess}</div>}
              
              <form onSubmit={submitReview}>
                <div className="form-group">
                  <label htmlFor="rating">Rating</label>
                  <select
                    id="rating"
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewChange}
                    className="form-control"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="comment">Comment (Optional)</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewChange}
                    className="form-control"
                    placeholder="Share your experience with this skill swap"
                    rows="4"
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeReviewForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;