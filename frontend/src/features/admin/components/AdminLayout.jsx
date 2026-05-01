import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/admin',                  label: 'Dashboard',  icon: 'home'    },
  { path: '/admin/users',            label: 'Users',      icon: 'users'   },
  { path: '/admin/centres',          label: 'Centres',    icon: 'building'},
  { path: '/admin/centres/verify',   label: 'Verify',     icon: 'check'   },
  { path: '/admin/reports',          label: 'Reports',    icon: 'alert'   },
  { path: '/admin/statistics',       label: 'Statistics', icon: 'chart'   },
  { path: '/admin/categories',       label: 'Categories', icon: 'folder'  },
  { path: '/admin/skills',           label: 'Skills',     icon: 'award'   },
];

const ICONS = {
  home:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  building: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 3v18M16 3v18M2 9h20M2 15h20"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  alert:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  chart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  folder:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  award:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  back:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
};

export default function AdminLayout({ children, title, subtitle }) {
  const location = useLocation();
  
  const currentPage = NAV_ITEMS.find(item => location.pathname === item.path);
  const isAdminPage = location.pathname.startsWith('/admin');

  if (!isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        
        .al-root { font-family: 'DM Sans', sans-serif; color: #e8e4dc; min-height: 100vh; background: #0c0c0e; }
        
        .al-topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(12,12,14,0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 32px;
        }
        .al-topbar-inner { max-width: 1400px; margin: 0 auto; }
        
        .al-breadcrumb {
          display: flex; align-items: center; gap: 8px;
          padding: 16px 0 12px;
          font-size: 13px;
        }
        .al-breadcrumb-link {
          color: #555; text-decoration: none;
          transition: color 0.15s;
        }
        .al-breadcrumb-link:hover { color: #b4915a; }
        .al-breadcrumb-sep { color: #333; }
        .al-breadcrumb-current { color: #e8e4dc; font-weight: 500; }
        
        .al-nav { display: flex; gap: 4px; padding: 8px 0 12px; overflow-x: auto; scrollbar-width: none; }
        .al-nav::-webkit-scrollbar { display: none; }
        
        .al-nav-link {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 400;
          color: #555; text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .al-nav-link:hover { color: #888; background: rgba(255,255,255,0.03); }
        .al-nav-link.active { color: #b4915a; background: rgba(180,145,90,0.1); }
        .al-nav-link svg { width: 18px; height: 18px; flex-shrink: 0; }
        
        .al-nav-link.users.active { color: #e07070; background: rgba(224,112,112,0.1); }
        .al-nav-link.reports.active { color: #c8a86e; background: rgba(200,168,110,0.1); }
        .al-nav-link.statistics.active { color: #6a9fd8; background: rgba(106,159,216,0.1); }
        .al-nav-link.categories.active { color: #7dbf7d; background: rgba(125,191,125,0.1); }
        .al-nav-link.award.active { color: #b4915a; background: rgba(180,145,90,0.1); }
        
        .al-content { max-width: 1400px; margin: 0 auto; padding: 32px 32px 48px; }
        
        .al-page-header { margin-bottom: 32px; }
        .al-page-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 40px); font-weight: 300; color: #f0ebe0; margin: 0 0 8px; }
        .al-page-title em { font-style: italic; color: #b4915a; }
        .al-page-subtitle { font-size: 14px; color: #555; font-weight: 300; }
        
        @media (max-width: 768px) {
          .al-topbar { padding: 0 16px; }
          .al-content { padding: 24px 16px 48px; }
          .al-nav { gap: 2px; }
          .al-nav-link { padding: 8px 12px; font-size: 12px; }
          .al-nav-link svg { width: 16px; height: 16px; }
        }
      `}</style>

      <div className="al-root">
        <div className="al-topbar">
          <div className="al-topbar-inner">
            <div className="al-breadcrumb">
              <Link to="/" className="al-breadcrumb-link">Home</Link>
              <span className="al-breadcrumb-sep">/</span>
              <Link to="/admin" className="al-breadcrumb-link">Admin</Link>
              {currentPage && currentPage.path !== '/admin' && (
                <>
                  <span className="al-breadcrumb-sep">/</span>
                  <span className="al-breadcrumb-current">{currentPage.label}</span>
                </>
              )}
            </div>
            
            <nav className="al-nav">
              {NAV_ITEMS.map((item) => {
                const isActive = item.path === '/admin'
                  ? location.pathname === '/admin'
                  : item.path === '/admin/centres'
                    ? location.pathname === '/admin/centres'
                    : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`al-nav-link ${item.icon} ${isActive ? 'active' : ''}`}
                  >
                    {ICONS[item.icon]}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="al-content">
          {(title || subtitle) && (
            <div className="al-page-header">
              {title && <h1 className="al-page-title" dangerouslySetInnerHTML={{ __html: title }} />}
              {subtitle && <p className="al-page-subtitle">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
