const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ACCOUNTS_FILE = path.join(__dirname, 'data', 'accounts.csv');
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Account {
  constructor(username, password, email = null) {
    this.username = username;
    this.password = this.hashPassword(password); // Store hashed password
    this.email = email || null;
    this.created_at = new Date().toISOString();
    this.games = {}; // { gameName: [{ score, timestamp }] }
  }

  static hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  static verifyPassword(password, hash) {
    return crypto.createHash('sha256').update(password).digest('hex') === hash;
  }

  // Get best score for a game
  getBestScore(gameName) {
    if (!this.games[gameName] || this.games[gameName].length === 0) {
      return null;
    }
    // For fastest time, return the minimum
    return Math.min(...this.games[gameName].map(record => record.score));
  }

  // Add a game score
  addScore(gameName, score, time = new Date().toISOString()) {
    if (!this.games[gameName]) {
      this.games[gameName] = [];
    }
    this.games[gameName].push({ score, time });
  }

  // Convert to CSV row format
  toCsvRow() {
    return `"${this.username}","${this.password}","${this.email || ''}","${this.created_at}","${JSON.stringify(this.games)}"`;
  }

  // Convert from CSV row
  static fromCsvRow(row) {
    const [username, password, email, created_at, games_json] = this.parseCsvRow(row);
    const account = new Account(username, 'dummy'); // We'll replace the hash
    account.password = password;
    account.email = email || null;
    account.created_at = created_at;
    account.games = games_json ? JSON.parse(games_json) : {};
    return account;
  }

  static parseCsvRow(row) {
    // Simple CSV parser that handles quoted fields
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}

class AccountManager {
  static ensureHeaderExists() {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
      const header = '"username","password_hash","email","created_at","games_json"\n';
      fs.writeFileSync(ACCOUNTS_FILE, header, 'utf8');
    }
  }

  static createAccount(username, password, email = null) {
    this.ensureHeaderExists();

    // Check if username exists
    if (this.accountExists(username)) {
      throw new Error('Username already exists');
    }

    // Validate username and password
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const account = new Account(username, password, email);
    const csvRow = account.toCsvRow();
    
    fs.appendFileSync(ACCOUNTS_FILE, csvRow + '\n', 'utf8');
    return account;
  }

  static getAccount(username) {
    this.ensureHeaderExists();
    const lines = fs.readFileSync(ACCOUNTS_FILE, 'utf8').split('\n');
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      if (lines[i].trim() === '') continue;
      const account = Account.fromCsvRow(lines[i]);
      if (account.username === username) {
        return account;
      }
    }
    return null;
  }

  static accountExists(username) {
    return this.getAccount(username) !== null;
  }

  static verifyLogin(username, password) {
    const account = this.getAccount(username);
    if (!account) {
      return null;
    }
    if (Account.verifyPassword(password, account.password)) {
      return account;
    }
    return null;
  }

  static saveAccount(account) {
    this.ensureHeaderExists();
    const lines = fs.readFileSync(ACCOUNTS_FILE, 'utf8').split('\n');
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const currentAccount = Account.fromCsvRow(lines[i]);
      if (currentAccount.username === account.username) {
        lines[i] = account.toCsvRow();
        fs.writeFileSync(ACCOUNTS_FILE, lines.join('\n'), 'utf8');
        return;
      }
    }
  }

  static getLeaderboard(gameName, limit = 5) {
    this.ensureHeaderExists();
    const lines = fs.readFileSync(ACCOUNTS_FILE, 'utf8').split('\n');
    const scores = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const account = Account.fromCsvRow(lines[i]);
      const bestScore = account.getBestScore(gameName);
      if (bestScore !== null) {
        scores.push({
          username: account.username,
          score: bestScore,
        });
      }
    }

    // Sort by score (ascending for time-based, where lower is better)
    scores.sort((a, b) => a.score - b.score);
    return scores.slice(0, limit);
  }

  static getUserRank(gameName, username) {
    const leaderboard = this.getLeaderboard(gameName, 1000); // Get a large list
    const index = leaderboard.findIndex(entry => entry.username === username);
    if (index === -1) {
      return null;
    }
    return {
      rank: index + 1,
      score: leaderboard[index].score,
    };
  }
}

module.exports = { Account, AccountManager };
