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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
  );
}

export default App;