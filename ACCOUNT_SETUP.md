# Account System Setup Guide

## Overview
Your game website now has a complete account system with:
- ✅ User registration and login
- ✅ Email notifications for account creation & password recovery
- ✅ Game score tracking (fastest completion time)
- ✅ Leaderboard showing top 5 players + your rank
- ✅ Guest mode for playing without logging in
- ✅ CSV-based data storage

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```
   This installs: express, cors, jsonwebtoken, nodemailer, and all React dependencies.

## Email Setup (Choose One Option)

### Option 1: Mailtrap (Easiest - Free, No Credit Card)
1. Go to https://mailtrap.io and create a free account
2. Create a new project (e.g., "Klara Games")
3. Go to Settings > Integrations and find "Nodemailer"
4. Copy the credentials from the integration settings
5. In your terminal, set environment variables:
   ```bash
   set MAILTRAP_USER=<your_mailtrap_user>
   set MAILTRAP_PASSWORD=<your_mailtrap_password>
   ```
6. In `server.js`, uncomment and update the Mailtrap configuration

### Option 2: Gmail
1. Create a Gmail account (or use existing one)
2. Enable 2-factor authentication on your Gmail account
3. Generate an app password: https://support.google.com/accounts/answer/185833
4. Set environment variables:
   ```bash
   set GMAIL_USER=your-email@gmail.com
   set GMAIL_PASSWORD=your-app-password
   ```
5. In `server.js`, use the Gmail configuration (already provided)

### Option 3: Skip Email (Development Only)
- Leave email service commented out in `server.js`
- The system will continue to work, just without sending emails

## Running the App

### Terminal 1: Backend Server
```bash
npm run server
# Runs on http://localhost:5000
```

### Terminal 2: React App (in same directory or new tab)
```bash
npm start
# Runs on http://localhost:3000
```

## Features

### Login Popup
- Appears once when user first visits the website
- Can be closed with X button (continues as guest)
- Options: Login, Create Account, or Continue as Guest

### Create Account Page
- Route: `/create-account`
- Fields: Username, Password, Confirm Password, Email (optional)
- Warning about password recovery if email isn't provided
- Redirects to games after account creation

### Game Scoring
- **Hangman**: Score = Fastest completion time in seconds
- Scores only recorded for logged-in users (not guests)
- Guest players can see leaderboard but not submit scores

### Leaderboard
- Shows top 5 players by score
- Below top 5: Shows your rank and score (if logged in)
- Located under the game
- Leaderboard ranks by fastest time (lower is better)

## Data Storage

### CSV Files
- Location: `server/data/accounts.csv`
- Format: `username, password_hash, email, created_at, games_json`
- Auto-creates on first use

### CSV Structure
```
"username","password_hash","email","created_at","games_json"
"alice","sha256hash...","alice@example.com","2026-01-01T...","{"hangman":[{"score":45.32,"time":"2026-01-01T..."}]}"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset

### Game Data
- `POST /api/scores` - Submit game score
- `GET /api/leaderboard/:game` - Get top 5 leaderboard
- `GET /api/profile/:username` - Get user profile

## Troubleshooting

### Email not sending?
1. Check if email service is initialized in `server.js`
2. Verify Mailtrap credentials are correct
3. Check console logs for error messages
4. Try test mode in Mailtrap dashboard

### Scores not saving?
1. Ensure you're logged in (not guest)
2. Check backend is running on port 5000
3. Check browser console for fetch errors
4. Verify `server/data/` directory exists

### CSV file not created?
- The system auto-creates it on first registration attempt
- If issues persist, manually create `server/data/accounts.csv` with header:
  ```
  "username","password_hash","email","created_at","games_json"
  ```

## Password Security
- Passwords are hashed using SHA-256
- Never stored in plain text
- Forgot password emails provide username & password (recommend strong passwords)

## Future Enhancements
- Database migration (SQLite, PostgreSQL)
- Password reset tokens (instead of email passwords)
- More games with different scoring systems
- Leaderboard filters (by date, game version)
- User profiles and achievement badges
