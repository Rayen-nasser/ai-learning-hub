import { Link, useLocation } from 'react-router-dom';

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#0c0c0e',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 260,
    height: '100vh',
    background: '#141416',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 500,
    color: '#c8a86e',
    textDecoration: 'none',
    padding: '0 24px',
    marginBottom: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    letterSpacing: '0.04em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '0 12px',
    flex: 1,
  },
  navSection: {
    marginBottom: 20,
  },
  navSectionTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#555',
    padding: '8px 12px',
    marginBottom: 4,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 14,
    color: '#888',
    textDecoration: 'none',
    transition: 'all 0.15s',
    fontWeight: 400,
  },
  navLinkActive: {
    background: 'rgba(200,168,110,0.1)',
    color: '#c8a86e',
    border: '1px solid rgba(200,168,110,0.2)',
  },
  main: {
    marginLeft: 260,
    padding: '40px 48px',
    maxWidth: 1200,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 36,
    fontWeight: 400,
    color: '#f0ebe0',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
};

export default function FormateurLayout({ title, subtitle, children }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <Link to="/formateur" style={styles.logo}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8a86e', boxShadow: '0 0 8px rgba(200,168,110,0.5)' }} />
          Forma
        </Link>
        
        <nav style={styles.nav}>
          <div style={styles.navSection}>
            <div style={styles.navSectionTitle}>Overview</div>
            <Link 
              to="/formateur" 
              style={{ ...styles.navLink, ...(isActive('/formateur') && !location.pathname.includes('/formateur/') ? styles.navLinkActive : {}) }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </Link>
            <Link 
              to="/formateur/formations" 
              style={{ ...styles.navLink, ...(isActive('/formateur/formations') ? styles.navLinkActive : {}) }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              My Formations
            </Link>
          </div>
        </nav>

        <div style={{ padding: '0 12px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
          <Link 
            to="/" 
            style={styles.navLink}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home Page
          </Link>
        </div>
      </aside>
      
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 
            style={styles.title}
            dangerouslySetInnerHTML={{ __html: title || 'Formateur Dashboard' }}
          />
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}
