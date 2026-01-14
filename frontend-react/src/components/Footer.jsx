import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-main">
            🎵 AI Music Player - Emotion Detection Powered by Deep Learning
          </p>
          
          <div className="footer-links">
            <Link to="/about" className="footer-link">About Project</Link>
            <Link to="/history" className="footer-link">Your History</Link>
            <Link to="/chatbot" className="footer-link">AI Chat</Link>
          </div>
          
          <p className="footer-copyright">
            © 2025 AI Music Player. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
