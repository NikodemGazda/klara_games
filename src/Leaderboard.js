import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import './Leaderboard.css';

export default function Leaderboard({ gameName }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const query = user ? `?username=${user.username}` : '';
        const response = await fetch(
          `/api/leaderboard/${gameName}${query}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await response.json();
        setLeaderboard(data.leaderboard);
        setUserRank(data.userRank);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameName, user]);

  if (loading) {
    return <div className="leaderboard-container">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="leaderboard-container error">{error}</div>;
  }

  return (
    <div className="leaderboard-container">
      <h2>🏆 Leaderboard</h2>

      {leaderboard.length === 0 ? (
        <p className="empty-leaderboard">No scores yet. Be the first to play!</p>
      ) : (
        <>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score (seconds)</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.username} className="leaderboard-row">
                  <td className="rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </td>
                  <td className="player-name">{entry.username}</td>
                  <td className="score">{entry.score.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {userRank && user && (
            <div className="user-rank-section">
              <div className="user-rank-info">
                <span className="label">Your Rank:</span>
                <span className="rank-value">#{userRank.rank}</span>
                <span className="label">Your Score:</span>
                <span className="score-value">{userRank.score.toFixed(2)}s</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
