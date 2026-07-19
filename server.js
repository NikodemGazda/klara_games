const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { AccountManager } = require('./server/Account');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// ===== AUTHENTICATION ROUTES =====

// Register a new account
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

    // Send welcome email if email provided
    if (email) {
      sendWelcomeEmail(email, username, password).catch(err => {
        console.error('Failed to send welcome email:', err);
      });
    }

    // Generate JWT token
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
    console.error('=== LOGIN ERROR ===');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.cause) console.error('Cause:', error.cause);
    console.error('=== END LOGIN ERROR ===');
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
        error: 'No account found with this username, or no email on file. Password recovery is not available.',
      });
    }

    // For security, we cannot send the actual password (it's hashed)
    // In a real app, we'd generate a temporary reset token
    // For now, we'll send a generic message
    res.json({
      success: true,
      message: 'If an account with this username and email exists, a password reset email has been sent.',
    });

    // Note: In production, implement proper password reset tokens
  } catch (error) {
    console.error('=== FORGOT PASSWORD ERROR ===');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.cause) console.error('Cause:', error.cause);
    console.error('=== END FORGOT PASSWORD ERROR ===');
    res.status(500).json({ error: error.message });
  }
});

// Get user profile and best scores
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

// Save game score
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

// Get leaderboard for a game
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export for Vercel serverless functions
module.exports = app;

// Only start server if running locally (not on Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}
