const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { AccountManager } = require('../server/Account');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, confirmPassword, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    const account = await AccountManager.createAccount(username, password, email || null);
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      token,
      username,
      message: email ? 'Account created! Check your email for confirmation.' : 'Account created successfully!',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const account = await AccountManager.verifyLogin(username, password);
    if (!account) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const account = await AccountManager.getAccount(username);
    if (!account || !account.email) {
      return res.status(400).json({
        error: 'No account found with this username, or no email on file.',
      });
    }
    
    res.json({
      success: true,
      message: 'If an account with this username and email exists, a password reset email has been sent.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save score
app.post('/api/scores', async (req, res) => {
  try {
    const { username, gameName, score } = req.body;
    
    if (!username || !gameName || score === undefined) {
      return res.status(400).json({ error: 'username, gameName, and score are required' });
    }
    
    const account = await AccountManager.getAccount(username);
    if (!account) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    account.addScore(gameName, score);
    await AccountManager.saveAccount(account);
    
    res.json({
      success: true,
      bestScore: account.getBestScore(gameName),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard/:game', async (req, res) => {
  try {
    const { game } = req.params;
    const { username } = req.query;
    
    const leaderboard = await AccountManager.getLeaderboard(game, 5);
    
    let userRank = null;
    if (username) {
      userRank = await AccountManager.getUserRank(game, username);
    }
    
    res.json({
      game,
      leaderboard,
      userRank,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile
app.get('/api/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const account = await AccountManager.getAccount(username);
    
    if (!account) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      username: account.username,
      email: account.email,
      created_at: account.created_at,
      games: account.games,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = async (req, res) => {
  console.log('=== API REQUEST ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  app(req, res);
};
