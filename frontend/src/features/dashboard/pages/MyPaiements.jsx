import { useState, useEffect } from 'react';
import { paiementService } from '../../../services/api';
import { useAuth } from '../../../shared/context/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_META = {
  paid: { label: 'Paid', color: '#4aa87d', bg: 'rgba(74,168,125,0.1)' },
  pending: { label: 'Pending', color: '#c8a86e', bg: 'rgba(200,168,110,0.1)' },
  failed: { label: 'Failed', color: '#e07070', bg: 'rgba(220,110,110,0.1)' },
  refunded: { label: 'Refunded', color: '#6a9fd8', bg: 'rgba(106,159,216,0.1)' },
};

const MyPaiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      paiementService.getMyPaiements()
        .then((res) => setPaiements(res.data.data || res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const total = paiements.reduce((s, p) => s + (p.montant || p.amount || 0), 0);

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'DM Sans, sans-serif', color: '#555' }}>
      <p style={{ marginBottom: 16, color: '#666' }}>Please sign in to view your payments.</p>
      <Link to="/login" style={{ color: '#b4915a', fontWeight: 500 }}>Sign In</Link>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .mp-root { font-family: 'DM Sans', sans-serif; color: #e8e4dc; padding-top: 48px; }
        .mp-header { margin-bottom: 40px; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .mp-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 4vw, 48px); font-weight: 300; color: #f0ebe0; margin: 0 0 6px; }
        .mp-title em { font-style: italic; color: #b4915a; }
        .mp-subtitle { font-size: 14px; color: #555; }

        .mp-summary {
          padding: 20px 24px; border-radius: 12px;
          background: rgba(180,145,90,0.06); border: 1px solid rgba(180,145,90,0.2);
          text-align: right;
        }
        .mp-summary-label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-bottom: 4px; }
        .mp-summary-value { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; color: #b4915a; line-height: 1; }
        .mp-summary-unit { font-size: 13px; color: #888; margin-left: 4px; font-family: 'DM Sans', sans-serif; }

        .mp-list { display: flex; flex-direction: column; gap: 10px; }
        .mp-card {
          display: flex; align-items: center; gap: 16px;
          padding: 18px 22px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          transition: border-color 0.2s;
        }
        .mp-card:hover { border-color: rgba(255,255,255,0.12); }
        .mp-card-icon {
          width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
          background: rgba(180,145,90,0.08); border: 1px solid rgba(180,145,90,0.15);
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .mp-info { flex: 1; min-width: 0; }
        .mp-method { font-size: 14px; font-weight: 500; color: #e8e4dc; text-transform: capitalize; }
        .mp-date { font-size: 12px; color: #444; margin-top: 2px; }
        .mp-amount { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #e8e4dc; font-weight: 400; flex-shrink: 0; }
        .mp-amount-unit { font-size: 11px; color: #555; font-family: 'DM Sans', sans-serif; }
        .mp-status { padding: 3px 10px; border-radius: 20px; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; flex-shrink: 0; }

        .mp-empty { text-align: center; padding: 80px 24px; color: #444; }
        .mp-empty-icon { font-size: 44px; margin-bottom: 16px; opacity: 0.3; }
        .mp-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #b4915a; animation: mpspin 0.8s linear infinite; margin: 80px auto; display: block; }
        @keyframes mpspin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="mp-root">
        <div className="mp-header">
          <div>
            <h1 className="mp-title">My <em>Payments</em></h1>
            <p className="mp-subtitle">Your complete payment history</p>
          </div>
          {paiements.length > 0 && (
            <div className="mp-summary">
              <div className="mp-summary-label">Total Spent</div>
              <div><span className="mp-summary-value">{total}</span><span className="mp-summary-unit">DT</span></div>
            </div>
          )}
        </div>

        {loading ? <div className="mp-spinner" /> : paiements.length === 0 ? (
          <div className="mp-empty">
            <div className="mp-empty-icon">💳</div>
            <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>No payments yet</div>
            <div style={{ fontSize: 13 }}>Enroll in a course to get started</div>
          </div>
        ) : (
          <div className="mp-list">
            {paiements.map(p => {
              const status = p.statut || p.status || 'pending';
              const meta = STATUS_META[status] || STATUS_META.pending;
              return (
                <div key={p._id} className="mp-card">
                  <div className="mp-card-icon">💳</div>
                  <div className="mp-info">
                    <div className="mp-method">{p.mode || p.method || 'Payment'}</div>
                    <div className="mp-date">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="mp-amount">{p.montant || p.amount}</span>
                    <span className="mp-amount-unit"> DT</span>
                  </div>
                  <span className="mp-status" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyPaiements;