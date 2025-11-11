import React, { useState } from 'react';

function SignupModal({ show, onClose, onSignup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onSignup(name, email, password);

    setLoading(false);

    if (result.success) {
      onClose();
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setError(result.error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show">
      <div className="modal-content">
        <h2>🚀 Join the Backend Warriors</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signupName">Username:</label>
            <input
              type="text"
              id="signupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupEmail">Email:</label>
            <input
              type="email"
              id="signupEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="signupPassword">Password:</label>
            <input
              type="password"
              id="signupPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-buttons">
            <button type="submit" className="modal-btn primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            <button type="button" className="modal-btn secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupModal;



