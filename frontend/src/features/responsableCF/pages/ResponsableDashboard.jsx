import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { centreService } from '../services/centre';
import ResponsableCFLayout from '../components/ResponsableCFLayout';

export default function ResponsableDashboard() {
  const [stats, setStats] = useState({
    centres: 0,
    approvedCentres: 0,
    pendingCentres: 0,
    formations: 0,
    inscriptions: 0,
    pendingInscriptions: 0,
    acceptedInscriptions: 0,
    revenue: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await centreService.getMyStats();
      const d = res.data.data;

      setStats({
        centres: d.centres.total,
        approvedCentres: d.centres.approved,
        pendingCentres: d.centres.pending,
        formations: d.formations.total,
        inscriptions: d.inscriptions.total,
        pendingInscriptions: d.inscriptions.pending,
        acceptedInscriptions: d.inscriptions.accepted,
        revenue: d.revenue.confirmed,
        pendingPayments: d.revenue.pending,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsableCFLayout>
      <style>{`
        .rd-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .rd-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; transition: border-color 0.2s; }
        .rd-stat:hover { border-color: rgba(125,191,125,0.3); }
        .rd-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .rd-stat-icon svg { width: 20px; height: 20px; }
        .rd-stat-icon.blue { background: rgba(106,159,216,.15); color: #6a9fd8; }
        .rd-stat-icon.gold { background: rgba(200,168,110,.15); color: #c8a86e; }
        .rd-stat-icon.red { background: rgba(224,112,112,.15); color: #e07070; }
        .rd-stat-icon.green { background: rgba(74,168,125,.15); color: #4aa87d; }
        .rd-stat-value { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; color: #f0ebe0; line-height: 1; }
        .rd-stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-top: 8px; }
        .rd-stat-sub { font-size: 11px; color: #444; margin-top: 6px; }

        .rd-error { background: rgba(224,112,112,.08); border: 1px solid rgba(224,112,112,.2); border-radius: 12px; padding: 16px 20px; color: #e07070; font-size: 13px; margin-bottom: 24px; }

        .rd-quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .rd-action { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; text-align: center; text-decoration: none; color: inherit; transition: all 0.2s; }
        .rd-action:hover { border-color: rgba(125,191,125,0.3); transform: translateY(-2px); }
        .rd-action-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .rd-action-icon svg { width: 24px; height: 24px; }
        .rd-action-label { font-weight: 500; color: #f0ebe0; margin-bottom: 4px; }
        .rd-action-desc { font-size: 12px; color: #555; }

        .rd-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #7dbf7d; animation: rdspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes rdspin { to { transform: rotate(360deg); } }
      `}</style>

      {loading ? (
        <div className="rd-spinner" />
      ) : (
        <>
          {error && <div className="rd-error">⚠️ {error}</div>}

          <div className="rd-stats">
            <div className="rd-stat">
              <div className="rd-stat-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
                </svg>
              </div>
              <div className="rd-stat-value">{stats.centres}</div>
              <div className="rd-stat-label">My Centres</div>
              {stats.pendingCentres > 0 && (
                <div className="rd-stat-sub">{stats.approvedCentres} approved · {stats.pendingCentres} pending</div>
              )}
            </div>
            <div className="rd-stat">
              <div className="rd-stat-icon gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div className="rd-stat-value">{stats.formations}</div>
              <div className="rd-stat-label">Formations</div>
            </div>
            <div className="rd-stat">
              <div className="rd-stat-icon red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="rd-stat-value">{stats.pendingInscriptions}</div>
              <div className="rd-stat-label">Pending Inscriptions</div>
              {stats.acceptedInscriptions > 0 && (
                <div className="rd-stat-sub">{stats.acceptedInscriptions} accepted · {stats.inscriptions} total</div>
              )}
            </div>
            <div className="rd-stat">
              <div className="rd-stat-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div className="rd-stat-value">{stats.revenue.toLocaleString()} DT</div>
              <div className="rd-stat-label">Confirmed Revenue</div>
              {stats.pendingPayments > 0 && (
                <div className="rd-stat-sub">{stats.pendingPayments.toLocaleString()} DT pending</div>
              )}
            </div>
          </div>

          <div className="rd-quick-actions">
            <Link to="/responsable/centres" className="rd-action">
              <div className="rd-action-icon" style={{ background: 'rgba(106,159,216,.15)', color: '#6a9fd8' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
                </svg>
              </div>
              <div className="rd-action-label">Manage Centres</div>
              <div className="rd-action-desc">Add or edit your training centres</div>
            </Link>
            <Link to="/responsable/formations" className="rd-action">
              <div className="rd-action-icon" style={{ background: 'rgba(200,168,110,.15)', color: '#c8a86e' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div className="rd-action-label">Manage Formations</div>
              <div className="rd-action-desc">Create and update courses</div>
            </Link>
            <Link to="/responsable/inscriptions" className="rd-action">
              <div className="rd-action-icon" style={{ background: 'rgba(224,112,112,.15)', color: '#e07070' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <div className="rd-action-label">Review Inscriptions</div>
              <div className="rd-action-desc">{stats.pendingInscriptions} pending requests</div>
            </Link>
            <Link to="/responsable/payments" className="rd-action">
              <div className="rd-action-icon" style={{ background: 'rgba(74,168,125,.15)', color: '#4aa87d' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div className="rd-action-label">View Payments</div>
              <div className="rd-action-desc">Track revenue and transactions</div>
            </Link>
          </div>
        </>
      )}
    </ResponsableCFLayout>
  );
}
