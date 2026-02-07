import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Skills.css';

const Skills = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestForm, setRequestForm] = useState({
    recipientId: '',
    requesterSkill: '',
    recipientSkill: '',
    message: '',
  });
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/skills/users');
        if (res.ok) {
          const data = await res.json();
          // Filter out the current user
          const filteredData = data.filter(u => u._id !== user._id);
          setUsers(filteredData);
          setFilteredUsers(filteredData);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/skills/all');
        if (res.ok) {
          const data = await res.json();
          setSkills(data);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
      }
    };

    fetchUsers();
    fetchSkills();
  }, [user._id]);

  const handleSkillFilter = (skill) => {
    setSelectedSkill(skill);
    if (skill === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        u.skillsOffered.includes(skill) || u.skillsWanted.includes(skill)
      );
      setFilteredUsers(filtered);
    }
  };

  const openRequestModal = (recipient) => {
    setSelectedUser(recipient);
    setRequestForm({
      recipientId: recipient._id,
      requesterSkill: '',
      recipientSkill: '',
      message: '',
    });
    setRequestError('');
    setRequestSuccess('');
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedUser(null);
    setRequestForm({
      recipientId: '',
      requesterSkill: '',
      recipientSkill: '',
      message: '',
    });
    setRequestError('');
    setRequestSuccess('');
  };

  const handleRequestChange = (e) => {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value,
    });
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    
    if (!requestForm.requesterSkill || !requestForm.recipientSkill) {
      setRequestError('Please select skills for both you and the recipient');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/swaps/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestForm),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setRequestSuccess('Swap request sent successfully!');
        setTimeout(() => {
          closeRequestModal();
        }, 2000);
      } else {
        setRequestError(data.message);
      }
    } catch (err) {
      setRequestError('Server error. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="skills">
      <h1 className="skills-title">Find Skills</h1>
      <p className="skills-subtitle">Discover people to exchange skills with</p>
      
      <div className="filter-section">
        <h2>Filter by Skill</h2>
        <div className="skill-filter">
          <button 
            className={`skill-filter-btn ${selectedSkill === '' ? 'active' : ''}`}
            onClick={() => handleSkillFilter('')}
          >
            All Skills
          </button>
          {skills.map((skill, index) => (
            <button 
              key={index}
              className={`skill-filter-btn ${selectedSkill === skill ? 'active' : ''}`}
              onClick={() => handleSkillFilter(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
      
      <div className="users-grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(u => (
            <div key={u._id} className="user-card">
              <div className="user-header">
                <h3>{u.username}</h3>
                <div className="user-rating">
                  ⭐ {u.averageRating.toFixed(1)} ({u.totalRatings})
                </div>
              </div>
              
              <div className="user-bio">
                {u.bio ? u.bio : 'No bio provided'}
              </div>
              
              <div className="user-skills">
                <div className="skill-group">
                  <h4>Offers</h4>
                  <div className="skill-list">
                    {u.skillsOffered.length > 0 ? (
                      u.skillsOffered.map((skill, index) => (
                        <span key={index} className="skill-tag offered">{skill}</span>
                      ))
                    ) : (
                      <span className="no-skills">None listed</span>
                    )}
                  </div>
                </div>
                
                <div className="skill-group">
                  <h4>Wants</h4>
                  <div className="skill-list">
                    {u.skillsWanted.length > 0 ? (
                      u.skillsWanted.map((skill, index) => (
                        <span key={index} className="skill-tag wanted">{skill}</span>
                      ))
                    ) : (
                      <span className="no-skills">None listed</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="user-footer">
                <div className="user-availability">
                  Availability: <span>{u.availability}</span>
                </div>
                <button 
                  className="btn btn-request"
                  onClick={() => openRequestModal(u)}
                >
                  Request Swap
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users">
            <p>No users found with the selected skill.</p>
          </div>
        )}
      </div>
      
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Request Skill Swap</h2>
              <button className="modal-close" onClick={closeRequestModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <p>Requesting a swap with <strong>{selectedUser.username}</strong></p>
              
              {requestError && <div className="error-message">{requestError}</div>}
              {requestSuccess && <div className="success-message">{requestSuccess}</div>}
              
              <form onSubmit={submitRequest}>
                <div className="form-group">
                  <label htmlFor="requesterSkill">Skill You'll Teach</label>
                  <select
                    id="requesterSkill"
                    name="requesterSkill"
                    value={requestForm.requesterSkill}
                    onChange={handleRequestChange}
                    className="form-control"
                  >
                    <option value="">Select a skill</option>
                    {user.skillsOffered.map((skill, index) => (
                      <option key={index} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="recipientSkill">Skill You Want to Learn</label>
                  <select
                    id="recipientSkill"
                    name="recipientSkill"
                    value={requestForm.recipientSkill}
                    onChange={handleRequestChange}
                    className="form-control"
                  >
                    <option value="">Select a skill</option>
                    {selectedUser.skillsOffered.map((skill, index) => (
                      <option key={index} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={requestForm.message}
                    onChange={handleRequestChange}
                    className="form-control"
                    placeholder="Introduce yourself and suggest a time for the exchange"
                    rows="4"
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeRequestModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send Request
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

export default Skills;