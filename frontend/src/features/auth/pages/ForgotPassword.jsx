import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../../services/api';

const Spinner = () => (
  <svg className="fp-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword({ email });
      const token = res.data.resetToken || res.data.data?.resetToken;
      setResetToken(token);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .fp-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #0c0c0e; font-family: 'DM Sans', sans-serif; color: #e8e4dc; padding: 20px;
        }
        .fp-card {
          width: 100%; max-width: 420px; background: rgba(255,255,255,.02);
          border: 1px solid rgba(255,255,255,.07); border-radius: 16px; padding: 40px; text-align: center;
        }
        .fp-icon {
          width: 64px; height: 64px; background: rgba(180,145,90,.1); color: #b4915a;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin: 0 auto 24px;
        }
        .fp-icon-success {
          background: rgba(125,191,125,.1); color: #7dbf7d;
        }
        .fp-title {
          font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; color: #f0ebe0; margin-bottom: 12px;
        }
        .fp-subtitle { font-size: 14px; color: #888; margin-bottom: 32px; line-height: 1.5; }
        
        .fp-error {
          background: rgba(220,53,53,.08); border: 1px solid rgba(220,53,53,.25);
          border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #e07070; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        .fp-input {
          width: 100%; padding: 14px 16px; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.1); border-radius: 8px; font-size: 14px; color: #e8e4dc;
          font-family: 'DM Sans', sans-serif; transition: all .2s; outline: none; margin-bottom: 24px; box-sizing: border-box;
        }
        .fp-input:focus { border-color: #b4915a; background: rgba(180,145,90,.05); }

        .fp-btn {
          width: 100%; padding: 15px; border: none; border-radius: 8px;
          background: linear-gradient(135deg, #b4915a, #c8a86e); color: #0c0c0e;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: opacity .2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .fp-btn-outline {
          background: transparent; border: 1px solid rgba(255,255,255,.15); color: #e8e4dc; margin-top: 16px;
        }
        .fp-btn:hover:not(:disabled) { opacity: .9; }
        .fp-btn-outline:hover:not(:disabled) { background: rgba(255,255,255,.05); }
        .fp-btn:disabled { opacity: .5; cursor: not-allowed; }

        .fp-footer { margin-top: 32px; font-size: 13px; color: #666; }
        .fp-footer a { color: #b4915a; text-decoration: none; font-weight: 500; }
        .fp-footer a:hover { color: #d4b07a; text-decoration: underline; }

        .fp-spinner { animation: fp-spin .8s linear infinite; }
        @keyframes fp-spin { to { transform: rotate(360deg); } }

        .fp-test-box {
          background: rgba(200,168,110,.08); border: 1px solid rgba(200,168,110,.25); border-radius: 8px;
          padding: 16px; margin-bottom: 24px; text-align: left;
        }
        .fp-test-title { font-size: 12px; color: #c8a86e; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
        .fp-test-code { font-size: 12px; color: #e8e4dc; word-break: break-all; margin-bottom: 16px; display: block; font-family: monospace; }
        .fp-test-link { font-size: 13px; color: #b4915a; text-decoration: underline; }
      `}</style>
      <div className="fp-root">
        <div className="fp-card">
          {success ? (
            <>
              <div className="fp-icon fp-icon-success">✓</div>
              <h1 className="fp-title">Check Your Email</h1>
              <p className="fp-subtitle">
                We've sent password reset instructions to <strong style={{color:'#e8e4dc'}}>{email}</strong>
              </p>
              
              {resetToken && (
                <div className="fp-test-box">
                  <div className="fp-test-title">Test Mode - Copy this token:</div>
                  <code className="fp-test-code">{resetToken}</code>
                  <Link to={`/reset-password?token=${resetToken}`} className="fp-test-link">
                    Click here to reset password →
                  </Link>
                </div>
              )}

              <Link to="/login" style={{textDecoration:'none'}}>
                <button className="fp-btn fp-btn-outline">Back to Login</button>
              </Link>
            </>
          ) : (
            <>
              <div className="fp-icon">🔐</div>
              <h1 className="fp-title">Forgot Password?</h1>
              <p className="fp-subtitle">Enter your email and we'll send you reset instructions</p>

              {error && (
                <div className="fp-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  className="fp-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="fp-btn" disabled={loading}>
                  {loading ? <><Spinner /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>

              <div className="fp-footer">
                Remember your password? <Link to="/login">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
