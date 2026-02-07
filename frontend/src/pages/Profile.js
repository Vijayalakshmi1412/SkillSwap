import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    skillsOffered: '',
    skillsWanted: '',
    availability: 'Flexible',
    bio: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        skillsOffered: user.skillsOffered ? user.skillsOffered.join(', ') : '',
        skillsWanted: user.skillsWanted ? user.skillsWanted.join(', ') : '',
        availability: user.availability || 'Flexible',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const { skillsOffered, skillsWanted, availability, bio } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!skillsOffered) newErrors.skillsOffered = 'Skills offered is required';
    if (!skillsWanted) newErrors.skillsWanted = 'Skills wanted is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const skillsOfferedArray = skillsOffered.split(',').map(skill => skill.trim());
      const skillsWantedArray = skillsWanted.split(',').map(skill => skill.trim());
      
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillsOffered: skillsOfferedArray,
          skillsWanted: skillsWantedArray,
          availability,
          bio,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setUser(data);
      } else {
        setErrors({ server: data.message });
      }
    } catch (err) {
      setErrors({ server: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile">
      <h1 className="profile-title">My Profile</h1>
      
      <div className="profile-container">
        <div className="profile-info">
          <h2>Profile Information</h2>
          <div className="info-group">
            <span className="info-label">Username:</span>
            <span className="info-value">{user.username}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Skill Points:</span>
            <span className="info-value">{user.skillPoints}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Credits:</span>
            <span className="info-value">{user.credits}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Completed Swaps:</span>
            <span className="info-value">{user.completedSwaps}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Average Rating:</span>
            <span className="info-value">{user.averageRating.toFixed(1)} / 5</span>
          </div>
          <div className="info-group">
            <span className="info-label">Badges:</span>
            <div className="badges-list">
              {user.badges.length > 0 ? (
                user.badges.map((badge, index) => (
                  <span key={index} className="badge">🏅 {badge}</span>
                ))
              ) : (
                <span className="no-badges">No badges yet</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-edit">
          <h2>Edit Profile</h2>
          
          {errors.server && <div className="error-message">{errors.server}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={onSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="skillsOffered">Skills Offered</label>
              <textarea
                id="skillsOffered"
                name="skillsOffered"
                value={skillsOffered}
                onChange={onChange}
                className="form-control"
                placeholder="e.g., JavaScript, Cooking, Guitar (comma separated)"
                rows="3"
              />
              {errors.skillsOffered && <div className="error">{errors.skillsOffered}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="skillsWanted">Skills Wanted</label>
              <textarea
                id="skillsWanted"
                name="skillsWanted"
                value={skillsWanted}
                onChange={onChange}
                className="form-control"
                placeholder="e.g., Python, Baking, Piano (comma separated)"
                rows="3"
              />
              {errors.skillsWanted && <div className="error">{errors.skillsWanted}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                name="availability"
                value={availability}
                onChange={onChange}
                className="form-control"
              >
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={onChange}
                className="form-control"
                placeholder="Tell others about yourself and your teaching/learning style"
                rows="4"
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-save"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;