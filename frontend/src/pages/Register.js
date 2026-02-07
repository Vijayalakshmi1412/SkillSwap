import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    skillsOffered: '',
    skillsWanted: '',
    availability: 'Flexible',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, password, confirmPassword, skillsOffered, skillsWanted, availability } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!skillsOffered) newErrors.skillsOffered = 'Skills offered is required';
    if (!skillsWanted) newErrors.skillsWanted = 'Skills wanted is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const skillsOfferedArray = skillsOffered.split(',').map(skill => skill.trim());
      const skillsWantedArray = skillsWanted.split(',').map(skill => skill.trim());
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          skillsOffered: skillsOfferedArray,
          skillsWanted: skillsWantedArray,
          availability,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data);
        navigate('/dashboard');
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
    <div className="register">
      <div className="register-container">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Join the SkillSwap community today</p>
        
        {errors.server && <div className="error-message">{errors.server}</div>}
        
        <form onSubmit={onSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              className="form-control"
              placeholder="Choose a username"
            />
            {errors.username && <div className="error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="form-control"
              placeholder="Create a password"
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className="form-control"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="skillsOffered">Skills Offered</label>
            <input
              type="text"
              id="skillsOffered"
              name="skillsOffered"
              value={skillsOffered}
              onChange={onChange}
              className="form-control"
              placeholder="e.g., JavaScript, Cooking, Guitar (comma separated)"
            />
            {errors.skillsOffered && <div className="error">{errors.skillsOffered}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="skillsWanted">Skills Wanted</label>
            <input
              type="text"
              id="skillsWanted"
              name="skillsWanted"
              value={skillsWanted}
              onChange={onChange}
              className="form-control"
              placeholder="e.g., Python, Baking, Piano (comma separated)"
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
          
          <button
            type="submit"
            className="btn btn-register"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;