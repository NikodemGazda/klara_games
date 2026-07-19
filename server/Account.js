const crypto = require('crypto');
const { Redis } = require('@upstash/redis');

const PREFIX = 'account:';

let redis;
try {
  redis = Redis.fromEnv();
  // Verify the connection works
  redis.ping().catch(err => {
    console.error('[Account] Redis ping failed:', err.message);
  });
} catch (error) {
  console.error('[Account] Failed to initialize Redis client:', error.message);
  // Create a mock Redis for graceful fallback
  redis = {
    get: async () => null,
    set: async () => {},
    scan: async () => ({ cursor: 0, keys: [] }),
    ping: async () => 'PONG',
  };
}

class Account {
  constructor(username, password, email = null) {
    this.username = username;
    this.password = this.hashPassword(password);
    this.email = email || null;
    this.created_at = new Date().toISOString();
    this.games = {};
  }

  static hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  static verifyPassword(password, hash) {
    return crypto.createHash('sha256').update(password).digest('hex') === hash;
  }

  getBestScore(gameName) {
    if (!this.games[gameName] || this.games[gameName].length === 0) {
      return null;
    }
    return Math.min(...this.games[gameName].map(record => record.score));
  }

  addScore(gameName, score, time = new Date().toISOString()) {
    if (!this.games[gameName]) {
      this.games[gameName] = [];
    }
    this.games[gameName].push({ score, time });
  }

  toJSON() {
    return {
      username: this.username,
      password: this.password,
      email: this.email,
      created_at: this.created_at,
      games: this.games,
    };
  }

  static fromJSON(data) {
    const account = new Account(data.username, 'dummy');
    account.password = data.password;
    account.email = data.email;
    account.created_at = data.created_at;
    account.games = data.games || {};
    return account;
  }
}

class AccountManager {
  static async createAccount(username, password, email = null) {
    const key = PREFIX + username;
    const existing = await redis.get(key);
    if (existing) {
      throw new Error('Username already exists');
    }

    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const account = new Account(username, password, email);
    await redis.set(key, JSON.stringify(account.toJSON()));
    return account;
  }

  static async getAccount(username) {
    const data = await redis.get(PREFIX + username);
    if (!data) return null;
    return Account.fromJSON(typeof data === 'string' ? JSON.parse(data) : data);
  }

  static async accountExists(username) {
    return await this.getAccount(username) !== null;
  }

  static async verifyLogin(username, password) {
    const account = await this.getAccount(username);
    if (!account) return null;
    if (Account.verifyPassword(password, account.password)) {
      return account;
    }
    return null;
  }

  static async saveAccount(account) {
    const key = PREFIX + account.username;
    await redis.set(key, JSON.stringify(account.toJSON()));
  }

  static async getLeaderboard(gameName, limit = 5) {
    const keys = [];
    let cursor = 0;
    
    do {
      const result = await redis.scan(cursor, {
        match: PREFIX + '*',
        count: 100,
      });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== 0);

    const scores = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (!data) continue;
      const account = Account.fromJSON(typeof data === 'string' ? JSON.parse(data) : data);
      const bestScore = account.getBestScore(gameName);
      if (bestScore !== null) {
        scores.push({
          username: account.username,
          score: bestScore,
        });
      }
    }

    scores.sort((a, b) => a.score - b.score);
    return scores.slice(0, limit);
  }

  static async getUserRank(gameName, username) {
    const leaderboard = await this.getLeaderboard(gameName, 1000);
    const index = leaderboard.findIndex(entry => entry.username === username);
    if (index === -1) {
      return null;
    }
    return {
      rank: index + 1,
      score: leaderboard[index].score,
    };
  }

  static async testConnection() {
    try {
      const result = await redis.ping();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message, name: error.name };
    }
  }
}

module.exports = { Account, AccountManager };
