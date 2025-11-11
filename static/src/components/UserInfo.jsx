import React from 'react';

function UserInfo({ user, onLogout }) {
  return (
    <div className="user-info">
      <div>👨‍💻 {user?.name || 'Loading...'}</div>
      <button 
        className="auth-btn" 
        onClick={onLogout} 
        style={{ padding: '6px 12px', fontSize: '0.85em' }}
      >
        Logout
      </button>
    </div>
  );
}

export default UserInfo;

