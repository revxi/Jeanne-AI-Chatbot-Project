import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ isDarkMode }) => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/chat');
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className={`login-page ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="login-container">
        <div className="robot-logo-main">
          <div className="robot-head-main">
            <div className="robot-eye-main left-eye-main"></div>
            <div className="robot-eye-main right-eye-main"></div>
            <div className="robot-mouth-main"></div>
          </div>
          <div className="robot-body-main">
            <div className="robot-chest-light-main"></div>
          </div>
        </div>
        <h1>Welcome to Jeanne AI</h1>
        <p>Your intelligent companion for meaningful conversations.</p>
        <button onClick={handleGoogleSignIn} className="google-signin-button">
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;