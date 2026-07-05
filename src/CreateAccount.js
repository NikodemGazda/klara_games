import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './CreateAccount.css';

export default function CreateAccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!username || username.length < 5) {
      newErrors.username = 'Username must be at least 5 characters.';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match. Please try again.';
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register(username, password, confirmPassword, email);
      setSuccessMessage('You now have an account! Enjoy and Have Fun!!');
      setTimeout(() => {
        navigate('/games');
      }, 2000);
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-account-main">
      <div className="create-account-container">
        <Link to="/games" className="back-link">
          ← Back
        </Link>

        <h1>Create Account</h1>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="create-account-form">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username (3+ characters)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password (6+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (Optional)</label>
            <input
              id="email"
              type="email"
              placeholder="Enter email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
            <p className="email-note">
              ⚠️ <strong>Important:</strong> If you don't provide an email, you won't be able to
              reset your password if you forget it.
            </p>
          </div>

          {errors.form && <div className="error-message">{errors.form}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </div>
    </main>
  );
}
