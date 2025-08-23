import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Navbar from './components/Navbar';
import ChatPage from './pages/ChatPage'; // We will create this wrapper
import Profile from './components/Profile';
import LoadingScreen from './components/LoadingScreen';
import Login from './components/Login';
import './App.css';

const API_BASE_URL = import.meta.env.PROD ? "" : "http://localhost:5001";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chat, setChat] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode") || 'false'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const token = await user.getIdToken();
        try {
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
  }, [user]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
        {!user ? (
          <Login />
        ) : (
          <>

            <Navbar
              user={user}
              handleLogout={handleLogout}
              isDarkMode={isDarkMode}
              toggleDarkMode={() => setIsDarkMode(prev => !prev)}
            />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<ChatPage user={user} chat={chat} setChat={setChat} />} />
                <Route path="/profile" element={<Profile user={user} chatHistory={chat} />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;