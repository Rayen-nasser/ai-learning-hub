import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

const NAV_ITEMS = [
  { path: '/responsable', label: 'Dashboard', icon: 'home' },
  { path: '/responsable/centres', label: 'My Centres', icon: 'building', roles: ['responsableCF'] },
  { path: '/responsable/my-requests', label: 'Applications', icon: 'clipboard' },
  { path: '/responsable/formations', label: 'Formations', icon: 'book' },
  { path: '/responsable/inscriptions', label: 'Inscriptions', icon: 'users' },
  { path: '/responsable/payments', label: 'Payments', icon: 'credit' },
  { path: '/responsable/formateur-payments', label: 'Formateur Payments', icon: 'dollar' },
  { path: '/responsable/categories', label: 'Categories', icon: 'folder' },
];

const ICONS = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  building: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/></svg>,
  clipboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  credit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  folder: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  dollar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

export default function ResponsableCFLayout({ children, title, subtitle }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeSidebar]);

  const currentPage = NAV_ITEMS.find(item => location.pathname === item.path);
  const isResponsablePage = location.pathname.startsWith('/responsable');

  if (!isResponsablePage) {
    return <>{children}</>;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        
        :root {
          --rcf-sidebar-width: 280px;
        }

        .rcf-root { font-family: 'DM Sans', sans-serif; color: var(--text-primary); min-height: 100vh; background: var(--bg-main); display: flex; }

        /* ── Sidebar ── */
        .rcf-sidebar {
          width: var(--rcf-sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          background: var(--bg-card);
          border-right: 1px solid var(--border-main);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rcf-sidebar-header {
          padding: 40px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rcf-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 500;
          color: #2e7d32;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .rcf-logo:hover { opacity: 0.8; }

        .rcf-sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0 16px 40px;
          scrollbar-width: none;
        }
        .rcf-sidebar-scroll::-webkit-scrollbar { display: none; }

        .rcf-nav-group { margin-bottom: 32px; }
        .rcf-nav-group-title {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-secondary);
          opacity: 0.6;
          padding: 0 16px;
          margin-bottom: 12px;
        }

        .rcf-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.25s ease;
          margin-bottom: 4px;
          position: relative;
        }
        .rcf-nav-link:hover {
          color: var(--text-primary);
          background: rgba(180, 145, 90, 0.05);
        }
        .rcf-nav-link.active {
          color: #2e7d32;
          background: rgba(46, 125, 50, 0.08);
          font-weight: 500;
        }
        .rcf-nav-link.active::before {
          content: '';
          position: absolute;
          left: -16px; top: 12px; bottom: 12px;
          width: 4px;
          background: #2e7d32;
          border-radius: 0 4px 4px 0;
          box-shadow: 2px 0 10px rgba(46, 125, 50, 0.4);
        }
        .rcf-nav-link svg {
          width: 20px; height: 20px;
          transition: transform 0.25s;
        }
        .rcf-nav-link:hover svg { transform: scale(1.1); }
        .rcf-nav-link.active svg { color: #2e7d32; }

        .rcf-nav-link.centres.active { color: #1565c0; background: rgba(21, 101, 192, 0.08); }
        .rcf-nav-link.centres.active::before { background: #1565c0; box-shadow: 2px 0 10px rgba(21, 101, 192, 0.4); }
        .rcf-nav-link.centres.active svg { color: #1565c0; }
        .rcf-nav-link.formations.active { color: #b4915a; background: rgba(180, 145, 90, 0.08); }
        .rcf-nav-link.formations.active::before { background: #b4915a; box-shadow: 2px 0 10px rgba(180, 145, 90, 0.4); }
        .rcf-nav-link.formations.active svg { color: #b4915a; }
        .rcf-nav-link.inscriptions.active { color: #c62828; background: rgba(198, 40, 40, 0.08); }
        .rcf-nav-link.inscriptions.active::before { background: #c62828; box-shadow: 2px 0 10px rgba(198, 40, 40, 0.4); }
        .rcf-nav-link.inscriptions.active svg { color: #c62828; }
        .rcf-nav-link.payments.active { color: #2e7d32; background: rgba(46, 125, 50, 0.08); }
        .rcf-nav-link.payments.active::before { background: #2e7d32; }
        .rcf-nav-link.payments.active svg { color: #2e7d32; }
        .rcf-nav-link.categories.active { color: #b4915a; background: rgba(180, 145, 90, 0.08); }
        .rcf-nav-link.categories.active::before { background: #b4915a; }
        .rcf-nav-link.categories.active svg { color: #b4915a; }

        /* ── Main Content ── */
        .rcf-main {
          flex: 1;
          margin-left: var(--rcf-sidebar-width);
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .rcf-topbar {
          height: 80px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-main);
          position: sticky;
          top: 0; z-index: 40;
        }

        .rcf-topbar-left { display: flex; align-items: center; gap: 16px; flex: 1; }

        .rcf-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .rcf-breadcrumb-link { color: var(--text-secondary); text-decoration: none; transition: color 0.15s; }
        .rcf-breadcrumb-link:hover { color: #b4915a; }
        .rcf-breadcrumb-sep { color: var(--border-main); }
        .rcf-breadcrumb-current { color: var(--text-primary); font-weight: 500; }

        .rcf-mobile-toggle {
          display: none;
          background: none; border: none;
          color: var(--text-secondary); cursor: pointer;
          padding: 8px; margin-left: -8px;
          transition: color 0.2s;
        }
        .rcf-mobile-toggle:hover { color: var(--text-primary); }

        .rcf-content-inner {
          padding: 48px 40px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .rcf-page-header { margin-bottom: 48px; }
        .rcf-page-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 40px); font-weight: 300; color: var(--text-primary); margin: 0 0 8px; }
        .rcf-page-title em { font-style: italic; color: #2e7d32; }
        .rcf-page-subtitle { font-size: 14px; color: var(--text-secondary); font-weight: 300; }

        @media (max-width: 1024px) {
          .rcf-sidebar { transform: translateX(-100%); }
          .rcf-sidebar.open { transform: translateX(0); }
          .rcf-main { margin-left: 0; }
          .rcf-mobile-toggle { display: block; }
          .rcf-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            z-index: 90;
            display: none;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .rcf-overlay.open { display: block; }
          .rcf-topbar { padding: 0 24px; }
          .rcf-content-inner { padding: 40px 24px; }
        }
      `}</style>

      <div className="rcf-root">
        <div className={`rcf-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar} aria-hidden="true" />

        <aside className={`rcf-sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Responsable Sidebar">
          <div className="rcf-sidebar-header">
            <Link to="/responsable" className="rcf-logo">Forma<em>CF</em></Link>
          </div>

          <nav className="rcf-sidebar-scroll" aria-label="Main Navigation">
            <div className="rcf-nav-group">
              <div className="rcf-nav-group-title">Management</div>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rcf-nav-link ${item.icon} ${isActive(item.path) ? 'active' : ''}`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {ICONS[item.icon]}
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div style={{ padding: '0 16px 24px', borderTop: '1px solid var(--border-main)', paddingTop: 16, marginTop: 'auto' }}>
            <Link to="/" className="rcf-nav-link" style={{ marginBottom: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home Page
            </Link>
          </div>
        </aside>

        <main className="rcf-main">
          <header className="rcf-topbar" aria-label="Toolbar">
            <div className="rcf-topbar-left">
              <button
                className="rcf-mobile-toggle"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Sidebar"
                aria-expanded={isSidebarOpen}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div className="rcf-breadcrumb">
                <Link to="/" className="rcf-breadcrumb-link">Home</Link>
                <span className="rcf-breadcrumb-sep">/</span>
                <Link to="/responsable" className="rcf-breadcrumb-link">Responsable CF</Link>
                {currentPage && currentPage.path !== '/responsable' && (
                  <>
                    <span className="rcf-breadcrumb-sep">/</span>
                    <span className="rcf-breadcrumb-current">{currentPage.label}</span>
                  </>
                )}
              </div>
            </div>
          </header>

          <div className="rcf-content-inner">
            {(title || subtitle) && (
              <div className="rcf-page-header">
                {title && <h1 className="rcf-page-title" dangerouslySetInnerHTML={{ __html: title }} />}
                {subtitle && <p className="rcf-page-subtitle">{subtitle}</p>}
              </div>
            )}
            <section aria-label="Page Content">
              {children}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
