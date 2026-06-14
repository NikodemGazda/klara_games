import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPopup.css';

export default function LoginPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, continueAsGuest, isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();

  // Show popup only on first visit to the website
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('loginPopupSeen');
    if (!hasSeenPopup && !isAuthenticated && !isGuest) {
      setIsOpen(true);
      sessionStorage.setItem('loginPopupSeen', 'true');
    }
  }, [isAuthenticated, isGuest]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClick = () => {
    continueAsGuest();
    setIsOpen(false);
  };

  const handleCreateAccount = () => {
    setIsOpen(false);
    navigate('/create-account');
  };

  const handleClose = () => {
    setIsOpen(false);
    continueAsGuest(); // Continue as guest when closing
  };

  if (!isOpen) return null;

  return (
    <div className="login-popup-overlay">
      <div className="login-popup-container">
        <button className="popup-close-btn" onClick={handleClose} aria-label="Close">
          ✕
        </button>

        <h1>Welcome to Klara Games!</h1>
        <p>Do you have an account?</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="popup-divider">or</div>

        <button onClick={handleCreateAccount} className="btn-secondary">
          Create Account
        </button>

        <button onClick={handleGuestClick} className="btn-tertiary">
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
