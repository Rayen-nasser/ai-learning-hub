import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api';

const Spinner = () => (
  <svg className="rp-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .rp-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #0c0c0e; font-family: 'DM Sans', sans-serif; color: #e8e4dc; padding: 20px;
        }
        .rp-card {
          width: 100%; max-width: 420px; background: rgba(255,255,255,.02);
          border: 1px solid rgba(255,255,255,.07); border-radius: 16px; padding: 40px; text-align: center;
        }
        .rp-icon {
          width: 64px; height: 64px; background: rgba(180,145,90,.1); color: #b4915a;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin: 0 auto 24px;
        }
        .rp-icon-success { background: rgba(125,191,125,.1); color: #7dbf7d; }
        .rp-icon-error { background: rgba(220,53,53,.1); color: #e07070; }
        
        .rp-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; color: #f0ebe0; margin-bottom: 12px; }
        .rp-subtitle { font-size: 14px; color: #888; margin-bottom: 32px; line-height: 1.5; }
        
        .rp-error {
          background: rgba(220,53,53,.08); border: 1px solid rgba(220,53,53,.25);
          border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #e07070; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        .rp-input {
          width: 100%; padding: 14px 16px; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.1); border-radius: 8px; font-size: 14px; color: #e8e4dc;
          font-family: 'DM Sans', sans-serif; transition: all .2s; outline: none; margin-bottom: 20px; box-sizing: border-box;
        }
        .rp-input:focus { border-color: #b4915a; background: rgba(180,145,90,.05); }

        .rp-btn {
          width: 100%; padding: 15px; border: none; border-radius: 8px;
          background: linear-gradient(135deg, #b4915a, #c8a86e); color: #0c0c0e;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: opacity .2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .rp-btn-outline {
          background: transparent; border: 1px solid rgba(255,255,255,.15); color: #e8e4dc;
        }
        .rp-btn:hover:not(:disabled) { opacity: .9; }
        .rp-btn-outline:hover:not(:disabled) { background: rgba(255,255,255,.05); }
        .rp-btn:disabled { opacity: .5; cursor: not-allowed; }

        .rp-spinner { animation: rp-spin .8s linear infinite; }
        @keyframes rp-spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="rp-root">
        <div className="rp-card">
          {!token ? (
            <>
              <div className="rp-icon rp-icon-error">⚠</div>
              <h1 className="rp-title">Invalid Link</h1>
              <p className="rp-subtitle">This password reset link is invalid or has expired.</p>
              <Link to="/forgot-password" style={{textDecoration:'none'}}>
                <button className="rp-btn rp-btn-outline">Request New Link</button>
              </Link>
            </>
          ) : success ? (
            <>
              <div className="rp-icon rp-icon-success">✓</div>
              <h1 className="rp-title">Password Reset</h1>
              <p className="rp-subtitle">Your password has been reset successfully. Redirecting to login...</p>
              <Link to="/login" style={{textDecoration:'none'}}>
                <button className="rp-btn">Go to Login</button>
              </Link>
            </>
          ) : (
            <>
              <div className="rp-icon">🔐</div>
              <h1 className="rp-title">Reset Password</h1>
              <p className="rp-subtitle">Enter your new password below</p>

              {error && (
                <div className="rp-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  className="rp-input"
                  placeholder="New Password (min 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="rp-input"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit" className="rp-btn" disabled={loading}>
                  {loading ? <><Spinner /> Resetting...</> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
