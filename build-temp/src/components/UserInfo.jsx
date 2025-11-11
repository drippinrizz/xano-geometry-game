import React from 'react';

function UserInfo({ user, onLogout }) {
  return (
    <div className="user-info">
      <div>👨‍💻 {user?.name || 'Loading...'}</div>
      <div style={{ marginTop: '5px' }}>
        <button 
          className="auth-btn" 
          onClick={onLogout} 
          style={{ padding: '4px 8px', fontSize: '0.8em' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default UserInfo;



