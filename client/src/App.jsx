import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInput from "./components/ChatInput";
import LoadingScreen from "./components/LoadingScreen";
import Footer from "./components/Footer";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "./App.css";

// Configure axios base URL for development
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5001";

function App() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]); // Start with empty array, no localStorage
  const [role, setRole] = useState("friendly assistant"); // Default role
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const chatWindowRef = useRef(null);

  // Theme apply
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Show loading screen for 3 seconds on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll chat to bottom on new messages or typing status
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        NProgress.start();
        const res = await axios.get("/api/chat/history");
        setChat(res.data.history || []);
        NProgress.done();
      } catch (err) {
        console.error("Failed to load chat history:", err);
        NProgress.done();
      }
    };
    fetchHistory();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    NProgress.start();

    const userMessage = {
      sender: "user",
      text: message,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    setChat((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const requestUrl = `${API_BASE_URL}/api/chat`;
      const requestData = { message, role };

      const res = await axios({
        method: "post",
        url: requestUrl,
        data: requestData,
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      });

      if (!res.data || !res.data.reply) {
        throw new Error("Invalid response format from server");
      }

      const botReply = {
        sender: "bot",
        text: res.data.reply,
        timestamp: new Date().toISOString(),
        id: Date.now() + 1,
      };

      setChat((prev) => [...prev, botReply]);

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
      console.error("Chat error details:", err);

      let errorText = "Sorry, I encountered an error. Please try again.";

      if (err.code === "ERR_NETWORK") {
        errorText =
          "❌ Cannot connect to server. Make sure your backend is running on port 5001.";
      } else if (err.code === "ECONNABORTED") {
        errorText = "❌ Request timeout. The server took too long to respond.";
      } else if (err.response?.status === 500) {
        errorText = `❌ Server error: ${err.response?.data?.error || "Internal server error"
          }`;
        if (err.response?.data?.details) {
          errorText += ` (${err.response.data.details})`;
        }
      } else if (err.response?.status === 400) {
        errorText = `❌ Bad request: ${err.response?.data?.error || "Invalid request"
          }`;
      } else if (err.response?.data?.error) {
        errorText = `❌ ${err.response.data.error}`;
      }

      const errorMessage = {
        sender: "bot",
        text: errorText,
        timestamp: new Date().toISOString(),
        id: Date.now() + 2,
        isError: true,
      };
      setChat((prev) => [...prev, errorMessage]);
    }
    NProgress.done();
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
      };

      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setChat([]);
    }
  };

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`app ${isDarkMode ? "dark-mode" : ""}`}>
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
            onClick={toggleDarkMode}
            className="theme-toggle"
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
          >
            {isDarkMode ? "☀️ Light" : "🌙 Dark"}
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

        <div
          style={{
            fontSize: "12px",
            color: "#666",
            marginTop: "10px",
            padding: "5px",
            backgroundColor: "#f0f0f0",
            borderRadius: "3px",
          }}
        >
          Debug: API URL = {API_BASE_URL || "relative"} | Role = {role} | Messages ={" "}
          {chat.length}
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

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
