import React from 'react';

function GameOverModal({ 
  show, 
  onClose, 
  gameOverData, 
  isAuthenticated, 
  onLoginClick, 
  onSignupClick,
  onShowLeaderboard 
}) {
  if (!show) return null;

  const { score = 0, isNewHighScore = false, deathMessage = "Your backend just crashed!" } = gameOverData;

  const handleRestart = () => {
    onClose();
  };

  return (
    <div className="game-over" style={{ display: 'block' }}>
      <h2 style={{ color: '#ff6b6b' }}>BACKEND CRASHED! 💥</h2>
      <p 
        id="finalScore" 
        className={isNewHighScore ? 'new-high-score' : ''}
        style={{ fontSize: '1.5em', margin: '15px 0' }}
      >
        {isNewHighScore ? `🎉 NEW HIGH SCORE: ${score.toLocaleString()}! 🎉` : `Score: ${score.toLocaleString()}`}
      </p>
      <p style={{ color: '#ff6b6b', fontStyle: 'italic', margin: '10px 0', fontSize: '0.9em' }}>
        {deathMessage}
      </p>
      
      {!isAuthenticated && score > 500 && (
        <div style={{
          display: 'block',
          margin: '15px 0',
          padding: '15px',
          background: 'rgba(0, 245, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid #00f5ff'
        }}>
          <p style={{ color: '#00f5ff', margin: '0 0 10px 0' }}>
            🏆 Want to save this score to the leaderboard?
          </p>
          <p style={{ color: '#4ecdc4', fontSize: '0.9em', margin: '0 0 15px 0' }}>
            Sign up now to compete with other backend survivors!
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={onSignupClick}
              style={{
                padding: '8px 16px',
                background: '#00f5ff',
                color: '#000',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: "'Courier New', monospace"
              }}
            >
              Sign Up
            </button>
            <button 
              onClick={onLoginClick}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#4ecdc4',
                border: '1px solid #4ecdc4',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: "'Courier New', monospace"
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
      
      {isAuthenticated && (
        <p style={{ color: '#4ecdc4', margin: '10px 0' }}>
          Score submitted to leaderboard! 🎉
        </p>
      )}
      
      <p style={{ color: '#4ecdc4' }}>Maybe use Xano next time? 😉</p>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
        <button 
          onClick={handleRestart}
          style={{
            padding: '10px 20px',
            fontSize: '1.1em',
            background: '#00f5ff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
        {isAuthenticated && (
          <button 
            onClick={onShowLeaderboard}
            style={{
              padding: '10px 20px',
              fontSize: '1.1em',
              background: 'transparent',
              color: '#ffd700',
              border: '1px solid #ffd700',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            View Leaderboard
          </button>
        )}
      </div>
    </div>
  );
}

export default GameOverModal;



