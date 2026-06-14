# Vercel Deployment Setup Prompt

Copy and paste this entire prompt into a new chat to get step-by-step Vercel setup instructions:

---

I have a game website project that I need to deploy to Vercel. Here's the full context:

## Project Overview
- **Frontend**: React app (Create React App) with React Router
- **Backend**: Node.js/Express server running on port 5000
- **Purpose**: A multiplayer game website where players can create accounts, play games, and compete on leaderboards
- **Games**: Currently just Hangman (tracks fastest completion time)

## Current Tech Stack
- **Frontend**: React 19, React Router DOM 7, CSS
- **Backend**: Node.js, Express 4, CORS, JWT authentication, Nodemailer for emails
- **Data Storage**: CSV files (accounts and game scores)
- **Authentication**: Custom JWT token system with password hashing (SHA-256)

## Key Features That Need to Work After Deployment
1. **User Authentication**
   - Registration and login endpoints
   - JWT token generation and validation
   - Password hashing

2. **Game Leaderboard**
   - Top 5 players by fastest completion time
   - Real-time score submissions from logged-in players
   - User's rank and score display

3. **Email System**
   - Welcome emails when users register (optional - uses Nodemailer)
   - Password recovery emails with credentials

4. **Data Persistence**
   - Currently using CSV files stored in `server/data/accounts.csv`
   - Need to switch to a database (SQLite, PostgreSQL, or similar) since CSV won't work well on Vercel

## Project Repository Structure
```
klara_games/
├── server.js                 (Main Express server)
├── server/
│   ├── Account.js           (User account logic)
│   ├── emailService.js      (Email handling)
│   └── data/
│       └── accounts.csv     (Currently stores all user data)
├── src/
│   ├── App.js
│   ├── AuthContext.js       (JWT + auth state management)
│   ├── LoginPopup.js        (Account creation/login UI)
│   ├── CreateAccount.js
│   ├── Leaderboard.js
│   ├── Hangman.js           (Game component)
│   └── GamePage.js
├── public/
│   ├── index.html
│   └── imgs/               (Game images)
└── package.json
```

## Current API Endpoints (All need to work on Vercel)
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Password recovery
- `POST /api/scores` - Submit game score
- `GET /api/leaderboard/:game` - Get top 5 leaderboard
- `GET /api/profile/:username` - Get user profile

## What I Need Help With
Please give me COMPLETE STEP-BY-STEP instructions to:

1. **Prepare the project for Vercel deployment**
   - What files/config need to change?
   - Do I need to add a `vercel.json` file?

2. **Switch from CSV to a database**
   - What database should I use that works with Vercel free tier?
   - How do I migrate the Account.js logic to use a database instead of CSV?
   - Provide code changes needed

3. **Set up environment variables**
   - What variables do I need on Vercel (database connection, JWT secret, email credentials)?
   - Where do I set them in Vercel?

4. **Deploy the frontend and backend**
   - Deploy the Node.js backend
   - Deploy the React frontend
   - Configure them to communicate properly

5. **Configure the frontend to use the deployed backend URL**
   - How do I update the fetch URLs from `localhost:5000` to the deployed backend?

6. **Set up the email service**
   - Use Mailtrap or Gmail with app password?
   - How do I securely store and use email credentials on Vercel?

7. **Test the deployed app**
   - How do I verify everything works after deployment?

Please provide all necessary code changes, file edits, and exact commands to run. I want the final result to be a fully functional multiplayer game website where real users can sign up, play games, and see live leaderboards.

---

That's the prompt! Just copy everything above and paste it into a new chat.
