import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatInput from './components/ChatInput';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [role, setRole] = useState("friendly assistant");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chat));
  }, [chat]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    const userMessage = { sender: 'user', text: message };
    setChat(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const res = await axios.post('/api/chat', {
        message: message,
        role: role,
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

  const sendMessage = async () => {
    if (!input.trim()) return;
    await handleSendMessage(input);
    setInput('');
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        handleSendMessage(transcript);
      };
      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
      };
      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="app">
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
        </div>
      )}
    </>
  );
}

export default App;
