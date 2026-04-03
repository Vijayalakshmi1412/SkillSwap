import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo2.png';

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="TeachEach logo" className="navbar-logo-img" />
            <div className="navbar-text">
              <span className="navbar-logo">TeachEach</span>
              <span className="navbar-tagline">From One Mind to Another</span>
            </div>
          </Link>
        </div>

        <div className="navbar-right">
          <ul className="navbar-menu">
            <li className="navbar-item">
              <NavLink to="/" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>Home</NavLink>
            </li>

            {user ? (
              <>
                <li className="navbar-item">
                  <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>Dashboard</NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/skills" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>Skills</NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/swap-requests" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>Requests</NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/reviews" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>Reviews</NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>Leaderboard</NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/profile" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>Profile</NavLink>
                </li>
                <li className="navbar-item">
                  <button onClick={handleLogout} className="navbar-btn">Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="navbar-item">
                  <NavLink to="/login" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>Login</NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/register" className={({ isActive }) => isActive ? 'navbar-btn active-btn' : 'navbar-btn'}>Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;