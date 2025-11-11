import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import AuthSection from './components/AuthSection';
import UserInfo from './components/UserInfo';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import LeaderboardModal from './components/LeaderboardModal';
import GameOverModal from './components/GameOverModal';
import { AuthProvider, useAuth } from './context/AuthContext';

const XANO_API_BASE = 'https://xxmf-qrth-inat.n7d.xano.io/api:S2PDGkeW';

function AppContent() {
  const { currentUser, authToken, login, signup, logout, getCurrentUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameOverData, setGameOverData] = useState({});

  useEffect(() => {
    if (authToken) {
      getCurrentUser();
    }
  }, [authToken]);

  const handleGameOver = (data) => {
    setGameOverData(data);
    setGameScore(data.score);
    setShowGameOver(true);
  };

  return (
    <>
      <AuthSection
        isAuthenticated={!!currentUser}
        onLoginClick={() => setShowLoginModal(true)}
        onSignupClick={() => setShowSignupModal(true)}
        onLeaderboardClick={() => setShowLeaderboardModal(true)}
      />

      {currentUser && (
        <UserInfo user={currentUser} onLogout={logout} />
      )}

      <div className="game-header">
        <h1 className="game-title">🦖→📡 XANO DASH</h1>
        <p className="game-subtitle">Offline Mode: Xano Edition</p>
        <p className="tagline">"The only time your backend fails… is when you're not using Xano."</p>
      </div>

      <GameCanvas
        authToken={authToken}
        onGameOver={handleGameOver}
        apiBase={XANO_API_BASE}
      />

      <div className="controls">
        <p>🎮 <strong>SPACE/CLICK</strong> to jump | <strong>P</strong> to pause | <strong>R</strong> to restart</p>
        <p>🏆 Build combos by dodging obstacles! | ↑↑↓↓←→←→BA for Easter egg</p>
        <p>Survive the backend nightmare! Click anywhere to start!</p>
      </div>

      <div className="backend-joke">
        <p><strong>Backend Status:</strong> <span style={{color: '#ff6b6b'}}>❌ Not Found</span></p>
        <p>"This is what happens when your app goes offline… unless you're on Xano."</p>
        <p style={{fontSize: '0.7em', marginTop: '10px', color: '#666'}}>
          Built using absolutely nothing you need to deploy with Xano — 
          but you can bundle this game and serve it during downtime.
        </p>
      </div>

      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={login}
      />

      <SignupModal
        show={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignup={signup}
      />

      <LeaderboardModal
        show={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        apiBase={XANO_API_BASE}
      />

      <GameOverModal
        show={showGameOver}
        onClose={() => setShowGameOver(false)}
        gameOverData={gameOverData}
        isAuthenticated={!!currentUser}
        onLoginClick={() => {
          setShowGameOver(false);
          setShowLoginModal(true);
        }}
        onSignupClick={() => {
          setShowGameOver(false);
          setShowSignupModal(true);
        }}
        onShowLeaderboard={() => {
          setShowGameOver(false);
          setShowLeaderboardModal(true);
        }}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider apiBase={XANO_API_BASE}>
      <AppContent />
    </AuthProvider>
  );
}

export default App;



