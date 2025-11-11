import React, { useRef, useEffect } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';

function GameCanvas({ authToken, onGameOver, apiBase }) {
  const canvasRef = useRef(null);

  const {
    gameRunning,
    gamePaused,
    restartGame,
  } = useGameEngine(canvasRef, authToken, onGameOver, apiBase);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = () => {
      if (!gameRunning || gamePaused) {
        restartGame();
      }
    };

    const handleTouch = (e) => {
      e.preventDefault();
      if (!gameRunning || gamePaused) {
        restartGame();
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [gameRunning, gamePaused, restartGame]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas 
        ref={canvasRef} 
        width="1000" 
        height="400"
        style={{ display: 'block' }}
      />
      {gamePaused && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: "'Courier New', monospace",
          }}>
            ⏸️ PAUSED
          </div>
          <div style={{
            fontSize: '20px',
            color: '#4ecdc4',
            marginTop: '20px',
            fontFamily: "'Courier New', monospace",
          }}>
            Press P to resume | R to restart
          </div>
        </div>
      )}
    </div>
  );
}

export default GameCanvas;



