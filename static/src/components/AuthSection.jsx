import React from 'react';

function AuthSection({ isAuthenticated, onLoginClick, onSignupClick, onLeaderboardClick }) {
  return (
    <>
      {!isAuthenticated && (
        <div className="auth-section">
          <button className="auth-btn" onClick={onLoginClick}>Login</button>
          <button className="auth-btn" onClick={onSignupClick}>Sign Up</button>
        </div>
      )}
      
      <div className="auth-section" style={{ top: isAuthenticated ? '20px' : '70px', right: '20px' }}>
        <button className="leaderboard-btn" onClick={onLeaderboardClick}>
          🏆 Leaderboard
        </button>
      </div>
    </>
  );
}

export default AuthSection;

