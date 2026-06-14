const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');
const { AccountManager } = require('./server/Account');
const { sendWelcomeEmail, sendPasswordResetEmail, initializeEmailService } = require('./server/emailService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize email service (configure with Mailtrap or Gmail)
// IMPORTANT: Set environment variables or update the config below
// Example for Mailtrap:
// initializeEmailService({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: process.env.MAILTRAP_USER,
//     pass: process.env.MAILTRAP_PASSWORD
//   }
// });

// Allow requests from the React dev server (or any origin in production)
app.use(cors());
app.use(express.json());

// ===== AUTHENTICATION ROUTES =====

// Register a new account
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, confirmPassword, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const account = AccountManager.createAccount(username, password, email || null);

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
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const account = AccountManager.verifyLogin(username, password);
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
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const account = AccountManager.getAccount(username);
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
    res.status(500).json({ error: error.message });
  }
});

// Get user profile and best scores
app.get('/api/profile/:username', (req, res) => {
  try {
    const { username } = req.params;
    const account = AccountManager.getAccount(username);

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
app.post('/api/scores', (req, res) => {
  try {
    const { username, gameName, score } = req.body;

    if (!username || !gameName || score === undefined) {
      return res.status(400).json({ error: 'username, gameName, and score are required' });
    }

    const account = AccountManager.getAccount(username);
    if (!account) {
      return res.status(404).json({ error: 'User not found' });
    }

    account.addScore(gameName, score);
    AccountManager.saveAccount(account);

    res.json({
      success: true,
      bestScore: account.getBestScore(gameName),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard for a game
app.get('/api/leaderboard/:game', (req, res) => {
  try {
    const { game } = req.params;
    const { username } = req.query;

    const leaderboard = AccountManager.getLeaderboard(game, 5);

    let userRank = null;
    if (username) {
      userRank = AccountManager.getUserRank(game, username);
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

// ===== EXISTING ROUTES =====
  const game = req.query.game || 'Unknown';
  const scriptPath = path.join(__dirname, 'run_game.py');

  // Use environment override if needed (e.g. 'python3' on some systems)
  const PY_CMD = process.env.PYTHON_CMD || process.env.PYTHON || 'python';

  let out = '';
  let err = '';

  const py = spawn(PY_CMD, [scriptPath, game]);

  py.stdout.on('data', data => { out += data.toString(); });
  py.stderr.on('data', data => { err += data.toString(); });

  py.on('error', (e) => {
    res.status(500).type('text/plain').send(`Failed to start Python: ${e.message}`);
  });

  py.on('close', code => {
    if (err) {
      res.status(500).type('text/plain').send(err + '\n(Ensure Python is installed and in PATH or set PYTHON_CMD)');
      return;
    }
    res.type('text/plain').send(out);
  });
});

app.listen(PORT, () => {
  console.log(`Python-runner server listening on http://localhost:${PORT}`);
});
