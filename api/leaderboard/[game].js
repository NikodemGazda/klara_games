module.exports = async (req, res) => {
  try {
    const { AccountManager } = require('../server/Account');
    const cors = require('cors');
    
    cors()(req, res, () => {
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
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
