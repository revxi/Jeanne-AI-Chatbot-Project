import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatInput from '../components/ChatInput';
import Footer from '../components/Footer';

const API_BASE_URL = import.meta.env.PROD ? "" : "http://localhost:5001";

const ChatPage = ({ user, chat, setChat }) => {
  const [role, setRole] = useState("friendly assistant");
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botReply = { sender: "bot", text: res.data.reply, timestamp: new Date().toISOString(), id: Date.now() + 1 };
      setChat(prev => [...prev, botReply]);
    } catch (err) {
      const errorText = err.response?.data?.error || "An error occurred.";
      const errorMessage = { sender: "bot", text: errorText, timestamp: new Date().toISOString(), id: Date.now() + 2, isError: true };
      setChat(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };
    // ... (Your other chat functions: startListening, formatTime, renderMessage, etc.)

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


  return (
    <>
      <div className="chat-container">
        <div className="chat-window" ref={chatWindowRef}>
          {chat.length === 0 ? (
            <div className="empty-chat">...</div>
          ) : (
            chat.map(renderMessage)
          )}
          {isTyping && (
           <div className="typing-indicator">...</div>
          )}
        </div>
        <div className="input-area">
          <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatPage;