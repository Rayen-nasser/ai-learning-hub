import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

export default function ApprenantLayout({ title, subtitle, children }) {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path) => location.pathname === path;
  
  const getUserName = () => {
    if (!user) return 'Student';
    return user.prenom || user.nom || user.email?.split('@')[0] || 'Student';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0c0e',
      display: 'flex',
    }}>
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 280,
        height: '100vh',
        background: '#141416',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        zIndex: 100,
      }}>
        <Link to="/apprenant" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22,
          fontWeight: 500,
          color: '#7ca8d4',
          textDecoration: 'none',
          padding: '0 24px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          letterSpacing: '0.04em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7ca8d4', boxShadow: '0 0 8px rgba(124,168,212,0.5)' }} />
          Forma Learn
        </Link>
        
        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: '0 12px',
          flex: 1,
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#555',
              padding: '8px 12px',
              marginBottom: 4,
            }}>
              Overview
            </div>
            <Link 
              to="/apprenant" 
              style={{
                ...navLinkStyle,
                ...(isActive('/apprenant') ? navLinkActiveStyle : {}),
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Dashboard
            </Link>
            <Link 
              to="/apprenant/formations" 
              style={{
                ...navLinkStyle,
                ...(isActive('/apprenant/formations') ? navLinkActiveStyle : {}),
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              My Courses
            </Link>
            <Link 
              to="/apprenant/favoris" 
              style={{
                ...navLinkStyle,
                ...(isActive('/apprenant/favoris') ? navLinkActiveStyle : {}),
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Favorites
            </Link>
            <Link 
              to="/apprenant/paiements" 
              style={{
                ...navLinkStyle,
                ...(isActive('/apprenant/paiements') ? navLinkActiveStyle : {}),
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Payments
            </Link>
          </div>
        </nav>

        <div style={{
          padding: '0 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: 'auto',
        }}>
          <Link to="/" style={navLinkStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home Page
          </Link>
          <Link to="/profile" style={navLinkStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            My Profile
          </Link>
        </div>
      </aside>
      
      <main style={{
        marginLeft: 280,
        padding: '40px 48px',
        maxWidth: 1200,
        flex: 1,
      }}>
        <header style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <h1 
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 36,
                fontWeight: 400,
                color: '#f0ebe0',
                margin: 0,
              }}
              dangerouslySetInnerHTML={{ __html: title || 'Student Dashboard' }}
            />
          </div>
          {subtitle && <p style={{ fontSize: 14, color: '#555', margin: 0 }}>{subtitle}</p>}
          <p style={{ fontSize: 13, color: '#444', marginTop: 8 }}>
            Welcome back, <span style={{ color: '#7ca8d4' }}>{getUserName()}</span>
          </p>
        </header>
        {children}
      </main>
    </div>
  );
}

const navLinkStyle = {
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
};

const navLinkActiveStyle = {
  background: 'rgba(124,168,212,0.1)',
  color: '#7ca8d4',
  border: '1px solid rgba(124,168,212,0.2)',
};
