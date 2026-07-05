module.exports = async (req, res) => {
  try {
    const { AccountManager } = require('../server/Account');
    const cors = require('cors');
    
    cors()(req, res, () => {
      if (req.method === 'GET') {
        const gameName = req.query.game;
        const username = req.query.username;
        
        (async () => {
          const leaderboard = await AccountManager.getLeaderboard(gameName, 5);
          let userRank = null;
          if (username) {
            userRank = await AccountManager.getUserRank(gameName, username);
          }
          res.json({ game: gameName, leaderboard, userRank });
        })().catch(err => res.status(500).json({ error: err.message }));
      } else if (req.method === 'POST') {
        try {
          const { username, gameName, score } = req.body;
          
          if (!username || !gameName || score === undefined) {
            return res.status(400).json({ error: 'username, gameName, and score are required' });
          }
          
          (async () => {
            const account = await AccountManager.getAccount(username);
            if (!account) {
              return res.status(404).json({ error: 'User not found' });
            }
            
            account.addScore(gameName, score);
            await AccountManager.saveAccount(account);
            
            res.json({ success: true, bestScore: account.getBestScore(gameName) });
          })().catch(err => res.status(500).json({ error: err.message }));
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
