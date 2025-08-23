
import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatInput from './components/ChatInput';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';
import { auth, googleProvider } from './firebase'; // Import auth and googleProvider
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth"; // Import auth functions
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [role, setRole] = useState("friendly assistant");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState(null); // Add user state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
=======
/*App.jsx*/
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInput from "./components/ChatInput";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem("selectedRole");
    return saved || "friendly assistant";
  });
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "light";
  });
  const chatWindowRef = useRef(null);


  // 🧠 Fetch chat history from backend on page load
  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const token = await user.getIdToken();
          const res = await axios.get('/api/chat/history', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setChat(res.data.history || []);
        } catch (err) {
          console.error('Failed to load chat history:', err);
        }
      };
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    localStorage.setItem("selectedRole", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleSendMessage = async (message) => {

    if (!message.trim() || !user) return;
    const userMessage = { sender: 'user', text: message };
    setChat(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const token = await user.getIdToken();
      const res = await axios.post('/api/chat', {

    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    setChat((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const res = await axios.post("/api/chat", {

        message: message,
        role: role,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const botReply = {
        sender: "bot",
        text: res.data.reply,
        timestamp: new Date().toISOString(),
        id: Date.now() + 1,
      };

      setChat((prev) => [...prev, botReply]);

      // Text-to-speech with better error handling
      if ("speechSynthesis" in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(res.data.reply);
          utterance.rate = 0.8;
          utterance.pitch = 1;
          utterance.volume = 0.7;
          speechSynthesis.speak(utterance);
        } catch (ttsError) {
          console.warn("Text-to-speech failed:", ttsError);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
        id: Date.now() + 2,
        isError: true,
      };
      setChat((prev) => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        handleSendMessage(transcript);
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        // You could add a toast notification here
      };

      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setChat([]);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="header-section">
            <div className="robot-logo-main">
              <div className="robot-head-main">
                <div className="robot-eye-main left-eye-main"></div>
                <div className="robot-eye-main right-eye-main"></div>
                <div className="robot-mouth-main"></div>
                <div className="robot-antenna-main left-antenna-main"></div>
                <div className="robot-antenna-main right-antenna-main"></div>
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
            {user && <button onClick={handleSignOut}>Sign Out</button>}
          </div>
          {!user ? (
            <button onClick={handleGoogleSignIn}>Continue with Google</button>
          ) : (
            <>
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
            </>
          )}
          <Footer isDarkMode={isDarkMode} />
        </div>
      )
      }
    </>

  const roleOptions = [
    { value: "friendly assistant", label: "Friendly Assistant", icon: "😊" },
    { value: "teacher", label: "Teacher", icon: "👨‍🏫" },
    { value: "funny friend", label: "Funny Friend", icon: "😄" },
    { value: "professional", label: "Professional", icon: "💼" },
    { value: "creative", label: "Creative", icon: "🎨" },
  ];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (msg, idx) => {
    const isUser = msg.sender === "user";
    const isError = msg.isError;

    return (
      <div
        key={msg.id || idx}
        className={`message ${msg.sender}${isError ? " error" : ""}`}
      >
        <div className="message-avatar">{isUser ? "👤" : "🤖"}</div>
        <div className="message-wrapper">
          <div className="message-sender">
            {isUser ? "You" : "Assistant"} • {formatTime(msg.timestamp)}
          </div>
          <div className="message-content">{msg.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">AI Chatbot 🤖</h1>
        <p className="app-subtitle">Your intelligent conversation partner</p>

        <div className="theme-controls">
          <select
            onChange={(e) => setRole(e.target.value)}
            value={role}
            className="role-selector"
            aria-label="Select assistant role"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } theme`}
          >
            {theme === "light" ? "🌙" : "☀️"}
            {theme === "light" ? "Dark" : "Light"}
          </button>

          <button
            onClick={clearChat}
            className="theme-toggle"
            style={{ color: "var(--error-text)" }}
            aria-label="Clear chat history"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          {chat.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-chat-icon">💬</div>
              <div className="empty-chat-text">Start a conversation!</div>
              <div className="empty-chat-subtext">
                Ask me anything - I'm here to help as your {role}.
              </div>
            </div>
          ) : (
            chat.map((msg, idx) => renderMessage(msg, idx))
          )}

          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-avatar">🤖</div>
              <div className="typing-content">
                <span>Assistant is typing</span>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="input-area">
          <ChatInput
            onSendMessage={handleSendMessage}
            onStartListening={startListening}
            isTyping={isTyping}
          />
        </div>
      </div>
    </div>

  );
}

export default App;