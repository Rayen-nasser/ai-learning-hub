import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/responsable', label: 'Dashboard', icon: 'home' },
  { path: '/responsable/centres', label: 'My Centres', icon: 'building', roles: ['responsableCF'] },
  { path: '/responsable/my-requests', label: 'Applications', icon: 'clipboard' },
  { path: '/responsable/formations', label: 'Formations', icon: 'book' },
  { path: '/responsable/inscriptions', label: 'Inscriptions', icon: 'users' },
  { path: '/responsable/payments', label: 'Payments', icon: 'credit' },
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
};

export default function ResponsableCFLayout({ children, title, subtitle }) {
  const location = useLocation();
  
  const currentPage = NAV_ITEMS.find(item => location.pathname === item.path);
  const isResponsablePage = location.pathname.startsWith('/responsable');

  if (!isResponsablePage) {
    return <>{children}</>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        
        .rcf-root { font-family: 'DM Sans', sans-serif; color: #e8e4dc; min-height: 100vh; background: #0c0c0e; }
        
        .rcf-topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(12,12,14,0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 32px;
        }
        .rcf-topbar-inner { max-width: 1400px; margin: 0 auto; }
        
        .rcf-breadcrumb {
          display: flex; align-items: center; gap: 8px;
          padding: 16px 0 12px;
          font-size: 13px;
        }
        .rcf-breadcrumb-link {
          color: #555; text-decoration: none;
          transition: color 0.15s;
        }
        .rcf-breadcrumb-link:hover { color: #b4915a; }
        .rcf-breadcrumb-sep { color: #333; }
        .rcf-breadcrumb-current { color: #e8e4dc; font-weight: 500; }
        
        .rcf-nav { display: flex; gap: 4px; padding: 8px 0 12px; overflow-x: auto; scrollbar-width: none; }
        .rcf-nav::-webkit-scrollbar { display: none; }
        
        .rcf-nav-link {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 400;
          color: #555; text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .rcf-nav-link:hover { color: #888; background: rgba(255,255,255,0.03); }
        .rcf-nav-link.active { color: #7dbf7d; background: rgba(125,191,125,0.1); }
        .rcf-nav-link svg { width: 18px; height: 18px; flex-shrink: 0; }
        
        .rcf-nav-link.centres.active { color: #6a9fd8; background: rgba(106,159,216,0.1); }
        .rcf-nav-link.formations.active { color: #c8a86e; background: rgba(200,168,110,0.1); }
        .rcf-nav-link.inscriptions.active { color: #e07070; background: rgba(224,112,112,0.1); }
        .rcf-nav-link.payments.active { color: #4aa87d; background: rgba(74,168,125,0.1); }
        .rcf-nav-link.categories.active { color: #b4915a; background: rgba(180,145,90,0.1); }
        
        .rcf-content { max-width: 1400px; margin: 0 auto; padding: 32px 32px 48px; }
        
        .rcf-page-header { margin-bottom: 32px; }
        .rcf-page-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 40px); font-weight: 300; color: #f0ebe0; margin: 0 0 8px; }
        .rcf-page-title em { font-style: italic; color: #7dbf7d; }
        .rcf-page-subtitle { font-size: 14px; color: #555; font-weight: 300; }
        
        @media (max-width: 768px) {
          .rcf-topbar { padding: 0 16px; }
          .rcf-content { padding: 24px 16px 48px; }
          .rcf-nav { gap: 2px; }
          .rcf-nav-link { padding: 8px 12px; font-size: 12px; }
          .rcf-nav-link svg { width: 16px; height: 16px; }
        }
      `}</style>

      <div className="rcf-root">
        <div className="rcf-topbar">
          <div className="rcf-topbar-inner">
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
            
            <nav className="rcf-nav">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rcf-nav-link ${item.icon} ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {ICONS[item.icon]}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="rcf-content">
          {(title || subtitle) && (
            <div className="rcf-page-header">
              {title && <h1 className="rcf-page-title" dangerouslySetInnerHTML={{ __html: title }} />}
              {subtitle && <p className="rcf-page-subtitle">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
