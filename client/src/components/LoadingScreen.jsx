import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="robot-logo">
          <div className="robot-head">
            <div className="robot-eye left-eye"></div>
            <div className="robot-eye right-eye"></div>
            <div className="robot-mouth"></div>
            <div className="robot-antenna left-antenna"></div>
            <div className="robot-antenna right-antenna"></div>
          </div>
          <div className="robot-body">
            <div className="robot-chest-light"></div>
          </div>
        </div>
        <h1>AI Chatbot</h1>
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
        <p>Initializing Neural Networks...</p>
        <div className="robot-status">
          <span className="status-dot"></span>
          <span className="status-text">AI Core Online</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 