import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          SkillSwap
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          
          {user ? (
            <>
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              </li>
              <li className="navbar-item">
                <Link to="/skills" className="navbar-link">Skills</Link>
              </li>
              <li className="navbar-item">
                <Link to="/swap-requests" className="navbar-link">Requests</Link>
              </li>
              <li className="navbar-item">
                <Link to="/leaderboard" className="navbar-link">Leaderboard</Link>
              </li>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link">Profile</Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-btn">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-btn">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;