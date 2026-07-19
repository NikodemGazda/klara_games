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
    console.error('=== REGISTER ERROR ===');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.cause) console.error('Cause:', error.cause);
    console.error('=== END REGISTER ERROR ===');
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
    console.error('Login error:', error);
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
    console.error('Forgot password error:', error);
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
    console.error('Save score error:', error);
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
    console.error('Leaderboard error:', error);
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
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Diagnostic endpoint - check Redis connection
app.get('/api/diag', async (req, res) => {
  const diag = {
    env: {
      has_kv_url: !!process.env.KV_REST_API_URL,
      has_kv_token: !!process.env.KV_REST_API_TOKEN,
      has_upstash_url: !!process.env.UPSTASH_REDIS_REST_URL,
      has_upstash_token: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      node_version: process.version,
    },
    redis: null,
    account_module: null,
  };

  try {
    const { AccountManager, Account } = require('../server/Account');
    diag.account_module = { loaded: true };

    // Test Redis ping
    const pingResult = await AccountManager.testConnection();
    diag.redis = { ping: pingResult };
  } catch (error) {
    diag.redis = { error: error.message, name: error.name, stack: error.stack?.split('\n').slice(0, 3).join('\n') };
  }

  res.json(diag);
});

// Export for Vercel serverless functions
module.exports = app;
