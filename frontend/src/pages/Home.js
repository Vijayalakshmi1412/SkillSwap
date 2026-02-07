import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ user }) => {
  return (
    <div className="home">
      <div className="hero">
        <h1 className="hero-title">SkillSwap</h1>
        <p className="hero-subtitle">Exchange skills, grow together</p>
        <p className="hero-description">
          SkillSwap is an innovative platform for direct skill exchanges between individuals 
          without monetary transactions. Learn new skills by teaching what you know!
        </p>
        
        {user ? (
          <Link to="/dashboard" className="btn btn-large">Go to Dashboard</Link>
        ) : (
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-large">Register</Link>
            <Link to="/login" className="btn btn-secondary btn-large">Login</Link>
          </div>
        )}
      </div>
      
      <div className="features">
        <h2 className="section-title">Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Skill Exchange</h3>
            <p>Trade your expertise for new skills without money. Find the perfect match for your learning goals.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Gamification</h3>
            <p>Earn points, badges, and climb the leaderboard as you complete successful skill swaps.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Credits System</h3>
            <p>Accumulate credits from successful exchanges and use them to request sessions with experts.</p>
          </div>
        </div>
      </div>
      
      <div className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Profile</h3>
            <p>Register and list the skills you can teach and what you want to learn.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Find Matches</h3>
            <p>Browse through other users' profiles or use our matching system to find complementary skills.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Exchange Skills</h3>
            <p>Send swap requests, arrange sessions, and start learning from each other.</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Grow Together</h3>
            <p>Complete swaps, earn points and badges, and build your reputation in the community.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;