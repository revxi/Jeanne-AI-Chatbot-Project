import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, handleLogout, isDarkMode, toggleDarkMode }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loops
    e.target.src = '/default-avatar.png'; // Path to your fallback image in the public folder
  };

  return (
    <nav className="navbar">
      {/* ... navbar-left ... */}
      <div className="navbar-left">
        <NavLink to="/" className="nav-logo">
          <div className="robot-logo-nav">
             <div className="robot-logo-nav-eye"></div>
          </div>
          <span>AI Chatbot</span>
        </NavLink>
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Chat
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Profile
          </NavLink>
        </div>
      </div>

      <div className="navbar-right">
        <button onClick={toggleDarkMode} className="theme-toggle-nav" title="Toggle Theme">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div 
          className="nav-user" 
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <img 
            src={user.photoURL || '/default-avatar.png'} 
            alt={user.displayName} 
            className="user-avatar" 
            onError={handleImageError} 
          />
          <span className="user-name">{user.displayName.split(' ')[0]}</span>
          <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <NavLink to="/profile" className="dropdown-item">View Profile</NavLink>
              <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;