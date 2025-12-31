import { useMemo } from 'react';
import './Profile.css';

const Profile = ({ user, chatHistory }) => {
  const stats = useMemo(() => {
    const userMessages = chatHistory.filter(m => m.sender === 'user').length;
    const botMessages = chatHistory.filter(m => m.sender === 'bot').length;
    const totalMessages = chatHistory.length;
    return { userMessages, botMessages, totalMessages };
  }, [chatHistory]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loops
    e.target.src = '/default-avatar.png';
  };

  return (
    <div className="profile-page">
      <div className="profile-grid">
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar-wrapper">
              <img 
                src={user.photoURL || '/default-avatar.png'} 
                alt={user.displayName} 
                className="profile-avatar"
                onError={handleImageError} 
              />
              <div className="online-indicator"></div>
            </div>
            <h1 className="profile-name">{user.displayName}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          {/* ... profile-stats ... */}
          <div className="profile-stats">
            <h3>Statistics</h3>
            <div className="stat-item">
              <span>Total Messages</span>
              <span className="stat-value">{stats.totalMessages}</span>
            </div>
            <div className="stat-item">
              <span>Messages Sent</span>
              <span className="stat-value">{stats.userMessages}</span>
            </div>
            <div className="stat-item">
              <span>Replies Received</span>
              <span className="stat-value">{stats.botMessages}</span>
            </div>
          </div>
        </aside>

        <main className="profile-main-content">
           {/* ... chat-history-container ... */}
           <div className="chat-history-container">
            <h2>Chat History</h2>
            {chatHistory.length > 0 ? (
              <div className="chat-history-list">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`history-message ${msg.sender}`}>
                    <div className="history-message-header">
                      <span className="history-sender">{msg.sender === 'user' ? 'You' : 'Bot'}</span>
                      <span className="history-timestamp">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <p className="history-text">{msg.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <span className="empty-history-icon">📂</span>
                <p>Your chat history is empty.</p>
                <span>Start a conversation to see your messages here.</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;