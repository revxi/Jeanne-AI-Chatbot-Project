import React from 'react';
import './Footer.css';

const Footer = ({ isDarkMode }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`footer ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <div className="footer-robot">
              <div className="footer-robot-head">
                <div className="footer-robot-eye left-eye"></div>
                <div className="footer-robot-eye right-eye"></div>
                <div className="footer-robot-mouth"></div>
              </div>
              <div className="footer-robot-body">
                <div className="footer-robot-light"></div>
              </div>
            </div>
            <h3>AI Chatbot</h3>
          </div>
          <p className="footer-description">
            Your intelligent companion for meaningful conversations and helpful assistance.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Features</h4>
          <ul className="footer-links">
            <li>🤖 AI-Powered Conversations</li>
            <li>🎙️ Voice Input Support</li>
            <li>🌙 Dark Mode Toggle</li>
            <li>💬 Multiple Chat Personalities</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <ul className="footer-links">
            <li>📧 Contact Support</li>
            <li>📖 Documentation</li>
            <li>🐛 Report Issues</li>
            <li>⭐ Rate Project</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Technology</h4>
          <ul className="footer-links">
            <li>⚛️ React.js</li>
            <li>🎨 Modern CSS</li>
            <li>🚀 Vite Build</li>
            <li>🔧 Node.js Backend</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-divider"></div>
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} AI Chatbot. Built with ❤️ for GSSoc25</p>
          <div className="footer-social">
            <span className="social-link">📱</span>
            <span className="social-link">🐦</span>
            <span className="social-link">💼</span>
            <span className="social-link">📚</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 