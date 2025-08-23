import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // Make sure you have created firebase.js
import ChatInput from './components/ChatInput';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';
import Login from './components/Login'; // Make sure you have created Login.jsx
import './App.css';

const API_BASE_URL = import.meta.env.PROD ? "" : "http://localhost:5001";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Manages auth state loading
  const [chat, setChat] = useState([]);
  const [role, setRole] = useState("friendly assistant");
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode") || 'false'));
  const chatWindowRef = useRef(null);

  // Listen for authentication state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Fetch chat history only when a user is logged in
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        // Get the Firebase ID token for the current user
        const token = await user.getIdToken();
        try {
          // Send the token in the Authorization header
          const res = await axios.get(`${API_BASE_URL}/api/chat/history`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setChat(res.data.history || []);
        } catch (err) {
          console.error('Failed to load chat history:', err);
        }
      }
    };
    fetchHistory();
  }, [user]); // Re-run this effect when the user state changes

  // Effect to manage dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);
  
  // Effect to scroll the chat window
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will automatically update the user state to null
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || !user) return;

    const userMessage = { sender: "user", text: message, timestamp: new Date().toISOString(), id: Date.now() };
    setChat(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      const token = await user.getIdToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/chat`, 
        { message, role },
        { headers: { Authorization: `Bearer ${token}` } } // Send token with the request
      );
      const botReply = { sender: "bot", text: res.data.reply, timestamp: new Date().toISOString(), id: Date.now() + 1 };
      setChat(prev => [...prev, botReply]);
      // ... (rest of your success logic like text-to-speech)
    } catch (err) {
      console.error("Chat error:", err);
      const errorText = err.response?.data?.error || "Sorry, an error occurred. Please try again.";
      const errorMessage = { sender: "bot", text: errorText, timestamp: new Date().toISOString(), id: Date.now() + 2, isError: true };
      setChat(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  // --- Other functions remain the same ---
  const startListening = () => { /* ... */ };
  const clearChat = () => { if (window.confirm("Are you sure?")) setChat([]); };
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const roleOptions = [
    { value: "friendly assistant", label: "Friendly", icon: "😊" },
    { value: "teacher", label: "Teacher", icon: "👨‍🏫" },
    { value: "funny friend", label: "Funny", icon: "😄" },
  ];
  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderMessage = (msg, idx) => (
    <div key={msg.id || idx} className={`message ${msg.sender}${msg.isError ? " error" : ""}`}>
      <div className="message-avatar">{msg.sender === "user" ? "👤" : "🤖"}</div>
      <div className="message-wrapper">
        <div className="message-sender">
          {msg.sender === "user" ? "You" : "Assistant"} • {formatTime(msg.timestamp)}
        </div>
        <div className="message-content">{msg.text}</div>
      </div>
    </div>
  );

  // While Firebase is checking the auth state, show a loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render Login or Chat App based on user state
  return (
    <>
      {!user ? (
        <Login />
      ) : (
        <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="app-header">
            <div className="header-content">
              <h1 className="app-title">AI Chatbot 🤖</h1>
              <p className="app-subtitle">Welcome, {user.displayName || 'User'}!</p>
            </div>
            <div className="theme-controls">
              <select onChange={(e) => setRole(e.target.value)} value={role} className="role-selector">
                {roleOptions.map((option) => (<option key={option.value} value={option.value}>{option.icon} {option.label}</option>))}
              </select>
              <button onClick={toggleDarkMode} className="theme-toggle">{isDarkMode ? '☀️' : '🌙'}</button>
              <button onClick={clearChat} className="theme-toggle" title="Clear Chat">🗑️</button>
              <button onClick={handleLogout} className="theme-toggle" title="Logout">Logout</button>
            </div>
          </div>
          <div className="chat-container">
            <div className="chat-window" ref={chatWindowRef}>
              {chat.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-chat-icon">💬</div>
                  <div className="empty-chat-text">Start a conversation!</div>
                </div>
              ) : ( chat.map(renderMessage) )}
              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-avatar">🤖</div>
                  <div className="typing-content">
                    <span>Assistant is typing</span>
                    <div className="typing-dots"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div>
                  </div>
                </div>
              )}
            </div>
            <div className="input-area">
              <ChatInput onSendMessage={handleSendMessage} onStartListening={startListening} isTyping={isTyping} />
            </div>
          </div>
          <Footer isDarkMode={isDarkMode} />
        </div>
      )}
    </>
  );
}

export default App;