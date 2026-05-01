import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../../features/notifications/components/NotificationBell';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .hd-root {
          position: sticky; top: 0; z-index: 100;
          background: ${scrolled ? 'rgba(12,12,14,0.96)' : 'rgba(12,12,14,0.8)'};
          backdrop-filter: blur(20px);
          border-bottom: 1px solid ${scrolled ? 'rgba(255,255,255,0.07)' : 'transparent'};
          transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
          box-shadow: ${scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none'};
          font-family: 'DM Sans', sans-serif;
        }
        .hd-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 32px;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .hd-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 500; letter-spacing: 0.06em;
          color: #b4915a; text-decoration: none;
          display: flex; align-items: center; gap: 10px;
          transition: opacity 0.2s;
        }
        .hd-logo:hover { opacity: 0.85; }
        .hd-logo-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #b4915a;
          box-shadow: 0 0 8px rgba(180,145,90,0.6);
        }

        .hd-nav {
          display: flex; align-items: center; gap: 2px;
        }
        .hd-nav-link {
          padding: 6px 14px; border-radius: 7px;
          font-size: 13px; font-weight: 400; letter-spacing: 0.02em;
          color: #666; text-decoration: none;
          transition: color 0.2s, background 0.2s;
          position: relative;
        }
        .hd-nav-link:hover { color: #e8e4dc; background: rgba(255,255,255,0.04); }
        .hd-nav-link.active { color: #b4915a; }
        .hd-nav-link.active::after {
          content: '';
          position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
          width: 16px; height: 1px; background: #b4915a;
          border-radius: 1px;
        }

        .hd-right { display: flex; align-items: center; gap: 12px; }

        .hd-user-wrapper { position: relative; }
        .hd-user-chip {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
          padding: 5px 12px 5px 5px;
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          transition: border-color 0.2s, background 0.2s;
          cursor: pointer;
        }
        .hd-user-chip:hover { border-color: rgba(180,145,90,0.3); background: rgba(180,145,90,0.05); }
        .hd-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #b4915a, #8a6e40);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; color: #0c0c0e;
          flex-shrink: 0;
        }
        .hd-user-name { font-size: 13px; color: #aaa; }
        .hd-user-chevron { font-size: 10px; color: #555; margin-left: 2px; transition: transform 0.2s; }
        .hd-user-chevron.open { transform: rotate(180deg); }

        .hd-user-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #1a1a1e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          min-width: 220px;
          padding: 8px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.4);
          opacity: 0; visibility: hidden;
          transform: translateY(-8px);
          transition: all 0.2s ease;
          z-index: 150;
        }
        .hd-user-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }

        .hd-dropdown-header {
          padding: 12px 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 8px;
        }
        .hd-dropdown-name { font-size: 14px; font-weight: 500; color: #e8e4dc; margin-bottom: 2px; }
        .hd-dropdown-email { font-size: 12px; color: #555; }
        .hd-dropdown-role {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 6px;
        }
        .hd-dropdown-role.admin { background: rgba(224,112,112,0.15); color: #e07070; }
        .hd-dropdown-role.respCF { background: rgba(125,191,125,0.15); color: #7dbf7d; }
        .hd-dropdown-role.formateur { background: rgba(200,168,110,0.15); color: #c8a86e; }
        .hd-dropdown-role.apprenant { background: rgba(106,159,216,0.15); color: #6a9fd8; }

        .hd-dropdown-section { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; padding: 8px 12px 4px; }
        .hd-dropdown-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          font-size: 13px; color: #888; text-decoration: none;
          transition: all 0.15s;
        }
        .hd-dropdown-link:hover { background: rgba(255,255,255,0.05); color: #e8e4dc; }
        .hd-dropdown-link svg { width: 16px; height: 16px; opacity: 0.7; }
        .hd-dropdown-link.admin-link { color: #e07070; }
        .hd-dropdown-link.admin-link:hover { background: rgba(224,112,112,0.1); color: #e07070; }
        .hd-dropdown-link.resp-link { color: #7dbf7d; }
        .hd-dropdown-link.resp-link:hover { background: rgba(125,191,125,0.1); color: #7dbf7d; }

        .hd-dropdown-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0; }
        .hd-dropdown-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 12px; border-radius: 8px;
          font-size: 13px; color: #e07070; background: none; border: none;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .hd-dropdown-btn:hover { background: rgba(224,112,112,0.1); }
        .hd-dropdown-btn svg { width: 16px; height: 16px; }

        .hd-signin {
          padding: 7px 16px; border-radius: 8px;
          color: #888; font-size: 13px; text-decoration: none;
          transition: color 0.2s; font-weight: 400;
        }
        .hd-signin:hover { color: #e8e4dc; }
        .hd-register {
          padding: 8px 18px; border-radius: 8px;
          background: linear-gradient(135deg, #b4915a, #c8a86e);
          color: #0c0c0e; font-size: 13px; font-weight: 500;
          text-decoration: none; letter-spacing: 0.04em;
          transition: opacity 0.2s, transform 0.1s;
          display: inline-block;
        }
        .hd-register:hover { opacity: 0.9; transform: translateY(-1px); }

        .hd-burger {
          display: none;
          background: none; border: none; cursor: pointer;
          padding: 6px; color: #666;
        }
        @media (max-width: 768px) {
          .hd-nav { display: none; }
          .hd-right .hd-signin, .hd-right .hd-register { display: none; }
          .hd-burger { display: flex; align-items: center; }
        }

        .hd-drawer {
          position: fixed; inset: 64px 0 0 0; z-index: 99;
          background: rgba(12,12,14,0.98);
          backdrop-filter: blur(20px);
          padding: 24px 24px;
          display: flex; flex-direction: column; gap: 6px;
          transform: translateY(${menuOpen ? '0' : '-20px'});
          opacity: ${menuOpen ? '1' : '0'};
          pointer-events: ${menuOpen ? 'all' : 'none'};
          transition: transform 0.25s ease, opacity 0.25s ease;
          border-top: 1px solid rgba(255,255,255,0.06);
          overflow-y: auto;
        }
        .hd-drawer-link {
          padding: 13px 16px; border-radius: 10px;
          font-size: 15px; color: #888; text-decoration: none;
          transition: color 0.2s, background 0.2s;
          display: flex; align-items: center; gap: 10px;
        }
        .hd-drawer-link:hover, .hd-drawer-link.active { color: #e8e4dc; background: rgba(255,255,255,0.04); }
        .hd-drawer-link.active { color: #b4915a; }
        .hd-drawer-section { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; padding: 16px 16px 8px; }
        .hd-drawer-admin { color: #e07070; }
        .hd-drawer-resp { color: #7dbf7d; }
        .hd-drawer-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0; }
        .hd-drawer-cta {
          display: flex; gap: 10px; margin-top: 8px;
        }
        .hd-drawer-btn {
          flex: 1; padding: 12px; border-radius: 10px; text-align: center;
          font-size: 14px; font-weight: 500; text-decoration: none;
          transition: opacity 0.2s;
        }
        .hd-drawer-btn.outline {
          border: 1px solid rgba(255,255,255,0.1); color: #888;
        }
        .hd-drawer-btn.filled {
          background: linear-gradient(135deg, #b4915a, #c8a86e); color: #0c0c0e;
        }
      `}</style>

      <header className="hd-root">
        <div className="hd-inner">
          <Link to="/" className="hd-logo">
            <span className="hd-logo-dot" />
            Forma
          </Link>

          <nav className="hd-nav">
            <Link to="/" className={`hd-nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
            <Link to="/formations" className={`hd-nav-link${isActive('/formations') ? ' active' : ''}`}>Courses</Link>
            <Link to="/centres" className={`hd-nav-link${isActive('/centres') ? ' active' : ''}`}>Centers</Link>
            {user && user.role === 'apprenant' && (
              <>
                <Link to="/apprenant/formations" className={`hd-nav-link${isActive('/apprenant/formations') ? ' active' : ''}`}>My Courses</Link>
                <Link to="/apprenant/favoris" className={`hd-nav-link${isActive('/apprenant/favoris') ? ' active' : ''}`}>Favorites</Link>
              </>
            )}
          </nav>

          <div className="hd-right">
            {user && <NotificationBell />}
            {user ? (
              <div className="hd-user-wrapper" ref={userMenuRef}>
                <div className="hd-user-chip" onClick={() => setUserMenuOpen(o => !o)}>
                  <div className="hd-avatar">
                    {user.user_image ? (
                      <img src={user.user_image.startsWith('http') ? user.user_image : `http://localhost:5000/${user.user_image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      (user.nom?.[0] || user.prenom?.[0] || user.email?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <span className="hd-user-name">
                    {user.prenom || user.nom || user.email?.split('@')[0]}
                  </span>
                  <span className={`hd-user-chevron ${userMenuOpen ? 'open' : ''}`}>▼</span>
                </div>

                <div className={`hd-user-dropdown ${userMenuOpen ? 'open' : ''}`}>
                  <div className="hd-dropdown-header">
                    <div className="hd-dropdown-name">{user.prenom} {user.nom}</div>
                    <div className="hd-dropdown-email">{user.email}</div>
                    <span className={`hd-dropdown-role ${user.role}`}>{user.role}</span>
                  </div>

                  <Link to="/profile" className="hd-dropdown-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    My Profile
                  </Link>

                  {(user.role === 'admin' || user.role === 'responsableCF') && (
                    <>
                      <div className="hd-dropdown-section">Management</div>
                      {user.role === 'admin' && (
                        <>
                          <Link to="/admin" className="hd-dropdown-link admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            User Management
                          </Link>
                          <Link to="/admin/reports" className="hd-dropdown-link admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Reported Content
                          </Link>
                          <Link to="/admin/statistics" className="hd-dropdown-link admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                            Platform Statistics
                          </Link>
                          <Link to="/admin/centres/verify" className="hd-dropdown-link admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            Verify Centers
                          </Link>
                        </>

                      )}
                      {user.role === 'responsableCF' && (
                        <>
                          <Link to="/responsable" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            Dashboard
                          </Link>
                          <Link to="/responsable/centres" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            My Centres
                          </Link>
                          <Link to="/responsable/formations" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                            My Formations
                          </Link>
                          <Link to="/responsable/inscriptions" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                            Enrollments
                          </Link>
                          <Link to="/responsable/payments" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            Payments
                          </Link>
                        </>
                      )}
                      <Link to="/admin/categories" className="hd-dropdown-link resp-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        Categories
                      </Link>
                    </>
                  )}
                  {user.role !== 'admin' && user.role !== 'responsableCF' && (
                    <>
                      <div className="hd-dropdown-section">Partnership</div>
                      <Link to="/centres/apply" className="hd-dropdown-link" style={{ color: '#b4915a' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Apply for Center
                      </Link>
                      <Link to="/centres/my-requests" className="hd-dropdown-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        My Applications
                      </Link>
                    </>
                  )}

                  {user.role === 'formateur' && (
                    <>
                      <div className="hd-dropdown-section">Formateur</div>
                      <Link to="/formateur" className="hd-dropdown-link" style={{ color: '#7ca8d4' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Dashboard
                      </Link>
                      <Link to="/formateur/formations" className="hd-dropdown-link" style={{ color: '#7ca8d4' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        My Formations
                      </Link>
                    </>
                  )}
                  {user.role === 'apprenant' && (
                    <>
                      <div className="hd-dropdown-section">My Learning</div>
                      <Link to="/apprenant" className="hd-dropdown-link" style={{ color: '#6a9fd8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Dashboard
                      </Link>
                      <Link to="/apprenant/formations" className="hd-dropdown-link" style={{ color: '#6a9fd8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        My Courses
                      </Link>
                      <Link to="/apprenant/favoris" className="hd-dropdown-link" style={{ color: '#6a9fd8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        Favorites
                      </Link>
                      <Link to="/apprenant/paiements" className="hd-dropdown-link" style={{ color: '#6a9fd8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                        Payments
                      </Link>
                    </>
                  )}

                  <div className="hd-dropdown-divider" />
                  <button className="hd-dropdown-btn" onClick={logout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="hd-signin">Sign In</Link>
                <Link to="/register" className="hd-register">Get Started</Link>
              </>
            )}
            <button className="hd-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                ) : (
                  <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="hd-drawer">
        <Link to="/" className={`hd-drawer-link${isActive('/') ? ' active' : ''}`}>Home</Link>
        <Link to="/formations" className={`hd-drawer-link${isActive('/formations') ? ' active' : ''}`}>Courses</Link>
        <Link to="/centres" className={`hd-drawer-link${isActive('/centres') ? ' active' : ''}`}>Centers</Link>
        {user && (
          <>
            <Link to="/profile" className={`hd-drawer-link${isActive('/profile') ? ' active' : ''}`}>My Profile</Link>
            <div className="hd-drawer-divider" />
            {user.role === 'apprenant' && (
              <>
                <div className="hd-drawer-section">My Learning</div>
                <Link to="/apprenant" className={`hd-drawer-link${isActive('/apprenant') && !isActive('/apprenant/') ? ' active' : ''}`} style={{ color: '#6a9fd8' }}>Dashboard</Link>
                <Link to="/apprenant/formations" className={`hd-drawer-link${isActive('/apprenant/formations') ? ' active' : ''}`} style={{ color: '#6a9fd8' }}>My Courses</Link>
                <Link to="/apprenant/favoris" className={`hd-drawer-link${isActive('/apprenant/favoris') ? ' active' : ''}`} style={{ color: '#6a9fd8' }}>Favorites</Link>
                <Link to="/apprenant/paiements" className={`hd-drawer-link${isActive('/apprenant/paiements') ? ' active' : ''}`} style={{ color: '#6a9fd8' }}>Payments</Link>
              </>
            )}
            {(user.role === 'admin' || user.role === 'responsableCF') && (
              <>
                <div className="hd-drawer-divider" />
                <div className="hd-drawer-section">Management</div>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={`hd-drawer-link${isActive('/admin') && !isActive('/admin/') ? ' active' : ''}`} style={{ color: '#e07070' }}>User Management</Link>
                    <Link to="/admin/reports" className={`hd-drawer-link${isActive('/admin/reports') ? ' active' : ''}`} style={{ color: '#e07070' }}>Reported Content</Link>
                    <Link to="/admin/statistics" className={`hd-drawer-link${isActive('/admin/statistics') ? ' active' : ''}`} style={{ color: '#e07070' }}>Statistics</Link>
                    <Link to="/admin/centres/verify" className={`hd-drawer-link${isActive('/admin/centres/verify') ? ' active' : ''}`} style={{ color: '#e07070' }}>Verify Centers</Link>
                  </>

                )}
                {user.role === 'responsableCF' && (
                  <>
                    <Link to="/responsable" className={`hd-drawer-link${isActive('/responsable') && !isActive('/responsable/') ? ' active' : ''}`} style={{ color: '#7dbf7d' }}>Dashboard</Link>
                    <Link to="/responsable/centres" className={`hd-drawer-link${isActive('/responsable/centres') ? ' active' : ''}`} style={{ color: '#7dbf7d' }}>My Centres</Link>
                    <Link to="/responsable/formations" className={`hd-drawer-link${isActive('/responsable/formations') ? ' active' : ''}`} style={{ color: '#7dbf7d' }}>My Formations</Link>
                    <Link to="/responsable/inscriptions" className={`hd-drawer-link${isActive('/responsable/inscriptions') ? ' active' : ''}`} style={{ color: '#7dbf7d' }}>Enrollments</Link>
                    <Link to="/responsable/payments" className={`hd-drawer-link${isActive('/responsable/payments') ? ' active' : ''}`} style={{ color: '#7dbf7d' }}>Payments</Link>
                  </>
                )}
                <Link to="/admin/categories" className={`hd-drawer-link${isActive('/admin/categories') ? ' active' : ''}`} style={{ color: '#7dbf7d' }}>Categories</Link>
              </>
            )}
            
            {user.role !== 'admin' && user.role !== 'responsableCF' && (
              <>
                <div className="hd-drawer-divider" />
                <div className="hd-drawer-section">Partnership</div>
                <Link to="/centres/apply" className={`hd-drawer-link${isActive('/centres/apply') ? ' active' : ''}`} style={{ color: '#b4915a' }}>Apply for Center</Link>
                <Link to="/centres/my-requests" className={`hd-drawer-link${isActive('/centres/my-requests') ? ' active' : ''}`}>My Applications</Link>
              </>
            )}

            
            <div className="hd-drawer-divider" />
            <button onClick={logout} className="hd-drawer-btn outline" style={{ background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#e07070' }}>
              Sign out
            </button>
          </>
        )}
        {!user && (
          <div className="hd-drawer-cta">
            <Link to="/login" className="hd-drawer-btn outline">Sign In</Link>
            <Link to="/register" className="hd-drawer-btn filled">Get Started</Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
