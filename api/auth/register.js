module.exports = async (req, res) => {
  try {
    const { AccountManager } = require('../server/Account');
    const jwt = require('jsonwebtoken');
    const cors = require('cors');
    
    cors()(req, res, () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      
      try {
        const { username, password, confirmPassword, email } = req.body;
        
        if (!username || !password) {
          return res.status(400).json({ error: 'Username and password are required' });
        }
        if (password !== confirmPassword) {
          return res.status(400).json({ error: 'Passwords do not match' });
        }
        
        (async () => {
          const account = await AccountManager.createAccount(username, password, email || null);
          const token = jwt.sign({ username }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', { expiresIn: '7d' });
          res.json({ success: true, token, username });
        })().catch(err => res.status(400).json({ error: err.message }));
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
