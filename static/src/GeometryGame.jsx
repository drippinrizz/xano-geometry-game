import { useEffect, useRef, useState } from 'react';
import './GeometryGame.css';

const XANO_AUTH_API = 'https://xxmf-qrth-inat.n7d.xano.io/api:S2PDGkeW';
const XANO_LEADERBOARD_API = 'https://xxmf-qrth-inat.n7d.xano.io/api:S2PDGkeW';

export default function GeometryGame() {
  
  const canvasRef = useRef(null);
  const landSoundRef = useRef(null);
  const jumpSoundRef = useRef(null);
  const doubleJumpSoundRef = useRef(null);
  const powerupSoundRef = useRef(null);
  const springSoundRef = useRef(null);
  const crashSoundRef = useRef(null);
  const shieldSoundRef = useRef(null);
  
  // Web Audio API for seamless music looping
  const audioContextRef = useRef(null);
  const tutorialBufferRef = useRef(null);
  const introBufferRef = useRef(null);
  const contentBufferRef = useRef(null);
  const foreachLoopBufferRef = useRef(null);
  const currentMusicSourceRef = useRef(null);
  const musicMetadataRef = useRef(null); // Store metadata separately from source
  const pausedMusicStateRef = useRef(null); // Store paused music state
  const introPlayCountRef = useRef(0);
  const pendingGameOverRef = useRef(null); // Track if game over should happen after music finishes
  
  const gameStateRef = useRef({
    gameRunning: false,
    gamePaused: false,
    score: 0,
    gameSpeed: 2.5,
    baseGameSpeed: 2.5,
    keysPressed: { a: false, d: false },
    comboCount: 0,
    comboMultiplier: 1,
    screenShake: 0,
    backgroundOffset: 0,
    colorPhase: 0,
    obstacles: [],
    powerUps: [],
    particles: [],
    jumpPads: [],
    obstacleSpawnTimer: 0,
    powerUpSpawnTimer: 0,
    jumpPadSpawnTimer: 0,
    lastObstacleTime: 0,
    lastSpeedIncrease: 0,
    lastJumpPadX: null,
    slowDownActive: false,
    tutorialMode: true,
    tutorialObstaclesCleared: 0,
    player: {
      x: 960,
      y: 0,
      width: 40,
      height: 40,
      jumpHeight: 0,
      jumpSpeed: 0,
      grounded: true,
      ducking: false,
      duckHeight: 20,
      doubleJump: false,
      invincible: false,
      invincibleStartTime: 0,
      invincibleDuration: 0,
      trail: [],
      rotation: 0
    }
  });

  const [authToken, setAuthToken] = useState(localStorage.getItem('xanoAuthToken'));
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('xanoHighScore') || '0'));
  const [showGameOver, setShowGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [deathMessage, setDeathMessage] = useState('');
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isRainbowMode, setIsRainbowMode] = useState(false);
  const [godMode, setGodMode] = useState(false);
  const [gameRunning, setGameRunning] = useState(false); // Track game state for re-renders
  const [showAirControlHint, setShowAirControlHint] = useState(false);
  const [loopMiniGame, setLoopMiniGame] = useState({
    active: false,
    presses: 0,
    targetPresses: 20,
    startTime: 0,
    duration: 5000, // 5 seconds
    wasTutorial: false
  });
  const [, setTimerTick] = useState(0); // Force re-renders for timer updates
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Mobile menu toggle
  const [displayScore, setDisplayScore] = useState(0); // Mobile score display
  const [musicMuted, setMusicMuted] = useState(false); // Music mute toggle

  // Clear, categorized obstacles with icons and tooltips
  const obstacleTypes = [
    // Fatal Errors (Red)
    { icon: '⛔', text: '502', fullName: 'Bad Gateway', description: 'Server communication failed', color: '#ff4444', textColor: '#ffffff', category: 'fatal', width: 40, height: 35 },
    { icon: '🔥', text: 'OOM', fullName: 'Out of Memory', description: 'Not enough RAM to continue', color: '#ff1744', textColor: '#ffffff', category: 'fatal', width: 40, height: 35 },
    
    // Security Issues (Orange)
    { icon: '🚫', text: 'CORS', fullName: 'CORS Error', description: 'Cross-origin request blocked', color: '#ff6f00', textColor: '#ffffff', category: 'security', width: 40, height: 35 },
    { icon: '🔒', text: 'RATE', fullName: 'Rate Limited', description: 'Too many requests per second', color: '#ff9100', textColor: '#000000', category: 'security', width: 40, height: 35 },
    
    // Performance (Yellow)
    { icon: '🐌', text: 'SLOW', fullName: 'Slow Query', description: 'Database query taking forever', color: '#ffd600', textColor: '#000000', category: 'performance', width: 40, height: 30 },
    { icon: '⚡', text: 'CACHE', fullName: 'Cache Miss', description: 'Data not found in cache', color: '#ffea00', textColor: '#000000', category: 'performance', width: 40, height: 30 },
    
    // Database (Cyan/Green)
    { icon: '🗡️', text: 'SQL', fullName: 'SQL Injection', description: 'Malicious database query detected', color: '#00e676', textColor: '#000000', category: 'database', width: 40, height: 30 },
    { icon: '💾', text: 'LOCK', fullName: 'DB Locked', description: 'Database transaction locked', color: '#00bfa5', textColor: '#ffffff', category: 'database', width: 40, height: 30 },
    
    // Logic Errors (Purple)
    { icon: '🕳️', text: 'NULL', fullName: 'Null Pointer', description: 'Accessing undefined memory', color: '#b39ddb', textColor: '#000000', category: 'logic', width: 40, height: 30 },
    { icon: '♾️', text: 'LOOP', fullName: 'Infinite Loop', description: 'Code stuck in while(true)', color: '#9575cd', textColor: '#ffffff', category: 'logic', width: 40, height: 30 }
  ];

  const powerUpTypes = [
    { text: 'SHIELD', fullName: 'Invincible', color: '#00cec9', textColor: '#000000', effect: 'invincible', glow: '#00ffff', width: 50, height: 50 },
    { text: '2X', fullName: 'Double Jump', color: '#6c5ce7', textColor: '#ffffff', effect: 'doubleJump', glow: '#8b00ff', width: 50, height: 50 },
    { text: 'SLOW', fullName: 'Slow Motion', color: '#a29bfe', textColor: '#000000', effect: 'slowDown', glow: '#ff00ff', width: 50, height: 50 },
  ];

  // Initialize sounds
  useEffect(() => {
    // Prevent re-initialization on remounts (React Strict Mode)
    if (landSoundRef.current) {
      return;
    }
    
    
    landSoundRef.current = new Audio('/sounds/jump_wet.wav');
    landSoundRef.current.volume = 1.0;
    
    jumpSoundRef.current = new Audio('/sounds/prejump.wav');
    jumpSoundRef.current.volume = 1.0;
    
    doubleJumpSoundRef.current = new Audio('/sounds/doulbejump.wav');
    doubleJumpSoundRef.current.volume = 1.0;
    
    powerupSoundRef.current = new Audio('/sounds/powerup.wav');
    powerupSoundRef.current.volume = 0.77;
    
    springSoundRef.current = new Audio('/sounds/spring.wav');
    springSoundRef.current.volume = 0.77;
    
    crashSoundRef.current = new Audio('/sounds/crash.wav');
    crashSoundRef.current.volume = 0.77;
    
    shieldSoundRef.current = new Audio('/sounds/shield.wav');
    shieldSoundRef.current.volume = 0.77;
    
    // Initialize Web Audio API for SEAMLESS music looping (ONLY ONCE)
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    // Load all music buffers
    const loadAudioBuffer = async (url) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioContextRef.current.decodeAudioData(arrayBuffer);
    };
    
    Promise.all([
      loadAudioBuffer('/sounds/tutorial_sound.wav'),
      loadAudioBuffer('/sounds/start_two_measure_loop.wav'),
      loadAudioBuffer('/sounds/content_loop.wav'),
      loadAudioBuffer('/sounds/foreachloop.wav')
    ]).then(([tutorial, intro, content, foreachLoop]) => {
      tutorialBufferRef.current = tutorial;
      introBufferRef.current = intro;
      contentBufferRef.current = content;
      foreachLoopBufferRef.current = foreachLoop;
      
      
      if (foreachLoop.duration < 1) {
      }
    }).catch(() => {});
  }, []);

  // Initialize canvas - draw welcome screen when not playing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    state.player.y = canvas.height - 80;
    
    // Only draw initial screen if game is not running
    if (!gameRunning) {
      drawBackground(ctx, canvas, state);
      ctx.font = 'bold 48px Space Grotesk, sans-serif';
      ctx.fillStyle = '#00f5ff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f5ff';
      ctx.fillText('CLICK TO START', canvas.width/2, canvas.height/2);
      ctx.shadowBlur = 0;
      ctx.font = '20px DM Sans, sans-serif';
      ctx.fillStyle = '#4ecdc4';
      ctx.fillText('Space to jump, Down to duck', canvas.width/2, canvas.height/2 + 50);
    }
  }, [gameRunning]);
  
  // Load user separately without blocking canvas
  useEffect(() => {
    if (authToken) {
      getCurrentUser();
    }
  }, [authToken]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    let animationId;

    const gameLoop = () => {
      if (!gameRunning) return;

      // Check mini-game timeout
      checkLoopMiniGameTimeout();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Implosion animation when mini-game is active
      const miniGameActive = loopMiniGameRef.current.active;
      if (miniGameActive) {
        const elapsed = Date.now() - loopMiniGameRef.current.startTime;
        const progress = elapsed / loopMiniGameRef.current.duration;
        const implodeScale = 1 - (Math.sin(Date.now() * 0.01) * 0.03 * progress);
        const implodeRotation = Math.sin(Date.now() * 0.005) * 0.02 * progress;
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(implodeScale, implodeScale);
        ctx.rotate(implodeRotation);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      
      drawBackground(ctx, canvas, state);

      if (!state.gamePaused && !miniGameActive) {
        updatePlayer(state, canvas);
        updateObstacles(state, canvas);
        updateJumpPads(state);
        updatePowerUps(state);
        updateParticles(state);
        checkCollisions(state, canvas);

        state.score += Math.floor(3 * state.comboMultiplier); // More points to feel rewarding
        
        if (state.comboCount > 0 && Date.now() - state.lastObstacleTime > 3000) {
          state.comboCount = 0;
          state.comboMultiplier = 1;
        }
        
        // Only increase speed naturally if slow-down is NOT active
        if (!state.slowDownActive && state.score > 0 && state.score % 1500 === 0 && state.score !== state.lastSpeedIncrease) {
          state.gameSpeed = state.baseGameSpeed + Math.floor(state.score / 1500) * 0.15;
          state.lastSpeedIncrease = state.score;
        }
      }

      state.particles.forEach(p => drawParticle(ctx, p));
      state.obstacles.forEach(o => drawObstacle(ctx, o, canvas, state));
      state.jumpPads.forEach(j => drawJumpPad(ctx, j));
      state.powerUps.forEach(p => drawPowerUp(ctx, p));
      drawPlayer(ctx, state, canvas);
      drawUI(ctx, canvas, state, highScore, isRainbowMode);

      if (miniGameActive) {
        ctx.restore();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    if (gameRunning) {
      gameLoop();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameRunning, highScore, isRainbowMode]);

  // Drawing functions
  const drawBackground = (ctx, canvas, state) => {
    ctx.save();
    
    if (state.screenShake > 0) {
      ctx.translate(
        Math.random() * state.screenShake - state.screenShake / 2,
        Math.random() * state.screenShake - state.screenShake / 2
      );
      state.screenShake *= 0.85;
      if (state.screenShake < 0.1) state.screenShake = 0;
    }
    
    state.colorPhase += 0.001;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `hsl(${200 + Math.sin(state.colorPhase) * 20}, 50%, 15%)`);
    gradient.addColorStop(1, `hsl(${220 + Math.sin(state.colorPhase) * 20}, 50%, 12%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.backgroundOffset += state.gameSpeed * 0.5;
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = -(state.backgroundOffset % 50); x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    const groundGradient = ctx.createLinearGradient(0, canvas.height - 30, 0, canvas.height);
    groundGradient.addColorStop(0, '#222');
    groundGradient.addColorStop(1, '#111');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    ctx.restore();
  };

  const xLogoImageRef = useRef(null);
  
  // Load X logo SVG on component mount
  useEffect(() => {
    const img = new Image();
    img.src = '/x-logo.svg';
    img.onload = () => {
      xLogoImageRef.current = img;
    };
  }, []);

  const drawPlayer = (ctx, state, canvas) => {
    ctx.save();
    
    if (state.player.invincible) {
      ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
    } else {
      ctx.globalAlpha = 1;
    }
    
    const currentHeight = state.player.ducking && state.player.grounded ? state.player.duckHeight : state.player.height;
    const currentY = state.player.y - state.player.jumpHeight + (state.player.ducking && state.player.grounded ? state.player.height - state.player.duckHeight : 0);

    ctx.translate(state.player.x + state.player.width/2, currentY + currentHeight/2);
    if (!state.player.grounded) {
      state.player.rotation += 0.15;
    } else {
      state.player.rotation = 0;
    }
    ctx.rotate(state.player.rotation);
    
    // Draw X logo if loaded, otherwise fallback to path
    if (xLogoImageRef.current) {
      ctx.drawImage(xLogoImageRef.current, -state.player.width/2, -currentHeight/2, state.player.width, currentHeight);
    } else {
      // Fallback: Draw the X path
      const xPath = new Path2D('M23.4625 11.3105L35.1795 0.291809H24.8812L18.3135 6.46918L23.4238 11.2734L23.4625 11.3105ZM23.4238 12.7087L18.3135 17.5147L24.8812 23.6905H35.1795L23.4625 12.6719L23.4238 12.7087ZM10.2983 0.291809H0L12.4396 11.992L0 23.6906H10.2983L22.7407 11.992L10.2983 0.291809Z');
      ctx.save();
      ctx.scale(state.player.width / 36, currentHeight / 24);
      ctx.translate(-18, -12);
      ctx.fillStyle = '#007bff';
      ctx.fill(xPath);
      ctx.restore();
    }

    if (isRainbowMode) {
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `hsl(${(Date.now() * 0.2 + i * 72) % 360}, 100%, 50%)`;
        ctx.globalAlpha = 0.1 - i * 0.02;
        ctx.fillRect(-state.player.width/2 - i * 5, -currentHeight/2 - i * 2, state.player.width + i * 10, currentHeight + i * 4);
      }
    }

    ctx.restore();
  };

  const drawObstacle = (ctx, obstacle, canvas, state) => {
    ctx.save();
    
    // Draw colored block with subtle gradient
    const gradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
    gradient.addColorStop(0, obstacle.color);
    gradient.addColorStop(1, `${obstacle.color}dd`);
    ctx.fillStyle = gradient;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Icon (smaller)
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obstacle.icon, obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2 - 5);
    
    // Small text label below icon
    ctx.font = 'bold 8px Space Grotesk, sans-serif';
    ctx.fillStyle = obstacle.textColor;
    ctx.fillText(obstacle.text, obstacle.x + obstacle.width/2, obstacle.y + obstacle.height - 8);
    
    // TUTORIAL TOOLTIPS - Only show during tutorial mode for tutorial obstacles
    const showTooltip = obstacle.isTutorial && state.tutorialMode && obstacle.x < canvas.width && !obstacle.passed;
    
    if (showTooltip) {
      // Fade in when entering screen
      let alpha = 1;
      if (obstacle.x > canvas.width - 300) {
        const fadeProgress = 1 - ((obstacle.x - (canvas.width - 300)) / 300);
        alpha = Math.min(fadeProgress * 2, 1);
      }
      
      if (alpha > 0) {
        ctx.globalAlpha = alpha;
        
        // Tooltip position (DRAMATICALLY higher above obstacle)
        const tooltipX = obstacle.x + obstacle.width / 2;
        const tooltipY = obstacle.y - 180; // Much higher!
        
        // Long pointer line (exaggerated)
        ctx.strokeStyle = obstacle.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
        ctx.lineTo(tooltipX, tooltipY + 60);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Tooltip background
        const tooltipText = obstacle.fullName;
        const tooltipDesc = obstacle.description;
        ctx.font = 'bold 14px Space Grotesk, sans-serif';
        const textWidth = Math.max(ctx.measureText(tooltipText).width, ctx.measureText(tooltipDesc).width);
        const padding = 12;
        const tooltipWidth = textWidth + padding * 2;
        const tooltipHeight = 50;
        
        // Glowing background
        ctx.shadowBlur = 20;
        ctx.shadowColor = obstacle.color;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.beginPath();
        ctx.roundRect(tooltipX - tooltipWidth/2, tooltipY, tooltipWidth, tooltipHeight, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Border
        ctx.strokeStyle = obstacle.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Tooltip text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tooltipText, tooltipX, tooltipY + 18);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '11px DM Sans, sans-serif';
        ctx.fillText(tooltipDesc, tooltipX, tooltipY + 36);
        
        ctx.globalAlpha = 1;
      }
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawJumpPad = (ctx, pad) => {
    ctx.save();
    pad.bouncePhase = (pad.bouncePhase || 0) + 0.1;
    const bounceY = Math.sin(pad.bouncePhase) * 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd700';
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(pad.x, pad.y + bounceY, pad.width, pad.height);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↑', pad.x + pad.width/2, pad.y + bounceY + 20);
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawPowerUp = (ctx, powerUp) => {
    const float = Math.sin(Date.now() * 0.005 + powerUp.x * 0.01) * 8;
    ctx.save();
    
    // Glowing rounded square
    ctx.shadowBlur = 25;
    ctx.shadowColor = powerUp.glow;
    ctx.fillStyle = powerUp.color;
    ctx.beginPath();
    ctx.roundRect(powerUp.x, powerUp.y + float, powerUp.width, powerUp.height, 8);
    ctx.fill();
    
    // Clear text label
    ctx.shadowBlur = 0;
    ctx.font = 'bold 14px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = powerUp.textColor;
    ctx.fillText(powerUp.text, powerUp.x + powerUp.width/2, powerUp.y + float + powerUp.height/2);
    
    ctx.restore();
  };

  const drawParticle = (ctx, particle) => {
    ctx.save();
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.life;
    ctx.shadowBlur = 10;
    ctx.shadowColor = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawUI = (ctx, canvas, state, highScore, rainbowMode) => {
    ctx.font = 'bold 32px Space Grotesk, sans-serif';
    ctx.fillStyle = '#00f5ff';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f5ff';
    ctx.fillText(`${state.score.toLocaleString()}`, 20, 40);
    ctx.shadowBlur = 0;
    
    ctx.font = '18px DM Sans, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Best: ${highScore.toLocaleString()}`, 20, 65);

    if (state.comboCount > 0) {
      ctx.font = 'bold 24px Space Grotesk, sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffd700';
      ctx.fillText(`COMBO x${state.comboCount}`, 20, 100);
      ctx.shadowBlur = 0;
    }

    let yOffset = 130;
    const now = Date.now();
    
    if (state.player.invincible) {
      const elapsed = now - state.player.invincibleStartTime;
      const timeLeft = Math.max(0, Math.ceil((state.player.invincibleDuration - elapsed) / 1000));
      ctx.font = '18px DM Sans, sans-serif';
      ctx.fillStyle = '#00cec9';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00cec9';
      ctx.fillText(`🧠 INVINCIBLE (${timeLeft}s)`, 20, yOffset);
      ctx.shadowBlur = 0;
      yOffset += 25;
    }
    
    if (state.player.doubleJump) {
      ctx.font = '18px DM Sans, sans-serif';
      ctx.fillStyle = '#6c5ce7';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#6c5ce7';
      ctx.fillText('⚙️ DOUBLE JUMP', 20, yOffset);
      ctx.shadowBlur = 0;
    }
    
    if (state.gamePaused) {
      ctx.font = 'bold 56px Space Grotesk, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f5ff';
      ctx.fillText('⏸️ PAUSED', canvas.width/2, canvas.height/2);
      ctx.shadowBlur = 0;
    }

    if (rainbowMode) {
      ctx.font = 'bold 24px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff00ff';
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      for (let i = 0; i < 7; i++) {
        gradient.addColorStop(i / 6, `hsl(${i * 60}, 100%, 50%)`);
      }
      ctx.fillStyle = gradient;
      ctx.fillText('🌈 XANO RAINBOW MODE! 🌈', canvas.width/2, 50);
      ctx.shadowBlur = 0;
    }
  };

  // Update functions
  const updatePlayer = (state, canvas) => {
    const now = Date.now();
    
    if (!state.player.grounded) {
      state.player.jumpSpeed += 0.5;
      state.player.jumpHeight -= state.player.jumpSpeed;
      
      // Air control - A/D keys to move left/right
      const airControlSpeed = 5;
      if (state.keysPressed.a) {
        state.player.x -= airControlSpeed;
      }
      if (state.keysPressed.d) {
        state.player.x += airControlSpeed;
      }
      
      // Keep player within screen bounds
      if (state.player.x < 0) state.player.x = 0;
      if (state.player.x > canvas.width - state.player.width) {
        state.player.x = canvas.width - state.player.width;
      }
      
      if (state.player.jumpHeight <= 0) {
        state.player.jumpHeight = 0;
        state.player.jumpSpeed = 0;
        state.player.grounded = true;
        state.player.rotation = 0;
        createParticles(state, state.player.x + state.player.width/2, state.player.y, '#00f5ff', 8);
        
        // Play landing sound
        if (landSoundRef.current) {
          landSoundRef.current.currentTime = 0;
          landSoundRef.current.play().catch(() => {});
        }
      }
    }

    if (state.player.invincible) {
      const elapsed = now - state.player.invincibleStartTime;
      if (elapsed >= state.player.invincibleDuration) {
        state.player.invincible = false;
      }
    }
  };

  const updateObstacles = (state, canvas) => {
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.x -= state.gameSpeed;
      
      if (obstacle.rotationSpeed) {
        obstacle.rotation += obstacle.rotationSpeed;
      }
      
      if (obstacle.moveSpeed) {
        obstacle.moveOffset += obstacle.moveSpeed;
        obstacle.y = obstacle.baseY + Math.sin(obstacle.moveOffset * 0.05) * obstacle.moveRange;
      }
      
      return obstacle.x + obstacle.width > 0;
    });

    // Only spawn new obstacles after tutorial is complete
    if (!state.tutorialMode) {
      state.obstacleSpawnTimer += 1;
      let spawnInterval = Math.max(120, 200 - Math.floor(state.score / 5000) * 8);
      
      if (state.obstacleSpawnTimer >= spawnInterval) {
        createObstacleWave(state, canvas);
        state.obstacleSpawnTimer = 0;
      }
    }
  };

  const updateJumpPads = (state) => {
    state.jumpPads = state.jumpPads.filter(pad => {
      pad.x -= state.gameSpeed;
      return pad.x + pad.width > 0;
    });

    // Only spawn jump pads after tutorial
    if (!state.tutorialMode) {
      state.jumpPadSpawnTimer += 1;
      // Jump pads spawn every ~600-800 frames (10-13 seconds at 60fps) - more spaced out
      if (state.jumpPadSpawnTimer >= 600 && Math.random() < 0.4) {
        createJumpPad(state);
        // Mark that we just spawned a jump pad - guarantee obstacle after it
        state.lastJumpPadX = canvasRef.current.width;
        state.jumpPadSpawnTimer = 0;
      }
    }
  };

  const updatePowerUps = (state) => {
    state.powerUps = state.powerUps.filter(powerUp => {
      powerUp.x -= state.gameSpeed;
      return powerUp.x + 40 > 0;
    });

    // Only spawn power-ups after tutorial
    if (!state.tutorialMode) {
      state.powerUpSpawnTimer += 1;
      // Power-ups spawn every ~800-1000 frames (13-17 seconds at 60fps) - much rarer!
      // Random chance further reduced
      if (state.powerUpSpawnTimer >= 800 && Math.random() < 0.08) {
        createPowerUp(state);
        state.powerUpSpawnTimer = 0;
      }
    }
  };

  const updateParticles = (state) => {
    state.particles = state.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.15;
      particle.life -= 0.02;
      return particle.life > 0;
    });
  };

  const checkCollisions = (state, canvas) => {
    const currentHeight = state.player.ducking && state.player.grounded ? state.player.duckHeight : state.player.height;
    const currentY = state.player.y - state.player.jumpHeight + (state.player.ducking && state.player.grounded ? state.player.height - state.player.duckHeight : 0);

    state.obstacles.forEach((obstacle) => {
      const hitboxMargin = 8; // More forgiving hitboxes
      let collided = false;
      
      // Simple box collision (no shape checks since we simplified obstacles)
      if (state.player.x + hitboxMargin < obstacle.x + obstacle.width - hitboxMargin &&
          state.player.x + state.player.width - hitboxMargin > obstacle.x + hitboxMargin &&
          currentY + hitboxMargin < obstacle.y + obstacle.height - hitboxMargin &&
          currentY + currentHeight - hitboxMargin > obstacle.y + hitboxMargin) {
        collided = true;
      }
      
      if (collided && !state.player.invincible) {
        
        // Special handling for LOOP obstacle - trigger mini-game
        if (obstacle.text === 'LOOP') {
          
        // If this was a tutorial obstacle, mark as cleared
        if (obstacle.isTutorial && state.tutorialMode) {
          state.tutorialObstaclesCleared++;
          // Force complete tutorial when hitting LOOP
          state.tutorialMode = false;
          
          // Force immediate obstacle spawn after tutorial
          state.obstacleSpawnTimer = 999;
          
          // DON'T start intro music yet - it will start after the mini-game completes
        }
          
          startLoopMiniGame(state, obstacle.isTutorial);
          // Remove the loop obstacle
          state.obstacles = state.obstacles.filter(o => o !== obstacle);
          return;
        }
        
        // Skip game over if god mode is active
        if (!godMode) {
          createParticles(state, state.player.x + state.player.width/2, currentY + currentHeight/2, '#ff0000', 30);
          
          // Play crash sound
          if (crashSoundRef.current) {
            crashSoundRef.current.currentTime = 0;
            crashSoundRef.current.play().catch(() => {});
          }
          
          handleGameOver(state.score, obstacle.description || obstacle.humor || "Your backend just crashed!");
        }
      }
      
      // Mark obstacle as passed if it's moved offscreen OR safely cleared by player
      // Check if obstacle is past the screen center to account for air control
      if (!obstacle.passed && (obstacle.x + obstacle.width < 0 || 
          (obstacle.x + obstacle.width < canvas.width / 2 && 
           (state.player.x > obstacle.x + obstacle.width + 50 || obstacle.x < -100)))) {
        obstacle.passed = true;
        
        // Track tutorial progress
        if (obstacle.isTutorial && state.tutorialMode) {
          state.tutorialObstaclesCleared++;
          
          // End tutorial after clearing all obstacles
          if (state.tutorialObstaclesCleared >= obstacleTypes.length) {
            state.tutorialMode = false;
            
            // Show air control hint for a few seconds
            setShowAirControlHint(true);
            setTimeout(() => {
              setShowAirControlHint(false);
            }, 3000); // Fade after 3 seconds (before first obstacle)
            
            // Stop tutorial music and start intro
            introPlayCountRef.current = 0; // Reset counter
            playIntroMusic();
          }
        }
        
        state.comboCount++;
        state.comboMultiplier = 1 + (state.comboCount * 0.15);
        state.lastObstacleTime = Date.now();
        createParticles(state, obstacle.x, obstacle.y, obstacle.color, 10);
      }
    });

    state.jumpPads.forEach((pad) => {
      if (state.player.x < pad.x + pad.width &&
          state.player.x + state.player.width > pad.x &&
          currentY + currentHeight > pad.y &&
          state.player.grounded) {
        state.player.jumpSpeed = -18;
        state.player.grounded = false;
        createParticles(state, pad.x + pad.width/2, pad.y, '#ffd700', 25);
        state.screenShake = 8;
        
        // Play spring sound
        if (springSoundRef.current) {
          springSoundRef.current.currentTime = 0;
          springSoundRef.current.play().catch(() => {});
        }
      }
    });

    state.powerUps = state.powerUps.filter(powerUp => {
      if (state.player.x < powerUp.x + 40 &&
          state.player.x + state.player.width > powerUp.x &&
          currentY < powerUp.y + 40 &&
          currentY + currentHeight > powerUp.y) {
        activatePowerUp(state, powerUp.effect);
        createParticles(state, powerUp.x + 20, powerUp.y + 20, powerUp.color, 25);
        
        // Play powerup sound
        if (powerupSoundRef.current) {
          powerupSoundRef.current.currentTime = 0;
          powerupSoundRef.current.play().catch(() => {});
        }
        
        return false;
      }
      return true;
    });
  };

  // Helper functions
  const createObstacleWave = (state, canvas) => {
    const rand = Math.random();
    const difficultyMultiplier = Math.min(state.score / 10000, 1); // Caps at 10k score
    
    // Check if we recently spawned a jump pad - if so, ALWAYS spawn obstacle nearby
    const recentJumpPad = state.lastJumpPadX && canvas.width - state.lastJumpPadX < 400;
    
    if (recentJumpPad) {
      // Always spawn at least one obstacle after a jump pad (guaranteed geometry)
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      createObstacle(state, canvas, type, 0);
      state.lastJumpPadX = null; // Clear the flag
    } else {
      // Normal RNG-based spawning
      // Start with mostly single obstacles, gradually add doubles at higher scores
      if (rand < 0.7 || difficultyMultiplier < 0.3) {
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        createObstacle(state, canvas, type);
      } else if (rand < 0.92 || difficultyMultiplier < 0.6) {
        const type1 = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const type2 = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        createObstacle(state, canvas, type1, 0);
        createObstacle(state, canvas, type2, 280);
      } else if (difficultyMultiplier >= 0.8) {
        // Only triple obstacles at high scores
        const type1 = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const type2 = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const type3 = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        createObstacle(state, canvas, type1, 0);
        createObstacle(state, canvas, type2, 200);
        createObstacle(state, canvas, type3, 400);
      }
    }
  };

  const createObstacle = (state, canvas, type, xOffset = 0) => {
    // Simple ground obstacles only - classic endless runner style
    const y = canvas.height - type.height - 50; // 50px above ground
    
    state.obstacles.push({
      x: canvas.width + xOffset,
      y: y,
      ...type,
      passed: false
    });
  };

  const createJumpPad = (state) => {
    const canvas = canvasRef.current;
    state.jumpPads.push({
      x: canvas.width,
      y: canvas.height - 50,
      width: 40,
      height: 20,
      bouncePhase: 0
    });
  };

  const createPowerUp = (state) => {
    const canvas = canvasRef.current;
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const height = 100 + Math.random() * 100;
    
    state.powerUps.push({
      x: canvas.width,
      y: canvas.height - height,
      ...type
    });
  };

  const createParticles = (state, x, y, color, count = 15) => {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        size: Math.random() * 4 + 2,
        life: 1,
        color
      });
    }
  };

  const activatePowerUp = (state, effect) => {
    const now = Date.now();
    
    switch (effect) {
      case 'invincible':
        state.player.invincible = true;
        state.player.invincibleStartTime = now;
        state.player.invincibleDuration = 5000;
        
        // Play shield sound
        if (shieldSoundRef.current) {
          shieldSoundRef.current.currentTime = 0;
          shieldSoundRef.current.play().catch(() => {});
        }
        break;
      case 'doubleJump':
        state.player.doubleJump = true;
        break;
      case 'slowDown':
        // Only activate if not already active
        if (!state.slowDownActive) {
          state.slowDownActive = true;
          // Reduce speed and set it as the new baseline
          state.gameSpeed = Math.max(2.0, state.gameSpeed - 2.5);
          state.baseGameSpeed = Math.max(2.0, state.baseGameSpeed - 2.5);
          
          setTimeout(() => {
            state.slowDownActive = false;
          }, 3000);
        }
        break;
    }
  };

  // Game controls
  const jump = () => {
    const state = gameStateRef.current;
    if (state.player.grounded) {
      state.player.jumpSpeed = -14;
      state.player.grounded = false;
      createParticles(state, state.player.x + state.player.width/2, state.player.y, '#00f5ff', 12);
      
      // Play jump sound
      if (jumpSoundRef.current) {
        jumpSoundRef.current.currentTime = 0;
        jumpSoundRef.current.play().catch(() => {});
      }
    } else if (state.player.doubleJump) {
      state.player.jumpSpeed = -12;
      state.player.doubleJump = false;
      createParticles(state, state.player.x + state.player.width/2, state.player.y - state.player.jumpHeight, '#6c5ce7', 15);
      
      // Play double jump sound
      if (doubleJumpSoundRef.current) {
        doubleJumpSoundRef.current.currentTime = 0;
        doubleJumpSoundRef.current.play().catch(() => {});
      }
    }
  };

  const duck = (isDucking) => {
    const state = gameStateRef.current;
    if (state.player.grounded) {
      state.player.ducking = isDucking;
    }
  };

  const startLoopMiniGame = (state, wasTutorial = false) => {
    state.gamePaused = true; // Pause game but don't stop it
    state.gameRunning = true; // Keep game loop running
    
    // Pause current music and play foreach loop
    pauseMusic();
    playForeachLoopMusic(() => {
      
      // Check if game over is pending (user lost during the music)
      if (pendingGameOverRef.current) {
        const { score, message } = pendingGameOverRef.current;
        pendingGameOverRef.current = null;
        handleGameOver(score, message);
      } else {
        // If no game over pending, resume the music normally
        // (This handles timeout case where user didn't press space enough)
        if (wasTutorial) {
          introPlayCountRef.current = 0;
          playIntroMusic();
        } else {
          resumeMusic();
        }
      }
    });
    
    setLoopMiniGame({
      active: true,
      presses: 0,
      targetPresses: 20,
      startTime: Date.now(),
      duration: 5000,
      wasTutorial: wasTutorial  // Track if this was from tutorial
    });
  };

  const handleLoopMiniGamePress = () => {
    setLoopMiniGame(prev => {
      if (!prev.active) return prev;
      
      const newPresses = prev.presses + 1;
      
      // Check if completed
      if (newPresses >= prev.targetPresses) {
        const state = gameStateRef.current;
        
        // Clear any pending game over (user succeeded!)
        pendingGameOverRef.current = null;
        
        // Resume game properly
        state.gamePaused = false;
        state.gameRunning = true;
        state.player.invincible = true;
        state.player.invincibleStartTime = Date.now();
        state.player.invincibleDuration = 3000; // 3 seconds of invincibility as reward
        
        // Force obstacle spawn soon after mini-game
        if (state.obstacleSpawnTimer < 50) {
          state.obstacleSpawnTimer = 50; // Spawn in ~1 second
        }
        
        
        // If this was the tutorial LOOP, start intro music instead of resuming
        if (prev.wasTutorial) {
          introPlayCountRef.current = 0;
          playIntroMusic();
        } else {
          // Resume the music from where it was paused
          resumeMusic();
        }
        
        return {
          active: false,
          presses: 0,
          targetPresses: 20,
          startTime: 0,
          duration: 5000,
          wasTutorial: false
        };
      }
      
      return { ...prev, presses: newPresses };
    });
  };

  const loopMiniGameRef = useRef(loopMiniGame);
  
  useEffect(() => {
    loopMiniGameRef.current = loopMiniGame;
  }, [loopMiniGame]);

  // Force re-renders to update timer display every frame
  useEffect(() => {
    if (!loopMiniGame.active) return;
    
    let animationId;
    let counter = 0;
    const updateTimer = () => {
      // Force a re-render by incrementing the timer tick counter
      setTimerTick(counter++);
      animationId = requestAnimationFrame(updateTimer);
    };
    
    animationId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(animationId);
  }, [loopMiniGame.active]);

  // Update mobile score display frequently
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore(gameStateRef.current.score);
    }, 50); // Update every 50ms for smooth score updates
    
    return () => clearInterval(interval);
  }, []);
  
  const checkLoopMiniGameTimeout = () => {
    const current = loopMiniGameRef.current;
    if (!current.active) return;
    
    const elapsed = Date.now() - current.startTime;
    if (elapsed >= current.duration) {
      const state = gameStateRef.current;
      const wasTutorial = current.wasTutorial;
      
      setLoopMiniGame({
        active: false,
        presses: 0,
        targetPresses: 20,
        startTime: 0,
        duration: 5000,
        wasTutorial: false
      });
      
      if (!godMode) {
        // Instead of immediate game over, wait for foreach loop music to finish
        pausedMusicStateRef.current = null; // Clear paused state
        pendingGameOverRef.current = {
          score: state.score,
          message: "Stuck in an infinite loop!"
        };
      } else {
        // God mode - resume game and music
        state.gamePaused = false;
        
        // If this was the tutorial LOOP, start intro music instead of resuming
        if (wasTutorial) {
          introPlayCountRef.current = 0;
          playIntroMusic();
        } else {
          resumeMusic();
        }
      }
    }
  };

  const handleGameOver = (score, humor = "Your backend just crashed!") => {
    const state = gameStateRef.current;
    state.gameRunning = false;
    state.gamePaused = false;
    setGameRunning(false); // Stop the game loop
    
    // Clear any pending game over
    pendingGameOverRef.current = null;
    
    // Stop all music
    stopMusic();
    
    const newHighScore = score > highScore;
    if (newHighScore) {
      setHighScore(score);
      localStorage.setItem('xanoHighScore', score);
    }
    
    setFinalScore(score);
    setDeathMessage(humor);
    setIsNewHighScore(newHighScore);
    setShowGameOver(true);
    
    if (authToken && currentGameId) {
      submitScore(score, currentGameId);
    }
  };

  const shareScore = () => {
    const shareText = `i got ${finalScore.toLocaleString()} in xano dash, think you can beat me? ${window.location.href}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'XANO DASH',
        text: shareText
      }).catch(() => {
        // User cancelled or error occurred - fallback to copy
        copyScoreToClipboard(shareText);
      });
    } else {
      // Fallback to copy to clipboard
      copyScoreToClipboard(shareText);
    }
  };

  const copyScoreToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Score copied to clipboard! 📋');
    }).catch(() => {
      alert(`Your score: ${finalScore.toLocaleString()} points`);
    });
  };

  const startGame = () => {
    const state = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    
    
    // Clear any pending game over from previous game
    pendingGameOverRef.current = null;
    
    // Reset base game speed to initial value
    state.baseGameSpeed = 2.5;
    state.gameSpeed = state.baseGameSpeed;
    state.gameRunning = true;
    state.gamePaused = false;
    state.score = 0;
    state.obstacles = [];
    state.powerUps = [];
    state.particles = [];
    state.jumpPads = [];
    state.comboCount = 0;
    state.comboMultiplier = 1;
    state.screenShake = 0;
    state.obstacleSpawnTimer = 0;
    state.powerUpSpawnTimer = 0;
    state.jumpPadSpawnTimer = 0;
    state.backgroundOffset = 0;
    state.colorPhase = 0;
    state.lastObstacleTime = 0;
    state.lastSpeedIncrease = 0;
    state.tutorialMode = true;
    state.tutorialObstaclesCleared = 0;
    state.slowDownActive = false;
    state.lastJumpPadX = null;
    
    // Create tutorial obstacles - one of each type, spaced out
    obstacleTypes.forEach((type, index) => {
      state.obstacles.push({
        x: canvas.width + 200 + (index * 250), // Spaced 250px apart
        y: canvas.height - type.height - 50,
        ...type,
        passed: false,
        isTutorial: true
      });
    });
    
    state.player.x = 960;
    state.player.y = canvas.height - 80;
    state.player.jumpHeight = 0;
    state.player.jumpSpeed = 0;
    state.player.grounded = true;
    state.player.ducking = false;
    state.player.invincible = false;
    state.player.doubleJump = false;
    state.player.trail = [];
    state.player.rotation = 0;
    
    setShowGameOver(false);
    setIsRainbowMode(false);
    
    setGameRunning(true); // Start the game loop - MUST be last!
    
    if (authToken) {
      createGameSession();
    }
    
    // Start music sequence
    stopMusic();
    introPlayCountRef.current = 0; // Reset intro counter
    
    // Play tutorial music (intro will start when tutorial ends)
    if (tutorialBufferRef.current) {
      playTutorialMusic();
    } else {
    }
    
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // PRIORITY: Mini-game controls - check current state via ref
      if (loopMiniGameRef.current.active && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        handleLoopMiniGamePress();
        return;
      }
      
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        startGame();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        gameStateRef.current.gamePaused = !gameStateRef.current.gamePaused;
      } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault();
        duck(true);
      } else if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameStateRef.current.gameRunning) {
          jump();
        } else {
          startGame();
        }
      }
      
      // Air control - A and D keys
      if (e.key === 'a' || e.key === 'A') {
        gameStateRef.current.keysPressed.a = true;
      }
      if (e.key === 'd' || e.key === 'D') {
        gameStateRef.current.keysPressed.d = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault();
        duck(false);
      }
      
      // Release air control keys
      if (e.key === 'a' || e.key === 'A') {
        gameStateRef.current.keysPressed.a = false;
      }
      if (e.key === 'd' || e.key === 'D') {
        gameStateRef.current.keysPressed.d = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // No dependencies - use refs for current state

  // Auth functions
  const getCurrentUser = async () => {
    if (!authToken) return;
    try {
      const response = await fetch(`${XANO_AUTH_API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        setCurrentUser(await response.json());
      } else {
        logout();
      }
    } catch (error) {
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${XANO_AUTH_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setAuthToken(data.authToken);
        localStorage.setItem('xanoAuthToken', data.authToken);
        await getCurrentUser();
        return { success: true };
      }
      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch(`${XANO_AUTH_API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setAuthToken(data.authToken);
        localStorage.setItem('xanoAuthToken', data.authToken);
        await getCurrentUser();
        return { success: true };
      }
      return { success: false, error: data.message || 'Signup failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentGameId(null);
    localStorage.removeItem('xanoAuthToken');
  };

  const createGameSession = async () => {
    if (!authToken) return;
    try {
      const response = await fetch(`${XANO_LEADERBOARD_API}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentGameId(data.id);
      }
    } catch (error) {
    }
  };

  const submitScore = async (playerScore, gameId) => {
    if (!authToken || !gameId) return;
    try {
      await fetch(`${XANO_LEADERBOARD_API}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ score: playerScore, game_id: gameId })
      });
    } catch (error) {
    }
  };

  const getLeaderboard = async () => {
    try {
      const response = await fetch(`${XANO_LEADERBOARD_API}/leaderboards`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.items || []);
      }
    } catch (error) {
    }
  };

  // Web Audio API music playback functions
  const stopMusic = () => {
    if (currentMusicSourceRef.current) {
      try {
        // Clear the onended callback BEFORE stopping to prevent unwanted triggers
        currentMusicSourceRef.current.onended = null;
        currentMusicSourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      currentMusicSourceRef.current = null;
    }
    musicMetadataRef.current = null; // Always clear metadata
  };

  const playMusicBuffer = (buffer, loop = false, onEnded = null, offset = 0, volume = 0.45) => {
    stopMusic();
    
    // Resume audio context if suspended (browser requirement)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();
    
    source.buffer = buffer;
    source.loop = loop;
    gainNode.gain.value = volume;
    
    
    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    if (onEnded && !loop) {
      source.onended = onEnded;
    }
    
    source.start(0, offset);
    currentMusicSourceRef.current = source;
    
    // Store metadata separately (NOT on the source node)
    musicMetadataRef.current = {
      startTime: audioContextRef.current.currentTime - offset,
      buffer: buffer,
      isLooping: loop
    };
    
    
    return source;
  };

  const pauseMusic = () => {
    // Only save state if we have current music playing
    if (currentMusicSourceRef.current && musicMetadataRef.current) {
      const { startTime, buffer, isLooping } = musicMetadataRef.current;
      const elapsed = audioContextRef.current.currentTime - startTime;
      
      // For looping music, store position within the loop
      const offset = isLooping ? elapsed % buffer.duration : Math.min(elapsed, buffer.duration);
      
      pausedMusicStateRef.current = {
        buffer: buffer,
        offset: offset,
        loop: isLooping
      };
    }
    // Stop the current music
    stopMusic(); // This will clear onended callback before stopping
  };

  const resumeMusic = () => {
    if (pausedMusicStateRef.current) {
      const { buffer, offset, loop } = pausedMusicStateRef.current;
      
      // Pass the onended callback for intro music if needed
      const onEnded = (!loop && buffer === introBufferRef.current) ? () => {
        introPlayCountRef.current++;
        if (introPlayCountRef.current >= 2) {
          playContentMusic();
        } else {
          playMusicBuffer(introBufferRef.current, false, arguments.callee);
        }
      } : null;
      
      playMusicBuffer(buffer, loop, onEnded, offset);
      pausedMusicStateRef.current = null;
    }
  };

  const toggleMusic = () => {
    setMusicMuted(!musicMuted);
    if (musicMuted) {
      // Currently muted, so unmute
      resumeMusic();
    } else {
      // Currently playing, so mute
      pauseMusic();
    }
  };

  const playTutorialMusic = () => {
    playMusicBuffer(tutorialBufferRef.current, false, null, 0, 0.405); // 10% quieter than other music
  };

  const playIntroMusic = () => {
    playMusicBuffer(introBufferRef.current, false, () => {
      introPlayCountRef.current++;
      
      if (introPlayCountRef.current < 2) {
        // Play intro again
        playIntroMusic();
      } else {
        // Start content loop
        playContentMusic();
      }
    });
  };

  const playContentMusic = () => {
    playMusicBuffer(contentBufferRef.current, true); // TRUE seamless looping!
  };

  const playForeachLoopMusic = (onComplete) => {
    if (!foreachLoopBufferRef.current) {
      if (onComplete) onComplete();
      return;
    }
    
    if (!audioContextRef.current) {
      if (onComplete) onComplete();
      return;
    }
    
    playMusicBuffer(foreachLoopBufferRef.current, false, onComplete, 0, 0.45); // 45% volume
  };

  return (
    <div className="geometry-game">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-left">
          <button className="leaderboard-btn" onClick={() => { getLeaderboard(); setShowLeaderboardModal(true); }}>
            🏆 Leaderboard
          </button>
          <button 
            className="leaderboard-btn" 
            onClick={toggleMusic}
          >
            {musicMuted ? '🔇 Music Off' : '🎵 Music On'}
          </button>
        </div>
        <div className="nav-right">
          {currentUser ? (
            <div className="user-info">
              <span>👨‍💻 {currentUser.name}</span>
              <button className="auth-btn" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-section">
              <button className="auth-btn" onClick={() => setShowLoginModal(true)}>Login</button>
              <button className="auth-btn" onClick={() => setShowSignupModal(true)}>Sign Up</button>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Hamburger */}
        <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
          <button className="mobile-menu-item" onClick={() => { getLeaderboard(); setShowLeaderboardModal(true); setShowMobileMenu(false); }}>
            🏆 Leaderboard
          </button>
          <button className="mobile-menu-item" onClick={() => { toggleMusic(); setShowMobileMenu(false); }}>
            {musicMuted ? '🔇 Music Off' : '🎵 Music On'}
          </button>
          <hr className="menu-divider" />
          {currentUser ? (
            <>
              <div className="mobile-menu-user">👨‍💻 {currentUser.name}</div>
              <button className="mobile-menu-item" onClick={() => { logout(); setShowMobileMenu(false); }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="mobile-menu-item" onClick={() => { setShowLoginModal(true); setShowMobileMenu(false); }}>Login</button>
              <button className="mobile-menu-item" onClick={() => { setShowSignupModal(true); setShowMobileMenu(false); }}>Sign Up</button>
            </>
          )}
        </div>

      {/* Game Header */}
      <div className="game-header">
        <h1 className="game-title">XANO DASH</h1>
        <p className="game-subtitle">The Backend Survival Game</p>
        <p className="tagline">"Dodge backend errors, survive the chaos."</p>
      </div>

      {/* Canvas */}
      <div 
        className="canvas-container"
        onClick={(e) => {
          e.preventDefault();
          if (gameRunning) {
            jump();
          } else {
            startGame();
          }
        }}
      >
        <canvas 
          ref={canvasRef} 
          width="1920" 
          height="400"
          style={{ border: 'none', outline: 'none' }}
        />
        
        {/* Tutorial Air Control Hint */}
        {showAirControlHint && (
          <div className="air-control-hint">
            <div className="hint-title">✈️ AIR CONTROL</div>
            <div className="hint-keys">
              <div className="hint-key">
                <span className="key-label">A</span>
                <span className="key-arrow">←</span>
              </div>
              <div className="hint-key">
                <span className="key-label">D</span>
                <span className="key-arrow">→</span>
              </div>
            </div>
            <div className="hint-text">Move left/right while jumping!</div>
          </div>
        )}
      </div>

      {/* Mobile Score Display */}
      {gameRunning && (
        <div className="mobile-score-overlay">
          <div className="mobile-score-value">{displayScore.toLocaleString()}</div>
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <p>🎮 <strong>SPACE/CLICK</strong> to jump | <strong>P</strong> to pause | <strong>R</strong> to restart</p>
        <p>⚡ Dodge backend errors, build combos, survive!</p>
        <p>Click the canvas to start!</p>
      </div>

      {/* Loop Mini-Game Overlay */}
      {loopMiniGame.active && (
        <div className="loop-minigame-overlay">
          <div className="loop-minigame-content">
            <h1 className="loop-title">ESCAPE THE LOOP!</h1>
            <p className="loop-instruction">MASH SPACE BAR!</p>
            
            {/* Press Counter */}
            <div className="loop-progress">
              <div className="loop-counter">{loopMiniGame.targetPresses - loopMiniGame.presses}</div>
              <p className="loop-label">PRESSES REMAINING</p>
            </div>
            
            {/* Progress Bar */}
            <div className="loop-bar-container">
              <div 
                className="loop-bar-fill" 
                style={{ 
                  width: `${(loopMiniGame.presses / loopMiniGame.targetPresses) * 100}%` 
                }}
              />
            </div>
            
            {/* Countdown Timer */}
            <div className="loop-timer">
              <div className="loop-timer-bar-container">
                <div 
                  className="loop-timer-bar-fill" 
                  style={{ 
                    width: `${Math.max(0, 100 - ((Date.now() - loopMiniGame.startTime) / loopMiniGame.duration) * 100)}%` 
                  }}
                />
              </div>
              <p className="loop-timer-text">
                {Math.max(0, ((loopMiniGame.duration - (Date.now() - loopMiniGame.startTime)) / 1000).toFixed(1))}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <div className="game-over-modal">
          <h2>BACKEND CRASHED! 💥</h2>
          <p className={isNewHighScore ? 'new-high-score' : ''}>
            {isNewHighScore ? `🎉 NEW HIGH SCORE: ${finalScore.toLocaleString()}! 🎉` : `Score: ${finalScore.toLocaleString()}`}
          </p>
          <p className="death-humor">{deathMessage}</p>
          <p>Maybe use Xano next time? 😉</p>
          <div className="game-over-buttons">
            <button className="try-again-btn" onClick={startGame}>Try Again</button>
            <button className="share-btn" onClick={shareScore}>📤 Share Score</button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLogin={login}
        />
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <SignupModal 
          onClose={() => setShowSignupModal(false)}
          onSignup={signup}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal 
          onClose={() => setShowLeaderboardModal(false)}
          leaderboard={leaderboardData}
        />
      )}

      <div className="backend-joke">
        <p><strong>Backend Status:</strong> <span style={{color: '#ff6b6b'}}>❌ Not Found</span></p>
        <p>"This is what happens when your app goes offline… unless you're on Xano."</p>
        <p style={{fontSize: '0.7em', marginTop: '10px', color: '#666'}}>
          Geometry Dash style meets backend nightmares — powered by Xano's rock-solid infrastructure.
        </p>
      </div>
    </div>
  );
}

// Modal Components
function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onLogin(email, password);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>🔐 Login to Xano Dash</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-buttons">
            <button type="submit" className="modal-btn primary">Login</button>
            <button type="button" className="modal-btn secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SignupModal({ onClose, onSignup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSignup(name, email, password);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>🚀 Join the Backend Warriors</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-buttons">
            <button type="submit" className="modal-btn primary">Sign Up</button>
            <button type="button" className="modal-btn secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LeaderboardModal({ onClose, leaderboard }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>🏆 Backend Nightmare Survivors</h2>
        {leaderboard.length === 0 ? (
          <p style={{textAlign: 'center', color: '#ff6b6b'}}>No scores yet!</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                return (
                  <tr key={index}>
                    <td>{rankEmoji}</td>
                    <td>{entry.user ? entry.user.name : 'Anonymous'}</td>
                    <td>{entry.score.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="modal-buttons">
          <button className="modal-btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

