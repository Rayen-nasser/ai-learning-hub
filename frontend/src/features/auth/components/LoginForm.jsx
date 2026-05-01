import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

/* ─── tiny inline primitives (no external deps beyond react-router) ─── */
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const Spinner = () => (
  <svg className="lf-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const LoginForm = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [touched, setTouched]   = useState({});

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!email)                          errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email   = 'Enter a valid email';
    if (!password)                       errs.password  = 'Password is required';
    return errs;
  };

  const fieldErrors = validate();
  const isValid     = Object.keys(fieldErrors).length === 0;

  const blur = (field) => setTouched(t => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;

    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .lf-root {
          min-height: 100vh;
          display: flex;
          background: #0c0c0e;
          font-family: 'DM Sans', sans-serif;
          color: #e8e4dc;
        }

        /* ── Left panel ── */
        .lf-panel {
          display: none;
          width: 45%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #111114 0%, #1a1a22 100%);
        }
        @media(min-width:900px){ .lf-panel { display: flex; flex-direction: column; justify-content: flex-end; padding: 56px; } }

        .lf-panel-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 30% 20%, rgba(180,145,90,.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 70% 80%, rgba(120,100,200,.08) 0%, transparent 55%);
        }
        .lf-panel-lines {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            0deg, transparent, transparent 39px, rgba(255,255,255,.03) 40px
          );
        }
        .lf-panel-content { position: relative; z-index: 1; }
        .lf-panel-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
          color: #b4915a; margin-bottom: 20px;
        }
        .lf-panel-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 4vw, 52px); font-weight: 300; line-height: 1.1;
          color: #f0ebe0; margin-bottom: 24px;
        }
        .lf-panel-headline em { font-style: italic; color: #b4915a; }
        .lf-panel-body {
          font-size: 14px; line-height: 1.7; color: #888; max-width: 360px;
        }

        /* ── Right / form panel ── */
        .lf-form-wrapper {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px 24px;
        }
        .lf-card {
          width: 100%; max-width: 420px;
        }
        .lf-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 500; letter-spacing: .04em;
          color: #b4915a; margin-bottom: 48px;
        }
        .lf-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 400; color: #f0ebe0; margin-bottom: 6px;
        }
        .lf-subtitle { font-size: 14px; color: #666; margin-bottom: 36px; }

        /* ── Error banner ── */
        .lf-error {
          background: rgba(220,53,53,.08);
          border: 1px solid rgba(220,53,53,.25);
          border-radius: 8px; padding: 12px 16px;
          font-size: 13px; color: #e07070; margin-bottom: 24px;
          display: flex; align-items: center; gap: 10px;
        }

        /* ── Field ── */
        .lf-field { margin-bottom: 20px; }
        .lf-label {
          display: block; font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
          color: #888; margin-bottom: 8px; font-weight: 500;
        }
        .lf-input-wrap { position: relative; }
        .lf-input {
          width: 100%; padding: 14px 16px; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
          font-size: 14px; color: #e8e4dc; font-family: 'DM Sans', sans-serif;
          transition: border-color .2s, background .2s; outline: none; box-sizing: border-box;
        }
        .lf-input::placeholder { color: #444; }
        .lf-input:focus { border-color: #b4915a; background: rgba(180,145,90,.05); }
        .lf-input.err { border-color: rgba(220,53,53,.5); }
        .lf-input.has-icon { padding-right: 48px; }
        .lf-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #666; cursor: pointer; padding: 4px;
          display: flex; align-items: center; transition: color .15s;
        }
        .lf-eye:hover { color: #b4915a; }
        .lf-field-error { font-size: 12px; color: #e07070; margin-top: 5px; }

        /* ── Options row ── */
        .lf-options {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }
        .lf-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .lf-checkbox {
          width: 16px; height: 16px; accent-color: #b4915a; cursor: pointer;
        }
        .lf-remember-label { font-size: 13px; color: #666; }
        .lf-forgot { font-size: 13px; color: #b4915a; text-decoration: none; }
        .lf-forgot:hover { color: #d4b07a; text-decoration: underline; }

        /* ── Submit button ── */
        .lf-btn {
          width: 100%; padding: 15px; border: none; border-radius: 8px;
          background: linear-gradient(135deg, #b4915a, #c8a86e);
          color: #0c0c0e; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; letter-spacing: .06em;
          cursor: pointer; transition: opacity .2s, transform .1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lf-btn:hover:not(:disabled) { opacity: .9; }
        .lf-btn:active:not(:disabled) { transform: scale(.99); }
        .lf-btn:disabled { opacity: .5; cursor: not-allowed; }

        .lf-spinner { animation: lf-spin .8s linear infinite; }
        @keyframes lf-spin { to { transform: rotate(360deg); } }

        /* ── Divider ── */
        .lf-divider {
          display: flex; align-items: center; gap: 14px;
          margin: 28px 0; color: #333; font-size: 12px;
        }
        .lf-divider::before, .lf-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.07);
        }

        /* ── Footer link ── */
        .lf-footer { text-align: center; font-size: 13px; color: #555; margin-top: 8px; }
        .lf-footer a { color: #b4915a; text-decoration: none; font-weight: 500; }
        .lf-footer a:hover { color: #d4b07a; text-decoration: underline; }

        /* ── Redirect note (from protected route) ── */
        .lf-redirect-note {
          background: rgba(180,145,90,.1); border: 1px solid rgba(180,145,90,.25);
          border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #b4915a;
          margin-bottom: 24px;
        }
      `}</style>

      <div className="lf-root">
        {/* Left decorative panel */}
        <div className="lf-panel">
          <div className="lf-panel-bg" />
          <div className="lf-panel-lines" />
          <div className="lf-panel-content">
            <p className="lf-panel-label">Learning Platform</p>
            <h2 className="lf-panel-headline">
              Knowledge<br/>that <em>shapes</em><br/>futures.
            </h2>
            <p className="lf-panel-body">
              Access your courses, track your progress, and connect with expert trainers — all in one place.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="lf-form-wrapper">
          <div className="lf-card">
            <div className="lf-logo">Forma</div>
            <h1 className="lf-title">Welcome back</h1>
            <p className="lf-subtitle">Sign in to continue your journey</p>

            {from !== '/' && (
              <div className="lf-redirect-note">
                Please sign in to access that page.
              </div>
            )}

            {error && (
              <div className="lf-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="lf-field">
                <label className="lf-label">Email</label>
                <div className="lf-input-wrap">
                  <input
                    className={`lf-input${touched.email && fieldErrors.email ? ' err' : ''}`}
                    type="email" autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => blur('email')}
                  />
                </div>
                {touched.email && fieldErrors.email && (
                  <p className="lf-field-error">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="lf-field">
                <label className="lf-label">Password</label>
                <div className="lf-input-wrap">
                  <input
                    className={`lf-input has-icon${touched.password && fieldErrors.password ? ' err' : ''}`}
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => blur('password')}
                  />
                  <button type="button" className="lf-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="lf-field-error">{fieldErrors.password}</p>
                )}
              </div>

              {/* Options */}
              <div className="lf-options">
                <label className="lf-remember">
                  <input type="checkbox" className="lf-checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span className="lf-remember-label">Remember me</span>
                </label>
                <Link to="/forgot-password" className="lf-forgot">Forgot password?</Link>
              </div>

              <button type="submit" className="lf-btn" disabled={loading}>
                {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
              </button>
            </form>

            <div className="lf-divider">or</div>

            <p className="lf-footer">
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;