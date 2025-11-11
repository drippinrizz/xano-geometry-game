query "start-game" verb=GET {
  input {
  }

  stack {
    util.template_engine {
      value = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xano Dash - Offline Mode Edition</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    font-family: 'Courier New', monospace;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    color: #fff;
                }
        
                .game-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
        
                .game-title {
                    font-size: 2.5em;
                    color: #00f5ff;
                    text-shadow: 0 0 10px #00f5ff;
                    margin: 0;
                }
        
                .game-subtitle {
                    font-size: 1.2em;
                    color: #ff6b6b;
                    margin: 5px 0;
                }
        
                .tagline {
                    font-size: 0.9em;
                    color: #4ecdc4;
                    font-style: italic;
                }
        
                canvas {
                    border: 2px solid #00f5ff;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
                    background: #0a0a0a;
                }
        
                .controls {
                    margin-top: 15px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #aaa;
                }
        
                .game-over {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.9);
                    padding: 30px;
                    border-radius: 15px;
                    border: 2px solid #ff6b6b;
                    text-align: center;
                    display: none;
                }
        
                .backend-joke {
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(255, 107, 107, 0.1);
                    border-radius: 8px;
                    font-size: 0.8em;
                    max-width: 600px;
                    text-align: center;
                }
        
                .auth-section {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 1000;
                }
        
                .auth-btn, .leaderboard-btn {
                    padding: 8px 16px;
                    background: rgba(0, 245, 255, 0.2);
                    border: 1px solid #00f5ff;
                    border-radius: 5px;
                    color: #00f5ff;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                    transition: all 0.3s ease;
                }
        
                .auth-btn:hover, .leaderboard-btn:hover {
                    background: rgba(0, 245, 255, 0.4);
                    box-shadow: 0 0 10px rgba(0, 245, 255, 0.3);
                }
        
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                }
        
                .modal-content {
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    padding: 30px;
                    border-radius: 15px;
                    border: 2px solid #00f5ff;
                    box-shadow: 0 0 30px rgba(0, 245, 255, 0.3);
                    min-width: 400px;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
        
                .modal h2 {
                    color: #00f5ff;
                    text-align: center;
                    margin-bottom: 20px;
                    text-shadow: 0 0 10px #00f5ff;
                }
        
                .form-group {
                    margin-bottom: 15px;
                }
        
                .form-group label {
                    display: block;
                    color: #4ecdc4;
                    margin-bottom: 5px;
                    font-size: 0.9em;
                }
        
                .form-group input {
                    width: 100%;
                    padding: 10px;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid #00f5ff;
                    border-radius: 5px;
                    color: #fff;
                    font-family: 'Courier New', monospace;
                }
        
                .form-group input:focus {
                    outline: none;
                    box-shadow: 0 0 10px rgba(0, 245, 255, 0.3);
                }
        
                .modal-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 20px;
                }
        
                .modal-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                    font-size: 1em;
                    transition: all 0.3s ease;
                }
        
                .modal-btn.primary {
                    background: #00f5ff;
                    color: #000;
                }
        
                .modal-btn.primary:hover {
                    background: #4ecdc4;
                    box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
                }
        
                .modal-btn.secondary {
                    background: transparent;
                    color: #ff6b6b;
                    border: 1px solid #ff6b6b;
                }
        
                .modal-btn.secondary:hover {
                    background: rgba(255, 107, 107, 0.2);
                }
        
                .user-info {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    color: #4ecdc4;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                    background: rgba(0, 0, 0, 0.5);
                    padding: 10px;
                    border-radius: 5px;
                    border: 1px solid #4ecdc4;
                }
        
                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
        
                .leaderboard-table th,
                .leaderboard-table td {
                    padding: 8px 12px;
                    text-align: left;
                    border-bottom: 1px solid rgba(0, 245, 255, 0.2);
                }
        
                .leaderboard-table th {
                    color: #00f5ff;
                    font-weight: bold;
                }
        
                .leaderboard-table td {
                    color: #fff;
                }
        
                .leaderboard-table tr:hover {
                    background: rgba(0, 245, 255, 0.1);
                }
        
                .error-message {
                    color: #ff6b6b;
                    font-size: 0.8em;
                    margin-top: 5px;
                    text-align: center;
                }
        
                .success-message {
                    color: #4ecdc4;
                    font-size: 0.8em;
                    margin-top: 5px;
                    text-align: center;
                }
        
                .rainbow {
                    background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
                    background-size: 400% 400%;
                    animation: rainbow 2s linear infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
        
                @keyframes rainbow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
        
                .loading-spinner {
                    border: 2px solid rgba(0, 245, 255, 0.2);
                    border-radius: 50%;
                    border-top: 2px solid #00f5ff;
                    width: 20px;
                    height: 20px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    margin-right: 10px;
                }
        
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
        
                .loading-text {
                    color: #4ecdc4;
                    font-size: 0.9em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 10px 0;
                }
        
                .death-animation {
                    animation: deathShake 0.5s ease-in-out;
                }
        
                @keyframes deathShake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
        
                .new-high-score {
                    color: #ffd700 !important;
                    text-shadow: 0 0 20px #ffd700;
                    animation: pulseGold 1s ease-in-out infinite;
                }
        
                @keyframes pulseGold {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
            </style>
        </head>
        <body>
            <!-- Authentication Section -->
            <div class="auth-section" id="authSection">
                <button class="auth-btn" onclick="showLoginModal()">Login</button>
                <button class="auth-btn" onclick="showSignupModal()">Sign Up</button>
            </div>
            <!-- Leaderboard Button (always visible) -->
            <div class="auth-section" id="leaderboardBtnContainer" style="top: 70px; right: 20px; position: fixed; z-index: 1000; display: flex;">
                <button class="leaderboard-btn" onclick="showLeaderboard()">🏆 Leaderboard</button>
            </div>
        
            <!-- User Info (shown when logged in) -->
            <div class="user-info" id="userInfo" style="display: none;">
                <div>👨‍💻 <span id="userName">Loading...</span></div>
                <div style="margin-top: 5px;">
                    <button class="auth-btn" onclick="logout()" style="padding: 4px 8px; font-size: 0.8em;">Logout</button>
                </div>
            </div>
        
            <div class="game-header">
                <h1 class="game-title">🦖→📡 XANO DASH</h1>
                <p class="game-subtitle">Offline Mode: Xano Edition</p>
                <p class="tagline">"The only time your backend fails… is when you're not using Xano."</p>
            </div>
        
            <canvas id="gameCanvas" width="1000" height="400"></canvas>
        
            <div class="controls">
                <p>🎮 <strong>SPACE/CLICK</strong> to jump | <strong>P</strong> to pause | <strong>R</strong> to restart</p>
                <p>🏆 Build combos by dodging obstacles! | ↑↑↓↓←→←→BA for Easter egg</p>
                <p>Survive the backend nightmare! Click anywhere to start!</p>
            </div>
        
            <div class="game-over" id="gameOver">
                <h2 style="color: #ff6b6b;">BACKEND CRASHED! 💥</h2>
                <p id="finalScore">Score: 0</p>
                <div id="scorePrompt" style="display: none; margin: 15px 0; padding: 15px; background: rgba(0, 245, 255, 0.1); border-radius: 8px; border: 1px solid #00f5ff;">
                    <p style="color: #00f5ff; margin: 0 0 10px 0;">🏆 Want to save this score to the leaderboard?</p>
                    <p style="color: #4ecdc4; font-size: 0.9em; margin: 0 0 15px 0;">Sign up now to compete with other backend survivors!</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="showSignupModal()" style="padding: 8px 16px; background: #00f5ff; color: #000; border: none; border-radius: 5px; cursor: pointer; font-family: 'Courier New', monospace;">Sign Up</button>
                        <button onclick="showLoginModal()" style="padding: 8px 16px; background: transparent; color: #4ecdc4; border: 1px solid #4ecdc4; border-radius: 5px; cursor: pointer; font-family: 'Courier New', monospace;">Login</button>
                    </div>
                </div>
                <p style="color: #4ecdc4;">Maybe use Xano next time? 😉</p>
                <button onclick="restartGame()" style="padding: 10px 20px; font-size: 1.1em; background: #00f5ff; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
            </div>
        
            <div class="backend-joke">
                <p><strong>Backend Status:</strong> <span style="color: #ff6b6b;">❌ Not Found</span></p>
                <p>"This is what happens when your app goes offline… unless you're on Xano."</p>
                <p style="font-size: 0.7em; margin-top: 10px; color: #666;">
                    Built using absolutely nothing you need to deploy with Xano — 
                    but you can bundle this game and serve it during downtime.
                </p>
            </div>
        
            <!-- Login Modal -->
            <div class="modal" id="loginModal">
                <div class="modal-content">
                    <h2>🔐 Login to Xano Dash</h2>
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email:</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password:</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <div id="loginError" class="error-message"></div>
                        <div class="modal-buttons">
                            <button type="submit" class="modal-btn primary">Login</button>
                            <button type="button" class="modal-btn secondary" onclick="closeModal('loginModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        
            <!-- Signup Modal -->
            <div class="modal" id="signupModal">
                <div class="modal-content">
                    <h2>🚀 Join the Backend Warriors</h2>
                    <form id="signupForm">
                        <div class="form-group">
                            <label for="signupName">Userame:</label>
                            <input type="text" id="signupName" required>
                        </div>
                        <div class="form-group">
                            <label for="signupEmail">Email:</label>
                            <input type="email" id="signupEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Password:</label>
                            <input type="password" id="signupPassword" required>
                        </div>
                        <div id="signupError" class="error-message"></div>
                        <div class="modal-buttons">
                            <button type="submit" class="modal-btn primary">Sign Up</button>
                            <button type="button" class="modal-btn secondary" onclick="closeModal('signupModal')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        
            <!-- Leaderboard Modal -->
            <div class="modal" id="leaderboardModal">
                <div class="modal-content">
                    <h2>🏆 Backend Nightmare Survivors</h2>
                    <div id="leaderboardContent">
                        <p style="text-align: center; color: #4ecdc4;">Loading leaderboard...</p>
                    </div>
                    <div class="modal-buttons">
                        <button type="button" class="modal-btn secondary" onclick="closeModal('leaderboardModal')">Close</button>
                    </div>
                </div>
            </div>
        
            <script>
                const canvas = document.getElementById('gameCanvas');
                const ctx = canvas.getContext('2d');
        
                // Xano API Configuration
                const XANO_AUTH_API = 'https://xxmf-qrth-inat.n7d.xano.io/api:S2PDGkeW';
                const XANO_LEADERBOARD_API = 'https://xxmf-qrth-inat.n7d.xano.io/api:S2PDGkeW';
                
                // Authentication state
                let currentUser = null;
                let authToken = localStorage.getItem('xanoAuthToken');
                let currentGameId = null;
                let lastScore = 0; // Store last score for potential submission after signup/login
        
                // Game state - FORCE RESET ON EVERY PAGE LOAD
                let gameRunning = false;
                let gamePaused = false;
                let pauseStartTime = 0;
                let totalPausedTime = 0;
                let score = 0;
                let highScore = localStorage.getItem('xanoHighScore') || 0;
                let gameSpeed = 2.0; // ALWAYS start at 2.0 - no exceptions!
                let baseGameSpeed = 2.0; // Store the original base speed
                let isRainbowMode = false;
                let konamiCode = [];
                const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
                let comboCount = 0;
                let comboMultiplier = 1;
                let lastObstacleTime = 0;
                let lastSpeedIncrease = 0; // Track last score when speed was increased
                let gameLoopId = null; // Track the animation frame ID
                
                // FORCE RESET - Ensure gameSpeed is ALWAYS 2.0 on page load/refresh
                const forceResetSpeed = () => {
                    gameSpeed = baseGameSpeed;
                    console.log('FORCE RESET - gameSpeed set to:', gameSpeed);
                };
                
                // Multiple event listeners to catch all page load scenarios
                window.addEventListener('load', forceResetSpeed);
                document.addEventListener('DOMContentLoaded', forceResetSpeed);
                
                // Emergency fallback - run immediately
                forceResetSpeed();
        
                // Player (Xano Stack Block)
                const player = {
                    x: 100,
                    y: canvas.height - 80,
                    width: 50,
                    height: 50,
                    jumpHeight: 0,
                    jumpSpeed: 0,
                    grounded: true,
                    doubleJump: false,
                    doubleJumpUsed: false,
                    invincible: false,
                    invincibleStartTime: 0,
                    invincibleDuration: 0,
                    rateLimiterActive: false,
                    rateLimiterStartTime: 0,
                    rateLimiterDuration: 0,
                    ddosActive: false,
                    ddosTime: 0,
                    ddosStartTime: 0,
                    ddosDirection: 1
                };
        
                // Game objects
                let obstacles = [];
                let powerUps = [];
                let particles = [];
                let lastObstacleX = -200; // Track last obstacle position for spacing
        
                // Obstacle types (Xano-themed backend nightmares!)
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
                    { emoji: '🔧', text: 'MAINT', color: '#00cec9', width: 40, height: 30, humor: "Scheduled downtime (unscheduled panic)" }
                ];
        
                // Power-up types
                const powerUpTypes = [
                    { emoji: '🧠', text: 'Function Stack', color: '#00cec9', effect: 'invincible' },
                    { emoji: '⚙️', text: 'Auto-Scale', color: '#6c5ce7', effect: 'doubleJump' },
                    { emoji: '🛡️', text: 'Rate Limiter', color: '#a29bfe', effect: 'slowDown' }
                ];
        
                function drawPlayer() {
                    ctx.save();
                    
                    if (player.invincible) {
                        ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
                    }
        
                    // Draw Xano stack block
                    const gradient = ctx.createLinearGradient(player.x, player.y, player.x + player.width, player.y + player.height);
                    gradient.addColorStop(0, '#00f5ff');
                    gradient.addColorStop(1, '#0091ff');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(player.x, player.y - player.jumpHeight, player.width, player.height);
                    
                    // Draw "XANO" text
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 12px Courier New';
                    ctx.textAlign = 'center';
                    ctx.fillText('XANO', player.x + player.width/2, player.y - player.jumpHeight + player.height/2 + 4);
        
                    if (isRainbowMode) {
                        // Rainbow trail effect
                        for (let i = 0; i < 10; i++) {
                            ctx.fillStyle = `hsl(${(Date.now() * 0.1 + i * 36) % 360}, 100%, 50%)`;
                            ctx.globalAlpha = 0.3 - i * 0.03;
                            ctx.fillRect(player.x - i * 5, player.y - player.jumpHeight, player.width, player.height);
                        }
                    }
        
                    ctx.restore();
                }
        
                function drawObstacle(obstacle) {
                    ctx.fillStyle = obstacle.color;
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    
                    // Draw emoji
                    ctx.font = '24px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(obstacle.emoji, obstacle.x + obstacle.width/2, obstacle.y + 30);
                    
                    // Draw text
                    ctx.font = 'bold 10px Courier New';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(obstacle.text, obstacle.x + obstacle.width/2, obstacle.y + obstacle.height - 5);
                }
        
                function drawPowerUp(powerUp) {
                    // Floating animation
                    const float = Math.sin(Date.now() * 0.005 + powerUp.x * 0.01) * 5;
                    
                    ctx.fillStyle = powerUp.color;
                    ctx.fillRect(powerUp.x, powerUp.y + float, 40, 40);
                    
                    // Draw emoji
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(powerUp.emoji, powerUp.x + 20, powerUp.y + float + 25);
                }
        
                function createObstacle() {
                    // Only create obstacle if there's enough space
                    if (canvas.width - lastObstacleX < 300) return; // Minimum 300px spacing
                    
                    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                    obstacles.push({
                        x: canvas.width,
                        y: canvas.height - type.height - 30,
                        width: type.width,
                        height: type.height,
                        emoji: type.emoji,
                        text: type.text,
                        color: type.color
                    });
                    lastObstacleX = canvas.width; // Update last obstacle position
                }
        
                function createPowerUp() {
                    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                    powerUps.push({
                        x: canvas.width,
                        y: canvas.height - 150,
                        emoji: type.emoji,
                        text: type.text,
                        color: type.color,
                        effect: type.effect
                    });
                }
        
                function updatePlayer() {
                    const now = Date.now();
                    
                    if (!player.grounded) {
                        player.jumpSpeed += 0.4; // Normal gravity that feels responsive
                        player.jumpHeight -= player.jumpSpeed;
                        
                        if (player.jumpHeight <= 0) {
                            player.jumpHeight = 0;
                            player.jumpSpeed = 0;
                            player.grounded = true;
                        }
                    }
        
                    // Check invincibility timer with real time
                    if (player.invincible) {
                        const elapsed = now - player.invincibleStartTime;
                        if (elapsed >= player.invincibleDuration) {
                            player.invincible = false;
                        }
                    }
        
                    // Check rate limiter timer with real time
                    if (player.rateLimiterActive) {
                        const elapsed = now - player.rateLimiterStartTime;
                        if (elapsed >= player.rateLimiterDuration) {
                            player.rateLimiterActive = false;
                            // SAFE speed restoration - never exceed reasonable bounds
                            const targetSpeed = baseGameSpeed + Math.floor(score / 800) * 0.15;
                            gameSpeed = Math.min(targetSpeed, gameSpeed + 1);
                            console.log('Rate limiter ended, speed restored to:', gameSpeed);
                        }
                    }
        
                    // DDOS attack chaos!
                    if (player.ddosActive) {
                        const ddosElapsed = Date.now() - player.ddosStartTime;
                        const ddosDuration = 10000; // 10 seconds in milliseconds
                        
                        // Erratic movement every few frames
                        if (Math.random() < 0.3) {
                            player.ddosDirection = Math.random() > 0.5 ? 1 : -1;
                            player.x += player.ddosDirection * (Math.random() * 8 + 2);
                            
                            // Keep player on screen
                            if (player.x < 50) player.x = 50;
                            if (player.x > canvas.width - 150) player.x = canvas.width - 150;
                        }
                        
                        // Update countdown based on real time
                        player.ddosTime = Math.max(0, ddosDuration - ddosElapsed);
                        
                        if (ddosElapsed >= ddosDuration) {
                            player.ddosActive = false;
                            player.x = 100; // Reset to normal position
                        }
                    }
                }
        
                function updateObstacles() {
                    obstacles = obstacles.filter(obstacle => {
                        obstacle.x -= gameSpeed;
                        return obstacle.x + obstacle.width > 0;
                    });
        
                    // Update lastObstacleX as obstacles move off screen
                    lastObstacleX -= gameSpeed;
        
                    // Spawn new obstacles (with proper spacing!)
                    let spawnRate = 0.003;
                    if (score > 10000) {
                        // Increase obstacle spawn rate by 15% for every 10k points after 10k
                        const multiplier = 1 + (Math.floor((score - 10000) / 10000) + 1) * 0.15;
                        spawnRate = 0.003 * multiplier;
                    }
                    if (Math.random() < spawnRate) {
                        createObstacle();
                    }
                }
        
                function updatePowerUps() {
                    powerUps = powerUps.filter(powerUp => {
                        powerUp.x -= gameSpeed;
                        return powerUp.x + 40 > 0;
                    });
        
                    // Spawn new power-ups (much rarer!)
                    if (Math.random() < 0.001) {
                        createPowerUp();
                    }
                }
        
                function checkCollisions() {
                    // Check obstacle collisions
                    obstacles.forEach((obstacle, index) => {
                        if (player.x < obstacle.x + obstacle.width &&
                            player.x + player.width > obstacle.x &&
                            player.y - player.jumpHeight < obstacle.y + obstacle.height &&
                            player.y - player.jumpHeight + player.height > obstacle.y) {
                            
                            if (!player.invincible) {
                                gameOver(obstacle.humor || "Your backend just crashed!");
                            }
                        } else if (obstacle.x + obstacle.width < player.x && !obstacle.passed) {
                            // Player successfully passed this obstacle
                            obstacle.passed = true;
                            comboCount++;
                            comboMultiplier = 1 + (comboCount * 0.1); // 10% bonus per combo
                            lastObstacleTime = Date.now();
                        }
                    });
        
                    // Check power-up collisions
                    powerUps = powerUps.filter(powerUp => {
                        if (player.x < powerUp.x + 40 &&
                            player.x + player.width > powerUp.x &&
                            player.y - player.jumpHeight < powerUp.y + 40 &&
                            player.y - player.jumpHeight + player.height > powerUp.y) {
                            
                            activatePowerUp(powerUp.effect);
                            return false; // Remove power-up
                        }
                        return true;
                    });
                }
        
                function activatePowerUp(effect) {
                    const now = Date.now();
                    
                    switch (effect) {
                        case 'invincible':
                            player.invincible = true;
                            player.invincibleStartTime = now;
                            player.invincibleDuration = 5000; // 5 seconds in milliseconds
                            break;
                        case 'doubleJump':
                            if (!player.doubleJump) { // Only give if not already have one
                                player.doubleJump = true;
                            }
                            break;
                        case 'slowDown':
                            if (!player.rateLimiterActive) { // Only activate if not already active
                                // SAFE speed reduction - never go below minimum
                                const minSpeed = Math.max(1.0, baseGameSpeed - 1);
                                gameSpeed = Math.max(minSpeed, gameSpeed - 1);
                                player.rateLimiterActive = true;
                                player.rateLimiterStartTime = now;
                                player.rateLimiterDuration = 3000; // 3 seconds in milliseconds
                                console.log('Rate limiter activated, speed reduced to:', gameSpeed);
                            }
                            break;
                    }
                }
        
                function jump() {
                    if (player.grounded) {
                        player.jumpSpeed = -13; // Slightly higher jump
                        player.grounded = false;
                    } else if (player.doubleJump) {
                        player.jumpSpeed = -10; // Higher double jump
                        player.doubleJump = false; // Remove the power-up once used
                    }
                }
        
                function gameOver(deathMessage = "Your backend just crashed!") {
                    gameRunning = false;
                    gamePaused = false;
                    
                    // Stop the game loop
                    if (gameLoopId) {
                        cancelAnimationFrame(gameLoopId);
                        gameLoopId = null;
                    }
                    
                    // Death animation
                    canvas.classList.add('death-animation');
                    setTimeout(() => canvas.classList.remove('death-animation'), 500);
                    
                    // Check for new high score
                    const isNewHighScore = score > highScore;
                    if (isNewHighScore) {
                        highScore = score;
                        localStorage.setItem('xanoHighScore', highScore);
                    }
                    
                    const finalScoreElement = document.getElementById('finalScore');
                    finalScoreElement.textContent = `Score: ${score.toLocaleString()}`;
                    
                    // Celebrate new high score
                    if (isNewHighScore && score > 0) {
                        finalScoreElement.classList.add('new-high-score');
                        finalScoreElement.textContent = `🎉 NEW HIGH SCORE: ${score.toLocaleString()}! 🎉`;
                    } else {
                        finalScoreElement.classList.remove('new-high-score');
                    }
                    
                    // Add the humor message
                    const gameOverDiv = document.getElementById('gameOver');
                    const existingHumor = gameOverDiv.querySelector('.death-humor');
                    if (existingHumor) {
                        existingHumor.textContent = deathMessage;
                    } else {
                        const humorP = document.createElement('p');
                        humorP.className = 'death-humor';
                        humorP.style.cssText = 'color: #ff6b6b; font-style: italic; margin: 10px 0; font-size: 0.9em;';
                        humorP.textContent = deathMessage;
                        gameOverDiv.insertBefore(humorP, document.getElementById('scorePrompt'));
                    }
                    gameOverDiv.style.display = 'block';
                    
                    // Store score for potential submission after signup/login
                    lastScore = score;
                    
                    // Show score prompt if not logged in and score is decent
                    const scorePrompt = document.getElementById('scorePrompt');
                    if (!authToken && score > 500) { // Show prompt for scores over 500
                        scorePrompt.style.display = 'block';
                    } else {
                        scorePrompt.style.display = 'none';
                    }
                    
                    // Submit score to leaderboard if logged in
                    if (authToken && currentGameId) {
                        submitScore(score, currentGameId);
                        
                        // Show leaderboard after a short delay to let score submit
                        setTimeout(() => {
                            showLeaderboard();
                        }, 1000);
                    }
                }
        
                function restartGame() {
                    console.log('restartGame() called - Current gameSpeed:', gameSpeed);
                    
                    // Stop any existing game loop first
                    if (gameLoopId) {
                        cancelAnimationFrame(gameLoopId);
                        gameLoopId = null;
                    }
                    
                    // ABSOLUTE RESET - NO MATTER WHAT
                    gameSpeed = baseGameSpeed; // FIRST THING - reset speed!
                    console.log('restartGame() - Speed FORCED to:', gameSpeed);
                    
                    gameRunning = true;
                    gamePaused = false;
                    pauseStartTime = 0;
                    totalPausedTime = 0;
                    score = 0; // Reset to normal starting score
                    obstacles = [];
                    powerUps = [];
                    lastObstacleX = -200; // Reset obstacle spacing tracker
                    comboCount = 0;
                    comboMultiplier = 1;
                    lastObstacleTime = 0;
                    lastSpeedIncrease = 0; // Reset speed increase tracking
                    player.x = 100;
                    player.y = canvas.height - 80;
                    player.jumpHeight = 0;
                    player.jumpSpeed = 0;
                    player.grounded = true;
                    player.invincible = false;
                    player.invincibleStartTime = 0;
                    player.invincibleDuration = 0;
                    player.doubleJump = false;
                    player.rateLimiterActive = false;
                    player.rateLimiterStartTime = 0;
                    player.rateLimiterDuration = 0;
                    player.ddosActive = false;
                    player.ddosTime = 0;
                    isRainbowMode = false;
                    document.getElementById('gameOver').style.display = 'none';
                    
                    // Create new game session if logged in
                    if (authToken) {
                        createGameSession();
                    }
                    
                    // Start a fresh game loop (only if one isn't already running)
                    if (!gameLoopId) {
                        console.log(`Starting new game - Initial speed: ${gameSpeed}`);
                        gameLoop();
                    } else {
                        console.warn('Game loop already running, not starting a new one');
                    }
                }
                
                function togglePause() {
                    if (gameRunning) {
                        if (!gamePaused) {
                            // Starting pause
                            gamePaused = true;
                            pauseStartTime = Date.now();
                        } else {
                            // Ending pause
                            gamePaused = false;
                            const pauseDuration = Date.now() - pauseStartTime;
                            totalPausedTime += pauseDuration;
                            
                            // Adjust power-up start times to account for pause
                            if (player.invincible) {
                                player.invincibleStartTime += pauseDuration;
                            }
                            if (player.rateLimiterActive) {
                                player.rateLimiterStartTime += pauseDuration;
                            }
                            if (player.ddosActive) {
                                player.ddosStartTime += pauseDuration;
                            }
                        }
                    }
                }
        
                function drawBackground() {
                    // Sky gradient
                    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    gradient.addColorStop(0, '#1a1a2e');
                    gradient.addColorStop(1, '#16213e');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
        
                    // Ground
                    ctx.fillStyle = '#333';
                    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        
                    // Moving grid lines
                    ctx.strokeStyle = 'rgba(0, 245, 255, 0.1)';
                    ctx.lineWidth = 1;
                    const gridOffset = (Date.now() * 0.05) % 50;
                    for (let x = -gridOffset; x < canvas.width; x += 50) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, canvas.height);
                        ctx.stroke();
                    }
                }
        
                function drawUI() {
                    // Score
                    ctx.font = 'bold 24px Courier New';
                    ctx.fillStyle = '#00f5ff';
                    ctx.textAlign = 'left';
                    ctx.fillText(`Score: ${score.toLocaleString()}`, 20, 40);
                    
                    // High Score
                    ctx.font = '16px Courier New';
                    ctx.fillStyle = '#ffd700';
                    ctx.fillText(`Best: ${parseInt(highScore).toLocaleString()}`, 20, 65);
        
                    // Speed indicator
                    ctx.fillStyle = '#4ecdc4';
                    ctx.fillText(`Speed: ${gameSpeed.toFixed(1)}x`, 20, 90);
                    
                    // Combo system
                    if (comboCount > 0) {
                        ctx.font = 'bold 20px Courier New';
                        ctx.fillStyle = comboCount > 10 ? '#ff6b6b' : comboCount > 5 ? '#ffd700' : '#4ecdc4';
                        ctx.fillText(`🔥 COMBO x${comboCount} (${comboMultiplier.toFixed(1)}x points)`, 20, 120);
                    }
        
                    // Power-up status (adjusted positions)
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
                    
                    // Pause indicator
                    if (gamePaused) {
                        ctx.font = 'bold 48px Courier New';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.textAlign = 'center';
                        ctx.fillText('⏸️ PAUSED', canvas.width/2, canvas.height/2);
                        ctx.font = '20px Courier New';
                        ctx.fillStyle = '#4ecdc4';
                        ctx.fillText('Press P to resume | R to restart', canvas.width/2, canvas.height/2 + 50);
                        ctx.textAlign = 'left'; // Reset alignment
                    }
                    
                    // DDOS attack warning!
                    if (player.ddosActive) {
                        const timeLeft = Math.ceil(player.ddosTime / 1000); // Convert milliseconds to seconds
                        const flashOpacity = Math.sin(Date.now() * 0.02) * 0.5 + 0.5; // Flashing effect
                        ctx.globalAlpha = flashOpacity;
                        ctx.font = 'bold 48px Courier New';
                        ctx.fillStyle = '#ff0000';
                        ctx.textAlign = 'center';
                        ctx.fillText('⚠️ DDOS ATTACK! ⚠️', canvas.width/2, 150);
                        ctx.font = 'bold 24px Courier New';
                        ctx.fillStyle = '#ff6b6b';
                        ctx.fillText(`SYSTEM UNSTABLE (${timeLeft}s)`, canvas.width/2, 180);
                        ctx.globalAlpha = 1; // Reset opacity
                        ctx.textAlign = 'left'; // Reset alignment
                    }
                    
                    // Jump indicator
                    if (!player.grounded) {
                        ctx.fillStyle = '#ffff00';
                        ctx.fillText('🚀 JUMPING', 20, 160);
                    }
        
                    if (isRainbowMode) {
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
                        ctx.fillText('🌈 XANO RECOVERY NODE ACTIVATED! 🌈', canvas.width/2, 50);
                    }
                }
        
                function gameLoop() {
                    if (!gameRunning) {
                        gameLoopId = null;
                        return;
                    }
        
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
        
                    // Draw background
                    drawBackground();
        
                    if (!gamePaused) {
                        // SAFETY CHECK - Ensure speed hasn't gone crazy
                        const expectedMaxSpeed = baseGameSpeed + Math.floor(score / 800) * 0.15 + 2; // +2 buffer
                        if (gameSpeed > expectedMaxSpeed) {
                            console.warn(`SPEED ANOMALY DETECTED! gameSpeed was ${gameSpeed}, expected max ${expectedMaxSpeed}, resetting...`);
                            gameSpeed = baseGameSpeed + Math.floor(score / 800) * 0.15;
                        }
                        
                        // Update game objects only when not paused
                        updatePlayer();
                        updateObstacles();
                        updatePowerUps();
                        checkCollisions();
        
                        // Update score with combo multiplier
                        const basePoints = 1;
                        score += Math.floor(basePoints * comboMultiplier);
                        
                        // Reset combo if too much time has passed without dodging obstacles
                        if (comboCount > 0 && Date.now() - lastObstacleTime > 3000) { // 3 seconds
                            comboCount = 0;
                            comboMultiplier = 1;
                        }
                        
                        // Only increase speed at specific score intervals, not every frame
                        if (score > 0 && score % 800 === 0 && score !== lastSpeedIncrease) {
                            // Calculate speed based on base speed + score-based increments
                            const expectedSpeed = baseGameSpeed + Math.floor(score / 800) * 0.15;
                            gameSpeed = expectedSpeed; // Set to calculated value, don't accumulate
                            lastSpeedIncrease = score; // Prevent multiple increments at the same score
                            console.log(`Speed set to ${gameSpeed.toFixed(2)} at score ${score} (base: ${baseGameSpeed})`);
                        }
        
                        // DDOS attack at 10,000 points!
                        if (score === 10000 && !player.ddosActive) {
                            player.ddosActive = true;
                            player.ddosStartTime = Date.now(); // Track actual start time
                            player.ddosTime = 600; // 10 seconds of pure chaos!
                        }
                    }
        
                    // Draw game objects
                    obstacles.forEach(drawObstacle);
                    powerUps.forEach(drawPowerUp);
                    drawPlayer();
        
                    // Draw UI (always visible, even when paused)
                    drawUI();
        
                    gameLoopId = requestAnimationFrame(gameLoop);
                }
        
                // Event listeners
                document.addEventListener('keydown', (e) => {
                    console.log('Key pressed:', e.code, e.key, e.keyCode); // Debug
                    
                    // Ignore game shortcuts while typing in form fields or editable elements
                    const target = e.target;
                    const tagName = target && target.tagName ? target.tagName.toUpperCase() : '';
                    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || (target && target.isContentEditable)) {
                        return;
                    }
                    
                    // Keyboard shortcuts
                    if (e.key === 'r' || e.key === 'R') {
                        e.preventDefault();
                        if (gameRunning || document.getElementById('gameOver').style.display === 'block') {
                            restartGame();
                        }
                        return;
                    }
                    
                    if (e.key === 'p' || e.key === 'P') {
                        e.preventDefault();
                        togglePause();
                        return;
                    }
                    
                    // Check for space with multiple methods
                    if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && gameRunning && !gamePaused) {
                        e.preventDefault();
                        jump();
                    }
        
                    // Konami code detection
                    konamiCode.push(e.keyCode);
                    if (konamiCode.length > konamiSequence.length) {
                        konamiCode.shift();
                    }
                    
                    if (konamiCode.length === konamiSequence.length &&
                        konamiCode.every((code, index) => code === konamiSequence[index])) {
                        isRainbowMode = !isRainbowMode;
                        konamiCode = [];
                        
                        if (isRainbowMode) {
                            player.invincible = true;
                            player.invincibleStartTime = Date.now();
                            player.invincibleDuration = 10000; // 10 seconds in milliseconds
                        }
                    }
        
                    // Start game - check multiple ways to detect space
                    if ((e.code === 'Space' || e.key === ' ' || e.keyCode === 32) && !gameRunning) {
                        console.log('Starting game!'); // Debug
                        restartGame();
                    }
                });
        
                // Click support for starting game
                canvas.addEventListener('click', (e) => {
                    if (gameRunning && !gamePaused) {
                        jump();
                    } else {
                        console.log('Starting game via click!'); // Debug
                        restartGame();
                    }
                });
        
                // Touch support for mobile
                canvas.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (gameRunning && !gamePaused) {
                        jump();
                    } else {
                        restartGame();
                    }
                });
                
                // ==================== AUTHENTICATION FUNCTIONS ====================
                
                async function login(email, password) {
                    try {
                        const response = await fetch(`${XANO_AUTH_API}/auth/login`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email, password })
                        });
                        
                        const data = await response.json();
                        if (response.ok) {
                            authToken = data.authToken;
                            localStorage.setItem('xanoAuthToken', authToken);
                            await getCurrentUser();
                            updateAuthUI();
                            return { success: true };
                        } else {
                            return { success: false, error: data.message || 'Login failed' };
                        }
                    } catch (error) {
                        return { success: false, error: 'Network error' };
                    }
                }
        
                async function signup(name, email, password) {
                    try {
                        const response = await fetch(`${XANO_AUTH_API}/auth/signup`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ name, email, password })
                        });
                        
                        const data = await response.json();
                        if (response.ok) {
                            authToken = data.authToken;
                            localStorage.setItem('xanoAuthToken', authToken);
                            await getCurrentUser();
                            updateAuthUI();
                            return { success: true };
                        } else {
                            return { success: false, error: data.message || 'Signup failed' };
                        }
                    } catch (error) {
                        return { success: false, error: 'Network error' };
                    }
                }
        
                async function getCurrentUser() {
                    if (!authToken) return;
                    
                    try {
                        const response = await fetch(`${XANO_AUTH_API}/auth/me`, {
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                            }
                        });
                        
                        if (response.ok) {
                            currentUser = await response.json();
                        } else {
                            logout();
                        }
                    } catch (error) {
                        console.error('Error getting user:', error);
                    }
                }
        
                function logout() {
                    authToken = null;
                    currentUser = null;
                    currentGameId = null;
                    localStorage.removeItem('xanoAuthToken');
                    updateAuthUI();
                }
        
                function updateAuthUI() {
                    const authSection = document.getElementById('authSection');
                    const userInfo = document.getElementById('userInfo');
                    const leaderboardBtnContainer = document.getElementById('leaderboardBtnContainer');
                    
                    if (currentUser) {
                        authSection.style.display = 'none';
                        userInfo.style.display = 'block';
                        document.getElementById('userName').textContent = currentUser.name;
                        leaderboardBtnContainer.style.top = '20px';
                        
                        // If user just logged in/signed up and we have a score to submit
                        if (lastScore > 0 && !gameRunning) {
                            submitScoreAfterAuth(lastScore);
                            lastScore = 0; // Reset so we don't submit again
                        }
                    } else {
                        authSection.style.display = 'flex';
                        userInfo.style.display = 'none';
                        leaderboardBtnContainer.style.top = '70px';
                    }
                }
        
                // ==================== LEADERBOARD FUNCTIONS ====================
        
                async function createGameSession() {
                    if (!authToken) return;
                    
                    try {
                        const response = await fetch(`${XANO_LEADERBOARD_API}/game`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            currentGameId = data.id;
                        } else {
                            console.error('Failed to create game session');
                        }
                    } catch (error) {
                        console.error('Error creating game session:', error);
                    }
                }
        
                async function submitScore(playerScore, gameId) {
                    if (!authToken || !gameId) return;
                    
                    try {
                        const response = await fetch(`${XANO_LEADERBOARD_API}/score`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`,
                            },
                            body: JSON.stringify({
                                score: playerScore,
                                game_id: gameId
                            })
                        });
                        
                        if (response.ok) {
                            console.log('Score submitted successfully!');
                        } else {
                            console.error('Failed to submit score');
                        }
                    } catch (error) {
                        console.error('Error submitting score:', error);
                    }
                }
        
                async function submitScoreAfterAuth(playerScore) {
                    // Create a new game session and submit the score
                    try {
                        const gameResponse = await fetch(`${XANO_LEADERBOARD_API}/game`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        
                        if (gameResponse.ok) {
                            const gameData = await gameResponse.json();
                            await submitScore(playerScore, gameData.id);
                            
                            // Show success message
                            alert(`🎉 Score ${playerScore.toLocaleString()} saved to leaderboard!`);
                            
                            // Hide the score prompt
                            document.getElementById('scorePrompt').style.display = 'none';
                        }
                    } catch (error) {
                        console.error('Error submitting score after auth:', error);
                    }
                }
        
                async function getLeaderboard() {
                    try {
                        const response = await fetch(`${XANO_LEADERBOARD_API}/leaderboards`);
                        
                        if (response.ok) {
                            const data = await response.json();
                            return data.items || [];
                        } else {
                            return [];
                        }
                    } catch (error) {
                        console.error('Error getting leaderboard:', error);
                        return [];
                    }
                }
        
                // ==================== MODAL FUNCTIONS ====================
        
                function showLoginModal() {
                    document.getElementById('loginModal').style.display = 'flex';
                }
        
                function showSignupModal() {
                    document.getElementById('signupModal').style.display = 'flex';
                }
        
                async function showLeaderboard() {
                    const modal = document.getElementById('leaderboardModal');
                    const content = document.getElementById('leaderboardContent');
                    
                    modal.style.display = 'flex';
                    content.innerHTML = '<div class="loading-text"><div class="loading-spinner"></div>Loading backend survivors...</div>';
                    
                    const leaderboard = await getLeaderboard();
                    
                    if (leaderboard.length === 0) {
                        content.innerHTML = '<p style="text-align: center; color: #ff6b6b;">No scores yet! Be the first to survive the backend nightmare!</p>';
                        return;
                    }
                    
                    let html = `
                        <table class="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Developer</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    
                    leaderboard.forEach((entry, index) => {
                        const rank = index + 1;
                        const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                        html += `
                            <tr>
                                <td>${rankEmoji}</td>
                                <td>${entry.user ? entry.user.name : 'Anonymous'}</td>
                                <td>${entry.score.toLocaleString()}</td>
                            </tr>
                        `;
                    });
                    
                    html += `
                            </tbody>
                        </table>
                    `;
                    
                    content.innerHTML = html;
                }
        
                function closeModal(modalId) {
                    document.getElementById(modalId).style.display = 'none';
                }
        
                // ==================== FORM HANDLERS ====================
        
                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;
                    const errorDiv = document.getElementById('loginError');
                    const submitButton = e.target.querySelector('button[type="submit"]');
                    
                    errorDiv.textContent = '';
                    
                    // Show loading state
                    const originalText = submitButton.textContent;
                    submitButton.innerHTML = '<div class="loading-spinner"></div>Logging in...';
                    submitButton.disabled = true;
                    
                    const result = await login(email, password);
                    
                    // Restore button state
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    
                    if (result.success) {
                        closeModal('loginModal');
                        document.getElementById('loginForm').reset();
                    } else {
                        errorDiv.textContent = result.error;
                    }
                });
        
                document.getElementById('signupForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('signupName').value;
                    const email = document.getElementById('signupEmail').value;
                    const password = document.getElementById('signupPassword').value;
                    const errorDiv = document.getElementById('signupError');
                    const submitButton = e.target.querySelector('button[type="submit"]');
                    
                    errorDiv.textContent = '';
                    
                    // Show loading state
                    const originalText = submitButton.textContent;
                    submitButton.innerHTML = '<div class="loading-spinner"></div>Creating account...';
                    submitButton.disabled = true;
                    
                    const result = await signup(name, email, password);
                    
                    // Restore button state
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    
                    if (result.success) {
                        closeModal('signupModal');
                        document.getElementById('signupForm').reset();
                    } else {
                        errorDiv.textContent = result.error;
                    }
                });
        
                // ==================== INITIALIZATION ====================
        
                // Check if user is already logged in
                if (authToken) {
                    getCurrentUser().then(() => {
                        updateAuthUI();
                    });
                }
        
                // Initialize game
                console.log('Game initializing...'); // Debug
                drawBackground();
                drawUI();
                ctx.font = 'bold 32px Courier New';
                ctx.fillStyle = '#00f5ff';
                ctx.textAlign = 'center';
                ctx.fillText('CLICK TO START', canvas.width/2, canvas.height/2);
                ctx.font = '16px Courier New';
                ctx.fillStyle = '#4ecdc4';
                ctx.fillText('Survive the backend nightmare!', canvas.width/2, canvas.height/2 + 40);
                ctx.fillText('(Space or Click to jump)', canvas.width/2, canvas.height/2 + 60);
                
                // FINAL SAFETY CHECK - Ensure speed is correct after all initialization
                if (gameSpeed !== baseGameSpeed) {
                    console.warn(`WARNING: gameSpeed was ${gameSpeed}, forcing to ${baseGameSpeed}`);
                    gameSpeed = baseGameSpeed;
                }
                
                // Game initialization complete
                console.log('Game initialized and ready to play! Final gameSpeed:', gameSpeed);
            </script>
        </body>
        </html>
        """
    } as $x1
  
    util.set_header {
      value = "content-type: text/html"
      duplicates = "replace"
    }
  }

  response = $x1
}