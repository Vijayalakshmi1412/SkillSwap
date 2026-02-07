import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
        <p>Exchange skills, grow together</p>
      </div>
    </footer>
  );
};

export default Footer;