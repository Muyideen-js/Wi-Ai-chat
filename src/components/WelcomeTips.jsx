import React from 'react';
import { FaSearch, FaRobot, FaMagic } from 'react-icons/fa';

const WelcomeTips = ({ onClose }) => {
  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <div className="welcome-header">
          <div className="logo-pulse">✨</div>
          <h2>AI Chat Assistant</h2>
          <div className="header-line"></div>
        </div>
        
        <div className="tips-content">
          <div className="tip-item animate-in">
            <div className="tip-icon">
              <FaSearch />
            </div>
            <div className="tip-text">
              <h3>Smart Web Search</h3>
              <p>Real-time internet knowledge at your fingertips</p>
            </div>
          </div>

          <div className="tip-item animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="tip-icon">
              <FaRobot />
            </div>
            <div className="tip-text">
              <h3>Gemini AI</h3>
              <p>Advanced AI conversations with deep understanding</p>
            </div>
          </div>

          <div className="tip-item animate-in" style={{ animationDelay: '0.4s' }}>
            <div className="tip-icon">
              <FaMagic />
            </div>
            <div className="tip-text">
              <h3>Magic Features</h3>
              <p>Voice chat, image analysis, and more</p>
            </div>
          </div>
        </div>

        <button className="start-btn pulse" onClick={onClose}>
          Let's Begin
        </button>
      </div>
    </div>
  );
};

export default WelcomeTips; 