import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ChatInput from './ChatInput';
import Footer from './Footer';

const ChatPage = ({ isDarkMode, toggleDarkMode }) => {
  const [chat, setChat] = useState([]);
  const [role, setRole] = useState("friendly assistant");
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const token = await user.getIdToken();
          const res = await axios.get('/api/chat/history', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setChat(res.data.history || []);
        } catch (err) {
          console.error('Failed to load chat history:', err);
        }
      };
      fetchHistory();
    }
  }, [user]);

  const handleSendMessage = async (message) => {
    if (!message.trim() || !user) return;
    const userMessage = { sender: 'user', text: message };
    setChat(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const token = await user.getIdToken();
      const res = await axios.post('/api/chat', {
        message: message,
        role: role,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const botReply = { sender: 'bot', text: res.data.reply };
      setChat(prev => [...prev, botReply]);
      const utterance = new SpeechSynthesisUtterance(res.data.reply);
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
      const errorMessage = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setChat(prev => [...prev, errorMessage]);
    }
    setIsTyping(false);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.onresult = (e) => {
        handleSendMessage(e.results[0][0].transcript);
      };
      recognition.onerror = (e) => console.error('Speech recognition error:', e.error);
      recognition.start();
    } else {
      alert('Speech recognition not supported.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="header-section">
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
        <h1>AI Chatbot</h1>
        <button
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      <select onChange={(e) => setRole(e.target.value)} value={role}>
        <option value="friendly assistant">Friendly Assistant</option>
        <option value="teacher">Teacher</option>
        <option value="funny friend">Funny Friend</option>
      </select>
      <div className="chat-window">
        {chat.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        ))}
        {isTyping && <p className="typing">Bot is typing...</p>}
      </div>
      <div className="input-area">
        <ChatInput
          onSendMessage={handleSendMessage}
          onStartListening={startListening}
          isTyping={isTyping}
        />
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default ChatPage;