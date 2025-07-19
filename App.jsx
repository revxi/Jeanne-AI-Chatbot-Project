
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [role, setRole] = useState("friendly assistant");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chat));
  }, [chat]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setChat([...chat, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        role: role,
      });
      const botReply = { sender: 'bot', text: res.data.reply };
      setChat(prev => [...prev, userMessage, botReply]);
      const utterance = new SpeechSynthesisUtterance(res.data.reply);
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error(err);
    }
    setIsTyping(false);
  };

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div className="app">
      <h1>AI Chatbot 🤖</h1>
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
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={startListening}>🎙️ Speak</button>
      </div>
    </div>
  );
}

export default App;
