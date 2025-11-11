import { useState, useEffect, useRef, useCallback } from 'react';

const BASE_GAME_SPEED = 2.0;

export function useGameEngine(canvasRef, authToken, onGameOver, apiBase) {
  const [gameRunning, setGameRunning] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(BASE_GAME_SPEED);
  const [comboCount, setComboCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [isRainbowMode, setIsRainbowMode] = useState(false);
  const [highScore] = useState(localStorage.getItem('xanoHighScore') || 0);

  const gameStateRef = useRef({
    player: {
      x: 100,
      y: 0,
      width: 50,
      height: 50,
      jumpHeight: 0,
      jumpSpeed: 0,
      grounded: true,
      doubleJump: false,
      invincible: false,
      invincibleStartTime: 0,
      invincibleDuration: 0,
      rateLimiterActive: false,
      rateLimiterStartTime: 0,
      rateLimiterDuration: 0,
      ddosActive: false,
      ddosTime: 0,
      ddosStartTime: 0,
      ddosDirection: 1,
    },
    obstacles: [],
    powerUps: [],
    lastObstacleX: -200,
    lastObstacleTime: 0,
    lastSpeedIncrease: 0,
    currentGameId: null,
    konamiCode: [],
  });

  const animationFrameRef = useRef(null);
  const pauseStartTimeRef = useRef(0);
  const totalPausedTimeRef = useRef(0);

  const obstacleTypes = [
    { emoji: '⛔', text: '502', color: '#ff6b6b', width: 35, height: 30, humor: "Bad Gateway Blues" },
    { emoji: '🗡️', text: 'SQL', color: '#ff9f43', width: 30, height: 30, humor: "Little Bobby Tables strikes again!" },
    { emoji: '🐌', text: 'SLOW', color: '#26de81', width: 40, height: 20, humor: "O(n²) algorithm detected" },
    { emoji: '🚫', text: 'CORS', color: '#fd79a8', width: 35, height: 30, humor: "Access denied from localhost" },
    { emoji: '👨‍💻', text: 'while(true)', color: '#a29bfe', width: 45, height: 30, humor: "Infinite loop of despair" },
    { emoji: '🔒', text: 'RATE', color: '#e17055', width: 35, height: 30, humor: "Too many requests, chill out!" },
    { emoji: '💾', text: 'LOCK', color: '#00b894', width: 35, height: 30, humor: "Database locked by mysterious process" },
    { emoji: '⚡', text: 'CACHE', color: '#fdcb6e', width: 40, height: 25, humor: "Cache miss at the worst moment" },
    { emoji: '🔥', text: 'OOM', color: '#e84393', width: 30, height: 35, humor: "Out of memory, out of luck" },
    { emoji: '🌪️', text: 'DDOS', color: '#6c5ce7', width: 35, height: 35, humor: "Traffic tsunami incoming!" },
    { emoji: '🕳️', text: 'NULL', color: '#636e72', width: 30, height: 25, humor: "Null pointer exception vibes" },
    { emoji: '🔧', text: 'MAINT', color: '#00cec9', width: 40, height: 30, humor: "Scheduled downtime (unscheduled panic)" },
  ];

  const powerUpTypes = [
    { emoji: '🧠', text: 'Function Stack', color: '#00cec9', effect: 'invincible' },
    { emoji: '⚙️', text: 'Auto-Scale', color: '#6c5ce7', effect: 'doubleJump' },
    { emoji: '🛡️', text: 'Rate Limiter', color: '#a29bfe', effect: 'slowDown' },
  ];

  const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

  const createGameSession = async () => {
    if (!authToken) return null;
    try {
      const response = await fetch(`${apiBase}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
    } catch (error) {
      console.error('Error creating game session:', error);
    }
    return null;
  };

  const submitScore = async (playerScore, gameId) => {
    if (!authToken || !gameId) return;
    try {
      await fetch(`${apiBase}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ score: playerScore, game_id: gameId }),
      });
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const drawBackground = (ctx, canvas) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
    ctx.lineWidth = 1;
    const gridOffset = (Date.now() * 0.05) % 50;
    for (let x = -gridOffset; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  };

  const drawPlayer = (ctx, player, canvas, isRainbow) => {
    ctx.save();
    if (player.invincible) {
      ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
    }
    const y = canvas.height - 80 - player.jumpHeight;
    
    // Draw X logo SVG
    ctx.translate(player.x + player.width / 2, y + player.height / 2);
    ctx.scale(player.width / 36, player.height / 24);
    ctx.translate(-18, -12);
    
    // Draw the X path from logo
    const xPath = new Path2D('M23.4625 11.3105L35.1795 0.291809H24.8812L18.3135 6.46918L23.4238 11.2734L23.4625 11.3105ZM23.4238 12.7087L18.3135 17.5147L24.8812 23.6905H35.1795L23.4625 12.6719L23.4238 12.7087ZM10.2983 0.291809H0L12.4396 11.992L0 23.6906H10.2983L22.7407 11.992L10.2983 0.291809Z');
    
    if (isRainbow) {
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `hsl(${(Date.now() * 0.1 + i * 36) % 360}, 100%, 50%)`;
        ctx.globalAlpha = 0.3 - i * 0.03;
        ctx.fill(xPath);
      }
    } else {
      ctx.fillStyle = '#007bff';
      ctx.fill(xPath);
    }
    
    ctx.restore();
  };

  const drawObstacle = (ctx, obstacle) => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(obstacle.emoji, obstacle.x + obstacle.width / 2, obstacle.y + 30);
    ctx.font = 'bold 10px Courier New';
    ctx.fillStyle = '#fff';
    ctx.fillText(obstacle.text, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height - 5);
  };

  const drawPowerUp = (ctx, powerUp) => {
    const float = Math.sin(Date.now() * 0.005 + powerUp.x * 0.01) * 5;
    ctx.fillStyle = powerUp.color;
    ctx.fillRect(powerUp.x, powerUp.y + float, 40, 40);
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(powerUp.emoji, powerUp.x + 20, powerUp.y + float + 25);
  };

  const drawUI = (ctx, canvas, currentScore, currentSpeed, currentCombo, currentMultiplier, player, isRainbow) => {
    ctx.font = 'bold 24px Courier New';
    ctx.fillStyle = '#00f5ff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${currentScore.toLocaleString()}`, 20, 40);
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Best: ${parseInt(highScore).toLocaleString()}`, 20, 65);
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText(`Speed: ${currentSpeed.toFixed(1)}x`, 20, 90);
    if (currentCombo > 0) {
      ctx.font = 'bold 20px Courier New';
      ctx.fillStyle = currentCombo > 10 ? '#ff6b6b' : currentCombo > 5 ? '#ffd700' : '#4ecdc4';
      ctx.fillText(`🔥 COMBO x${currentCombo} (${currentMultiplier.toFixed(1)}x points)`, 20, 120);
    }
    let yOffset = 150;
    const now = Date.now();
    if (player.invincible) {
      const elapsed = now - player.invincibleStartTime;
      const timeLeft = Math.max(0, Math.ceil((player.invincibleDuration - elapsed) / 1000));
      ctx.font = '16px Courier New';
      ctx.fillStyle = '#00cec9';
      ctx.fillText(`🧠 INVINCIBLE (${timeLeft}s)`, 20, yOffset);
      yOffset += 25;
    }
    if (player.doubleJump) {
      ctx.font = '16px Courier New';
      ctx.fillStyle = '#6c5ce7';
      ctx.fillText('⚙️ DOUBLE JUMP', 20, yOffset);
      yOffset += 25;
    }
    if (player.rateLimiterActive) {
      const elapsed = now - player.rateLimiterStartTime;
      const timeLeft = Math.max(0, Math.ceil((player.rateLimiterDuration - elapsed) / 1000));
      ctx.font = '16px Courier New';
      ctx.fillStyle = '#a29bfe';
      ctx.fillText(`🛡️ RATE LIMITER (${timeLeft}s)`, 20, yOffset);
      yOffset += 25;
    }
    if (player.ddosActive) {
      const timeLeft = Math.ceil(player.ddosTime / 1000);
      const flashOpacity = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
      ctx.globalAlpha = flashOpacity;
      ctx.font = 'bold 48px Courier New';
      ctx.fillStyle = '#ff0000';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ DDOS ATTACK! ⚠️', canvas.width / 2, 150);
      ctx.font = 'bold 24px Courier New';
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText(`SYSTEM UNSTABLE (${timeLeft}s)`, canvas.width / 2, 180);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
    if (!player.grounded) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText('🚀 JUMPING', 20, 160);
    }
    if (isRainbow) {
      ctx.font = 'bold 20px Courier New';
      ctx.textAlign = 'center';
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#ff0000');
      gradient.addColorStop(0.16, '#ff7f00');
      gradient.addColorStop(0.33, '#ffff00');
      gradient.addColorStop(0.5, '#00ff00');
      gradient.addColorStop(0.66, '#0000ff');
      gradient.addColorStop(0.83, '#4b0082');
      gradient.addColorStop(1, '#9400d3');
      ctx.fillStyle = gradient;
      ctx.fillText('🌈 XANO RECOVERY NODE ACTIVATED! 🌈', canvas.width / 2, 50);
    }
  };

  const jump = useCallback(() => {
    const player = gameStateRef.current.player;
    if (player.grounded) {
      player.jumpSpeed = -13;
      player.grounded = false;
    } else if (player.doubleJump) {
      player.jumpSpeed = -10;
      player.doubleJump = false;
    }
  }, []);

  const togglePause = useCallback(() => {
    if (gameRunning) {
      if (!gamePaused) {
        setGamePaused(true);
        pauseStartTimeRef.current = Date.now();
      } else {
        setGamePaused(false);
        const pauseDuration = Date.now() - pauseStartTimeRef.current;
        totalPausedTimeRef.current += pauseDuration;
        const player = gameStateRef.current.player;
        if (player.invincible) player.invincibleStartTime += pauseDuration;
        if (player.rateLimiterActive) player.rateLimiterStartTime += pauseDuration;
        if (player.ddosActive) player.ddosStartTime += pauseDuration;
      }
    }
  }, [gameRunning, gamePaused]);

  const restartGame = useCallback(async () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setGameSpeed(BASE_GAME_SPEED);
    setScore(0);
    setComboCount(0);
    setComboMultiplier(1);
    setIsRainbowMode(false);
    setGamePaused(false);
    pauseStartTimeRef.current = 0;
    totalPausedTimeRef.current = 0;
    gameStateRef.current = {
      player: {
        x: 100, y: 0, width: 50, height: 50, jumpHeight: 0, jumpSpeed: 0,
        grounded: true, doubleJump: false, invincible: false,
        invincibleStartTime: 0, invincibleDuration: 0,
        rateLimiterActive: false, rateLimiterStartTime: 0, rateLimiterDuration: 0,
        ddosActive: false, ddosTime: 0, ddosStartTime: 0, ddosDirection: 1,
      },
      obstacles: [], powerUps: [], lastObstacleX: -200,
      lastObstacleTime: 0, lastSpeedIncrease: 0, currentGameId: null, konamiCode: [],
    };
    if (authToken) {
      const gameId = await createGameSession();
      gameStateRef.current.currentGameId = gameId;
    }
    setGameRunning(true);
  }, [authToken, apiBase]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const tagName = target && target.tagName ? target.tagName.toUpperCase() : '';
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || (target && target.isContentEditable)) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        restartGame();
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
        return;
      }
      if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && gameRunning && !gamePaused) {
        e.preventDefault();
        jump();
      }
      gameStateRef.current.konamiCode.push(e.keyCode);
      if (gameStateRef.current.konamiCode.length > konamiSequence.length) {
        gameStateRef.current.konamiCode.shift();
      }
      if (
        gameStateRef.current.konamiCode.length === konamiSequence.length &&
        gameStateRef.current.konamiCode.every((code, index) => code === konamiSequence[index])
      ) {
        setIsRainbowMode((prev) => !prev);
        gameStateRef.current.konamiCode = [];
        if (!isRainbowMode) {
          gameStateRef.current.player.invincible = true;
          gameStateRef.current.player.invincibleStartTime = Date.now();
          gameStateRef.current.player.invincibleDuration = 10000;
        }
      }
      if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && !gameRunning) {
        restartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameRunning, gamePaused, jump, togglePause, restartGame, isRainbowMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameRunning) return;
    const ctx = canvas.getContext('2d');
    let localScore = 0;
    let localSpeed = BASE_GAME_SPEED;
    let localCombo = 0;
    let localMultiplier = 1;

    const gameLoop = () => {
      if (!gameRunning) {
        animationFrameRef.current = null;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(ctx, canvas);

      if (!gamePaused) {
        const state = gameStateRef.current;
        const player = state.player;
        const now = Date.now();

        if (!player.grounded) {
          player.jumpSpeed += 0.4;
          player.jumpHeight -= player.jumpSpeed;
          if (player.jumpHeight <= 0) {
            player.jumpHeight = 0;
            player.jumpSpeed = 0;
            player.grounded = true;
          }
        }

        if (player.invincible) {
          const elapsed = now - player.invincibleStartTime;
          if (elapsed >= player.invincibleDuration) player.invincible = false;
        }

        if (player.rateLimiterActive) {
          const elapsed = now - player.rateLimiterStartTime;
          if (elapsed >= player.rateLimiterDuration) {
            player.rateLimiterActive = false;
            const targetSpeed = BASE_GAME_SPEED + Math.floor(localScore / 800) * 0.15;
            localSpeed = Math.min(targetSpeed, localSpeed + 1);
            setGameSpeed(localSpeed);
          }
        }

        if (player.ddosActive) {
          const ddosElapsed = now - player.ddosStartTime;
          const ddosDuration = 10000;
          if (Math.random() < 0.3) {
            player.ddosDirection = Math.random() > 0.5 ? 1 : -1;
            player.x += player.ddosDirection * (Math.random() * 8 + 2);
            if (player.x < 50) player.x = 50;
            if (player.x > canvas.width - 150) player.x = canvas.width - 150;
          }
          player.ddosTime = Math.max(0, ddosDuration - ddosElapsed);
          if (ddosElapsed >= ddosDuration) {
            player.ddosActive = false;
            player.x = 100;
          }
        }

        state.obstacles = state.obstacles.filter((obstacle) => {
          obstacle.x -= localSpeed;
          return obstacle.x + obstacle.width > 0;
        });

        state.lastObstacleX -= localSpeed;

        let spawnRate = 0.003;
        if (localScore > 10000) {
          const multiplier = 1 + (Math.floor((localScore - 10000) / 10000) + 1) * 0.15;
          spawnRate = 0.003 * multiplier;
        }

        if (Math.random() < spawnRate && canvas.width - state.lastObstacleX >= 300) {
          const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          state.obstacles.push({
            x: canvas.width, y: canvas.height - type.height - 30,
            width: type.width, height: type.height,
            emoji: type.emoji, text: type.text, color: type.color,
            humor: type.humor, passed: false,
          });
          state.lastObstacleX = canvas.width;
        }

        state.powerUps = state.powerUps.filter((powerUp) => {
          powerUp.x -= localSpeed;
          return powerUp.x + 40 > 0;
        });

        if (Math.random() < 0.001) {
          const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
          state.powerUps.push({
            x: canvas.width, y: canvas.height - 150,
            emoji: type.emoji, text: type.text, color: type.color, effect: type.effect,
          });
        }

        const playerY = canvas.height - 80 - player.jumpHeight;
        
        state.obstacles.forEach((obstacle) => {
          if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            playerY < obstacle.y + obstacle.height &&
            playerY + player.height > obstacle.y
          ) {
            if (!player.invincible) {
              setGameRunning(false);
              const isNewHighScore = localScore > highScore;
              if (isNewHighScore) {
                localStorage.setItem('xanoHighScore', localScore);
              }
              if (authToken && state.currentGameId) {
                submitScore(localScore, state.currentGameId);
              }
              onGameOver({ score: localScore, isNewHighScore, deathMessage: obstacle.humor || "Your backend just crashed!" });
            }
          } else if (obstacle.x + obstacle.width < player.x && !obstacle.passed) {
            obstacle.passed = true;
            localCombo++;
            localMultiplier = 1 + localCombo * 0.1;
            setComboCount(localCombo);
            setComboMultiplier(localMultiplier);
            state.lastObstacleTime = now;
          }
        });

        state.powerUps = state.powerUps.filter((powerUp) => {
          if (
            player.x < powerUp.x + 40 &&
            player.x + player.width > powerUp.x &&
            playerY < powerUp.y + 40 &&
            playerY + player.height > powerUp.y
          ) {
            switch (powerUp.effect) {
              case 'invincible':
                player.invincible = true;
                player.invincibleStartTime = now;
                player.invincibleDuration = 5000;
                break;
              case 'doubleJump':
                if (!player.doubleJump) player.doubleJump = true;
                break;
              case 'slowDown':
                if (!player.rateLimiterActive) {
                  const minSpeed = Math.max(1.0, BASE_GAME_SPEED - 1);
                  localSpeed = Math.max(minSpeed, localSpeed - 1);
                  setGameSpeed(localSpeed);
                  player.rateLimiterActive = true;
                  player.rateLimiterStartTime = now;
                  player.rateLimiterDuration = 3000;
                }
                break;
            }
            return false;
          }
          return true;
        });

        const basePoints = 1;
        localScore += Math.floor(basePoints * localMultiplier);
        setScore(localScore);

        if (localCombo > 0 && now - state.lastObstacleTime > 3000) {
          localCombo = 0;
          localMultiplier = 1;
          setComboCount(0);
          setComboMultiplier(1);
        }

        if (localScore > 0 && localScore % 800 === 0 && localScore !== state.lastSpeedIncrease) {
          const expectedSpeed = BASE_GAME_SPEED + Math.floor(localScore / 800) * 0.15;
          localSpeed = expectedSpeed;
          setGameSpeed(localSpeed);
          state.lastSpeedIncrease = localScore;
        }

        if (localScore === 10000 && !player.ddosActive) {
          player.ddosActive = true;
          player.ddosStartTime = now;
          player.ddosTime = 10000;
        }
      }

      gameStateRef.current.obstacles.forEach((obstacle) => drawObstacle(ctx, obstacle));
      gameStateRef.current.powerUps.forEach((powerUp) => drawPowerUp(ctx, powerUp));
      drawPlayer(ctx, gameStateRef.current.player, canvas, isRainbowMode);
      drawUI(ctx, canvas, localScore, localSpeed, localCombo, localMultiplier, gameStateRef.current.player, isRainbowMode);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameRunning, gamePaused, authToken, apiBase, highScore, isRainbowMode, onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameRunning) return;
    const ctx = canvas.getContext('2d');
    drawBackground(ctx, canvas);
    ctx.font = 'bold 32px Courier New';
    ctx.fillStyle = '#00f5ff';
    ctx.textAlign = 'center';
    ctx.fillText('CLICK TO START', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText('Survive the backend nightmare!', canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('(Space or Click to jump)', canvas.width / 2, canvas.height / 2 + 60);
  }, [gameRunning]);

  return { score, gameSpeed, comboCount, comboMultiplier, gameRunning, gamePaused, player: gameStateRef.current.player, isRainbowMode, restartGame, jump };
}



