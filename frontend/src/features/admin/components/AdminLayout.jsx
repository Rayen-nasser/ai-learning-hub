import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';

const NAV_GROUPS = [
  {
    title: 'General',
    items: [
      { path: '/admin',            label: 'Dashboard',  icon: 'home'    },
      { path: '/admin/statistics', label: 'Statistics', icon: 'chart'   },
    ]
  },
  {
    title: 'Management',
    items: [
      { path: '/admin/users',      label: 'Users',      icon: 'users'   },
      { path: '/admin/centres',    label: 'Centres',    icon: 'building'},
      { path: '/admin/centres/verify', label: 'Verify Requests', icon: 'check' },
    ]
  },
  {
    title: 'Content',
    items: [
      { path: '/admin/categories', label: 'Categories', icon: 'folder'  },
      { path: '/admin/skills',     label: 'Skills',     icon: 'award'   },
    ]
  },
  {
    title: 'System',
    items: [
      { path: '/admin/reports',    label: 'Reports',    icon: 'alert'   },
    ]
  }
];

const ICONS = {
  home:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  building: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 3v18M16 3v18M2 9h20M2 15h20"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  alert:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  chart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  folder:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  award:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  search:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

export default function AdminLayout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeSidebar]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      navigate('/login');
    }
  };

  const isAdminPage = location.pathname.startsWith('/admin');
  if (!isAdminPage) return <>{children}</>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        :root {
          --admin-sidebar-width: 280px;
          --admin-accent: #b4915a;
          --admin-accent-rgb: 180, 145, 90;
          --admin-bg: var(--bg-main);
          --admin-card-bg: var(--bg-card);
          --admin-border: var(--border-main);
          --admin-text: var(--text-primary);
          --admin-text-dim: var(--text-secondary);
        }

        .al-root { 
          font-family: 'DM Sans', sans-serif; 
          color: var(--admin-text); 
          min-height: 100vh; 
          background: var(--admin-bg);
          display: flex;
        }

        /* ── Sidebar ── */
        .al-sidebar {
          width: var(--admin-sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          background: var(--bg-card);
          border-right: 1px solid var(--admin-border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .al-sidebar-header {
          padding: 40px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .al-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 500;
          color: var(--admin-accent);
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .al-logo:hover { opacity: 0.8; }

        .al-sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0 16px 40px;
          scrollbar-width: none;
        }
        .al-sidebar-scroll::-webkit-scrollbar { display: none; }

        .al-nav-group { margin-bottom: 32px; }
        .al-nav-group-title {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--admin-text-dim);
          opacity: 0.6;
          padding: 0 16px;
          margin-bottom: 12px;
        }

        .al-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          color: var(--admin-text-dim);
          text-decoration: none;
          transition: all 0.25s ease;
          margin-bottom: 4px;
          position: relative;
        }
        .al-nav-link:hover {
          color: var(--admin-text);
          background: rgba(180, 145, 90, 0.05);
        }
        .al-nav-link.active {
          color: var(--admin-accent);
          background: rgba(var(--admin-accent-rgb), 0.08);
          font-weight: 500;
        }
        .al-nav-link.active::before {
          content: '';
          position: absolute;
          left: -16px; top: 12px; bottom: 12px;
          width: 4px;
          background: var(--admin-accent);
          border-radius: 0 4px 4px 0;
          box-shadow: 2px 0 10px rgba(var(--admin-accent-rgb), 0.4);
        }
        .al-nav-link svg {
          width: 20px; height: 20px;
          transition: transform 0.25s;
        }
        .al-nav-link:hover svg { transform: scale(1.1); }
        .al-nav-link.active svg { color: var(--admin-accent); }

        /* ── Main Content ── */
        .al-main {
          flex: 1;
          margin-left: var(--admin-sidebar-width);
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .al-topbar {
          height: 80px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--admin-border);
          position: sticky;
          top: 0; z-index: 40;
        }

        .al-topbar-left { display: flex; align-items: center; gap: 24px; flex: 1; }
        
        .al-search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--admin-card-bg);
          border: 1px solid var(--admin-border);
          padding: 8px 16px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          color: var(--admin-text-dim);
          font-size: 14px;
        }
        .al-search-bar svg { width: 18px; height: 18px; opacity: 0.5; }

        .al-mobile-toggle {
          display: none;
          background: none; border: none;
          color: var(--admin-text-dim); cursor: pointer;
          padding: 8px; margin-left: -8px;
          transition: color 0.2s;
        }
        .al-mobile-toggle:hover { color: var(--admin-text); }

        .al-topbar-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .al-user-info-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 18px 6px 6px;
          background: var(--admin-card-bg);
          border: 1px solid var(--admin-border);
          border-radius: 40px;
          transition: border-color 0.2s;
        }
        .al-user-info-bar:hover { border-color: rgba(var(--admin-accent-rgb), 0.3); }
        
        .al-user-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(var(--admin-accent-rgb), 0.2), rgba(var(--admin-accent-rgb), 0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--admin-accent);
          overflow: hidden;
          border: 1px solid rgba(var(--admin-accent-rgb), 0.2);
        }
        .al-user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .al-user-name-small { font-size: 13px; font-weight: 500; color: var(--admin-text-dim); }

        .al-btn-logout-icon {
          background: none; border: none;
          color: var(--admin-text-dim); cursor: pointer;
          padding: 10px; border-radius: 12px;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid transparent;
        }
        .al-btn-logout-icon:hover {
          color: #e07070;
          background: rgba(224, 112, 112, 0.08);
          border-color: rgba(224, 112, 112, 0.2);
        }
        .al-btn-logout-icon svg { width: 20px; height: 20px; stroke-width: 2; }

        .al-content-inner {
          padding: 48px 40px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .al-page-header { margin-bottom: 48px; }
        .al-page-title { 
          font-family: 'Cormorant Garamond', serif; 
          font-size: clamp(34px, 5vw, 48px); 
          font-weight: 300; 
          color: var(--admin-text); 
          margin: 0 0 16px; 
          line-height: 1.1;
        }
        .al-page-title em { font-style: italic; color: var(--admin-accent); }
        .al-page-subtitle { font-size: 16px; color: var(--admin-text-dim); font-weight: 300; max-width: 650px; line-height: 1.6; }

        /* ── Mobile Responsive ── */
        @media (max-width: 1024px) {
          .al-sidebar { transform: translateX(-100%); }
          .al-sidebar.open { transform: translateX(0); }
          .al-main { margin-left: 0; }
          .al-mobile-toggle { display: block; }
          .al-search-bar { display: none; }
          .al-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            z-index: 90;
            display: none;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .al-overlay.open { display: block; }
          .al-topbar { padding: 0 24px; }
          .al-content-inner { padding: 40px 24px; }
          .al-user-name-small { display: none; }
          .al-user-info-bar { padding: 6px; }
        }
      `}</style>

      <div className="al-root">
        <div className={`al-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar} aria-hidden="true" />
        
        <aside className={`al-sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Admin Sidebar">
          <div className="al-sidebar-header">
            <Link to="/" className="al-logo" aria-label="Go to Home">Forma<em>Admin</em></Link>
          </div>

          <nav className="al-sidebar-scroll" aria-label="Main Navigation">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="al-nav-group">
                <div className="al-nav-group-title">{group.title}</div>
                {group.items.map((item) => {
                  const isActive = item.path === '/admin'
                    ? location.pathname === '/admin'
                    : item.path === '/admin/centres'
                      ? location.pathname === '/admin/centres' || (location.pathname.startsWith('/admin/centres/') && !location.pathname.startsWith('/admin/centres/verify'))
                      : location.pathname.startsWith(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`al-nav-link ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {ICONS[item.icon]}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="al-main">
          <header className="al-topbar" aria-label="Main Toolbar">
            <div className="al-topbar-left">
              <button 
                className="al-mobile-toggle" 
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open Sidebar"
                aria-expanded={isSidebarOpen}
              >
                {ICONS.menu}
              </button>
              <div className="al-search-bar" aria-hidden="true">
                {ICONS.search}
                <span>Quick search...</span>
              </div>
            </div>
            
            <div className="al-topbar-right">
              <div className="al-user-info-bar">
                <div className="al-user-avatar">
                  {user?.user_image ? (
                    <img src={user.user_image.startsWith('http') ? user.user_image : `http://localhost:5000/${user.user_image}`} alt="" />
                  ) : (
                    <span>{user?.prenom?.[0] || 'A'}</span>
                  )}
                </div>
                <span className="al-user-name-small">{user?.prenom} {user?.nom}</span>
              </div>
              
              <button 
                className="al-btn-logout-icon" 
                onClick={handleLogout} 
                title="Sign Out"
                aria-label="Sign Out"
              >
                {ICONS.logout}
              </button>
            </div>
          </header>

          <div className="al-content-inner">
            {(title || subtitle) && (
              <div className="al-page-header">
                {title && <h1 className="al-page-title" dangerouslySetInnerHTML={{ __html: title }} />}
                {subtitle && <p className="al-page-subtitle">{subtitle}</p>}
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
