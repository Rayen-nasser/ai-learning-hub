import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from '../../features/notifications/components/NotificationBell';

const Header = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
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
          background: ${scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)'};
          backdrop-filter: blur(20px);
          border-bottom: 1px solid ${scrolled ? 'var(--border-main)' : 'transparent'};
          transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
          box-shadow: ${scrolled ? '0 8px 32px rgba(0, 0, 0, 0.25)' : 'none'};
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
          color: var(--text-secondary); text-decoration: none;
          transition: color 0.2s, background 0.2s;
          position: relative;
        }
        .hd-nav-link:hover { color: var(--text-primary); background: rgba(180,145,90,0.08); }
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
          border: 1px solid var(--border-main);
          background: rgba(0,0,0,0.02);
          transition: border-color 0.2s, background 0.2s;
          cursor: pointer;
        }
        .hd-user-chip:hover { border-color: rgba(180,145,90,0.3); background: rgba(180,145,90,0.05); }
        .hd-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #b4915a, #8a6e40);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; color: #ffffff;
          flex-shrink: 0;
        }
        .hd-user-name { font-size: 13px; color: var(--text-primary); }
        .hd-user-chevron { font-size: 10px; color: var(--text-secondary); margin-left: 2px; transition: transform 0.2s; }
        .hd-user-chevron.open { transform: rotate(180deg); }

        .hd-user-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-main);
          border-radius: 16px;
          min-width: 260px;
          padding: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          opacity: 0; visibility: hidden;
          transform: translateY(-12px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 150;
        }
        .hd-user-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }

        .hd-dropdown-header {
          padding: 12px 16px 20px;
          border-bottom: 1px solid var(--border-main);
          margin-bottom: 8px;
        }
        .hd-dropdown-name { font-size: 15px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
        .hd-dropdown-email { font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; }
        .hd-dropdown-role {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(180,145,90,0.15);
          color: #b4915a;
        }
        .hd-dropdown-role.admin { background: rgba(198,40,40,0.12); color: #c62828; }
        .hd-dropdown-role.respCF { background: rgba(46,125,50,0.12); color: #2e7d32; }

        .hd-dropdown-section { 
          font-size: 10px; 
          font-weight: 600;
          text-transform: uppercase; 
          letter-spacing: 0.12em; 
          color: #444; 
          color: var(--text-secondary); 
          padding: 16px 16px 8px; 
        }
        
        .hd-dropdown-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; border-radius: 10px;
          font-size: 14px; color: var(--text-secondary); text-decoration: none;
          transition: all 0.2s ease;
        }
        .hd-dropdown-link:hover { background: rgba(180,145,90,0.08); color: var(--text-primary); }
        .hd-dropdown-link svg { width: 18px; height: 18px; opacity: 0.6; stroke-width: 1.5; }
        
        .hd-dropdown-link.admin-link { color: #c62828; }
        .hd-dropdown-link.admin-link:hover { background: rgba(198, 40, 40, 0.08); color: #c62828; }
        
        .hd-dropdown-link.resp-link { color: #2e7d32; }
        .hd-dropdown-link.resp-link:hover { background: rgba(46, 125, 50, 0.08); color: #2e7d32; }

        .hd-dropdown-divider { height: 1px; background: var(--border-main); margin: 8px 12px; }
        
        .hd-dropdown-btn {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 12px 16px; border-radius: 10px;
          font-size: 14px; color: #c62828; background: none; border: none;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          margin-top: 4px;
        }
        .hd-dropdown-btn:hover { background: rgba(224, 112, 112, 0.08); }
        .hd-dropdown-btn svg { width: 18px; height: 18px; stroke-width: 1.5; }

        .hd-signin {
          padding: 7px 16px; border-radius: 8px;
          color: var(--text-secondary); font-size: 13px; text-decoration: none;
          transition: color 0.2s; font-weight: 400;
        }
        .hd-signin:hover { color: var(--text-primary); }
        .hd-register {
          padding: 8px 18px; border-radius: 8px;
          background: linear-gradient(135deg, #b4915a, #c8a86e);
          color: #ffffff; font-size: 13px; font-weight: 500;
          text-decoration: none; letter-spacing: 0.04em;
          transition: opacity 0.2s, transform 0.1s;
          display: inline-block;
        }
        .hd-register:hover { opacity: 0.9; transform: translateY(-1px); }

        .hd-burger {
          display: none;
          background: none; border: none; cursor: pointer;
          padding: 6px; color: var(--text-secondary);
        }
        @media (max-width: 768px) {
          .hd-nav { display: none; }
          .hd-right .hd-signin, .hd-right .hd-register { display: none; }
          .hd-burger { display: flex; align-items: center; }
        }

        .hd-drawer {
          position: fixed; inset: 64px 0 0 0; z-index: 99;
          background: rgba(245, 244, 240, 0.98);
          backdrop-filter: blur(20px);
          padding: 24px 24px;
          display: flex; flex-direction: column; gap: 6px;
          transform: translateY(${menuOpen ? '0' : '-20px'});
          opacity: ${menuOpen ? '1' : '0'};
          pointer-events: ${menuOpen ? 'all' : 'none'};
          transition: transform 0.25s ease, opacity 0.25s ease;
          border-top: 1px solid var(--border-main);
          overflow-y: auto;
        }
        .hd-drawer-link {
          padding: 13px 16px; border-radius: 10px;
          font-size: 15px; color: var(--text-secondary); text-decoration: none;
          transition: color 0.2s, background 0.2s;
          display: flex; align-items: center; gap: 10px;
        }
        .hd-drawer-link:hover, .hd-drawer-link.active { color: var(--text-primary); background: rgba(180,145,90,0.08); }
        .hd-drawer-link.active { color: #b4915a; }
        .hd-drawer-section { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); padding: 16px 16px 8px; }
        .hd-drawer-admin { color: #c62828; }
        .hd-drawer-resp { color: #2e7d32; }
        .hd-drawer-divider { height: 1px; background: var(--border-main); margin: 8px 0; }
        .hd-drawer-cta {
          display: flex; gap: 10px; margin-top: 8px;
        }
        .hd-drawer-btn {
          flex: 1; padding: 12px; border-radius: 10px; text-align: center;
          font-size: 14px; font-weight: 500; text-decoration: none;
          transition: opacity 0.2s;
        }
        .hd-drawer-btn.outline {
          border: 1px solid var(--border-main); color: var(--text-secondary);
        }
        .hd-drawer-btn.filled {
          background: linear-gradient(135deg, #b4915a, #c8a86e); color: #ffffff;
        }
      `}</style>

      <header className="hd-root">
        <div className="hd-inner">
          <Link to="/" className="hd-logo">
            <span className="hd-logo-dot" />
            Forma
          </Link>

          <nav className="hd-nav">
            <Link to="/" className={`hd-nav-link${isActive('/') ? ' active' : ''}`}>{t('common.home')}</Link>
            <Link to="/formations" className={`hd-nav-link${isActive('/formations') ? ' active' : ''}`}>{t('common.courses')}</Link>
            <Link to="/centres" className={`hd-nav-link${isActive('/centres') ? ' active' : ''}`}>{t('nav.centers')}</Link>
            {user && user.role === 'apprenant' && (
              <>
                <Link to="/apprenant/formations" className={`hd-nav-link${isActive('/apprenant/formations') ? ' active' : ''}`}>{t('common.courses')}</Link>
                <Link to="/apprenant/favoris" className={`hd-nav-link${isActive('/apprenant/favoris') ? ' active' : ''}`}>{t('common.favorites')}</Link>
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
                    {t('common.profile')}
                  </Link>

                  {(user.role === 'admin' || user.role === 'responsableCF') && (
                    <>
                      <div className="hd-dropdown-section">{t('nav.management')}</div>
                      {user.role === 'admin' && (
                        <>
                          <Link to="/admin" className="hd-dropdown-link admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            {t('nav.userManagement')}
                          </Link>
                          <Link to="/admin/statistics" className="hd-dropdown-link admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                            {t('nav.statistics')}
                          </Link>
                          <Link to="/admin/centres/verify" className="hd-dropdown-link admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            {t('nav.verifyCenters')}
                          </Link>
                          <Link to="/admin/categories" className="hd-dropdown-link admin-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            {t('nav.categories')}
                          </Link>
                        </>

                      )}
                      {user.role === 'responsableCF' && (
                        <>
                          <Link to="/responsable" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            {t('common.dashboard')}
                          </Link>
                          <Link to="/responsable/centres" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            {t('nav.myCentres')}
                          </Link>
                          <Link to="/responsable/formations" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                            {t('nav.myFormations')}
                          </Link>
                          <Link to="/responsable/inscriptions" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                            {t('nav.enrollments')}
                          </Link>
                          <Link to="/responsable/payments" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            {t('common.payments')}
                          </Link>
                          <Link to="/admin/categories" className="hd-dropdown-link resp-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            {t('nav.categories')}
                          </Link>
                        </>
                      )}
                    </>
                  )}
                  {user.role === 'formateur' && (
                    <>
                      <div className="hd-dropdown-section">{t('nav.formateur')}</div>
                      <Link to="/formateur" className="hd-dropdown-link" style={{ color: '#7ca8d4' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        {t('common.dashboard')}
                      </Link>
                      <Link to="/formateur/formations" className="hd-dropdown-link" style={{ color: '#7ca8d4' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        {t('nav.myFormations')}
                      </Link>
                    </>
                  )}
                  {user.role === 'apprenant' && (
                    <>
                      <div className="hd-dropdown-section">{t('nav.myLearning')}</div>
                      <Link to="/apprenant" className="hd-dropdown-link" style={{ color: '#6a9fd8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        {t('common.dashboard')}
                      </Link>
                      <Link to="/apprenant/formations" className="hd-dropdown-link" style={{ color: '#6a9fd8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        {t('nav.myCourses')}
                      </Link>
                      <Link to="/apprenant/favoris" className="hd-dropdown-link" style={{ color: '#6a9fd8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        {t('common.favorites')}
                      </Link>
                      <Link to="/apprenant/paiements" className="hd-dropdown-link" style={{ color: '#6a9fd8' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                        {t('common.payments')}
                      </Link>
                    </>
                  )}

                  <div className="hd-dropdown-divider" />
                  <button className="hd-dropdown-btn" onClick={logout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    {t('common.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="hd-signin">{t('auth.login')}</Link>
                <Link to="/register" className="hd-register">{t('auth.signup')}</Link>
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
        <Link to="/" className={`hd-drawer-link${isActive('/') ? ' active' : ''}`}>{t('common.home')}</Link>
        <Link to="/formations" className={`hd-drawer-link${isActive('/formations') ? ' active' : ''}`}>{t('common.courses')}</Link>
        <Link to="/centres" className={`hd-drawer-link${isActive('/centres') ? ' active' : ''}`}>{t('nav.centers')}</Link>
        {user && (
          <>
            <Link to="/profile" className={`hd-drawer-link${isActive('/profile') ? ' active' : ''}`}>{t('common.profile')}</Link>
            <div className="hd-drawer-divider" />
            {user.role === 'apprenant' && (
              <>
                <div className="hd-drawer-section">{t('nav.myLearning')}</div>
                <Link to="/apprenant" className={`hd-drawer-link${isActive('/apprenant') && !isActive('/apprenant/') ? ' active' : ''}`} style={{ color: '#6a9fd8' }}>{t('common.dashboard')}</Link>
                <Link to="/apprenant/formations" className={`hd-drawer-link${isActive('/apprenant/formations') ? ' active' : ''}`} style={{ color: '#6a9fd8' }}>{t('common.courses')}</Link>
                <Link to="/apprenant/favoris" className={`hd-drawer-link${isActive('/apprenant/favoris') ? ' active' : ''}`} style={{ color: '#6a9fd8' }}>{t('common.favorites')}</Link>
                <Link to="/apprenant/paiements" className={`hd-drawer-link${isActive('/apprenant/paiements') ? ' active' : ''}`} style={{ color: '#6a9fd8' }}>{t('common.payments')}</Link>
              </>
            )}
            {(user.role === 'admin' || user.role === 'responsableCF') && (
              <>
                <div className="hd-drawer-divider" />
                <div className="hd-drawer-section">{t('nav.management')}</div>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={`hd-drawer-link${isActive('/admin') && !isActive('/admin/') ? ' active' : ''}`} style={{ color: '#c62828' }}>{t('nav.userManagement')}</Link>
                    <Link to="/admin/statistics" className={`hd-drawer-link${isActive('/admin/statistics') ? ' active' : ''}`} style={{ color: '#c62828' }}>{t('nav.statistics')}</Link>
                    <Link to="/admin/centres/verify" className={`hd-drawer-link${isActive('/admin/centres/verify') ? ' active' : ''}`} style={{ color: '#c62828' }}>{t('nav.verifyCenters')}</Link>
                  </>

                )}
                {user.role === 'responsableCF' && (
                  <>
                    <Link to="/responsable" className={`hd-drawer-link${isActive('/responsable') && !isActive('/responsable/') ? ' active' : ''}`} style={{ color: '#2e7d32' }}>{t('common.dashboard')}</Link>
                    <Link to="/responsable/centres" className={`hd-drawer-link${isActive('/responsable/centres') ? ' active' : ''}`} style={{ color: '#2e7d32' }}>{t('nav.myCentres')}</Link>
                    <Link to="/responsable/formations" className={`hd-drawer-link${isActive('/responsable/formations') ? ' active' : ''}`} style={{ color: '#2e7d32' }}>{t('nav.myFormations')}</Link>
                    <Link to="/responsable/inscriptions" className={`hd-drawer-link${isActive('/responsable/inscriptions') ? ' active' : ''}`} style={{ color: '#2e7d32' }}>{t('nav.enrollments')}</Link>
                    <Link to="/responsable/payments" className={`hd-drawer-link${isActive('/responsable/payments') ? ' active' : ''}`} style={{ color: '#2e7d32' }}>{t('common.payments')}</Link>
                  </>
                )}
                <Link to="/admin/categories" className={`hd-drawer-link${isActive('/admin/categories') ? ' active' : ''}`} style={{ color: '#2e7d32' }}>{t('nav.categories')}</Link>
              </>
            )}
            
            
            <div className="hd-drawer-divider" />
            <button onClick={logout} className="hd-drawer-btn outline" style={{ background: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#c62828' }}>
              {t('common.logout')}
            </button>
          </>
        )}
        {!user && (
          <div className="hd-drawer-cta">
            <Link to="/login" className="hd-drawer-btn outline">{t('auth.login')}</Link>
            <Link to="/register" className="hd-drawer-btn filled">{t('auth.signup')}</Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
