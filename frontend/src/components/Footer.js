import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} TeachEach. All rights reserved.</p>
        <p>From One Mind to Another</p>
      </div>
    </footer>
  );
};

export default Footer;