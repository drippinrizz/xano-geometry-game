import React, { useState, useEffect } from 'react';

function LeaderboardModal({ show, onClose, apiBase }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      loadLeaderboard();
    }
  }, [show]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/leaderboards`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.items || []);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div className="modal show">
      <div className="modal-content">
        <h2>🏆 Backend Nightmare Survivors</h2>
        <div>
          {loading ? (
            <div className="loading-text">
              <div className="loading-spinner"></div>
              Loading backend survivors...
            </div>
          ) : leaderboard.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#ff6b6b' }}>
              No scores yet! Be the first to survive the backend nightmare!
            </p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Developer</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                  return (
                    <tr key={entry.id || index}>
                      <td>{rankEmoji}</td>
                      <td>{entry.user ? entry.user.name : 'Anonymous'}</td>
                      <td>{entry.score.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-buttons">
          <button type="button" className="modal-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal;

