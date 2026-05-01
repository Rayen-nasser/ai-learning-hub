import { useState, useEffect } from 'react';
import ApprenantLayout from '../components/ApprenantLayout';
import { paiementService } from '../../../services/api';
import { formatDate } from '../../../shared/utils/format';

/* ─── Status config ──────────────────────────────────────────────── */
const STATUS = {
  confirme:  { label: 'Confirmed', color: '#4aa87d', bg: 'rgba(74,168,125,0.12)',  icon: '✓' },
  en_attente:{ label: 'Pending',   color: '#c8a86e', bg: 'rgba(200,168,110,0.12)', icon: '⏳' },
  refuse:    { label: 'Rejected',  color: '#e07070', bg: 'rgba(224,112,112,0.12)', icon: '✕' },
};

const METHOD_LABEL = {
  carte:    'Card Payment',
  virement: 'Bank Transfer',
  especes:  'Cash',
};

/* ─── Icons ──────────────────────────────────────────────────────── */
const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const TransferIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const CashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="12" cy="12" r="2"/>
    <path d="M6 12h.01M18 12h.01"/>
  </svg>
);

function MethodIcon({ method }) {
  if (method === 'virement') return <TransferIcon />;
  if (method === 'especes')  return <CashIcon />;
  return <CardIcon />;
}

export default function ApprenantPaiements() {
  const [paiements, setPaiements]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [cancelingId, setCancelingId] = useState(null);
  const [error, setError]           = useState(null);
  const [toast, setToast]           = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paiementService.getMyPaiements();
      // Sort newest first
      const data = (res.data.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPaiements(data);
    } catch (e) {
      setError('Could not load your payment history. Please try again.');
      console.error('Failed to fetch payments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this pending payment?')) return;
    setCancelingId(id);
    try {
      await paiementService.cancel(id);
      showToast('Payment cancelled successfully.', 'success');
      await fetchData();
    } catch {
      showToast('Could not cancel this payment.', 'error');
    } finally {
      setCancelingId(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ─── Computed stats ──────────────────────────────────────────── */
  const confirmedTotal  = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + (p.montant || 0), 0);
  const pendingTotal    = paiements.filter(p => p.statut === 'en_attente').reduce((s, p) => s + (p.montant || 0), 0);
  const confirmedCount  = paiements.filter(p => p.statut === 'confirme').length;
  const pendingCount    = paiements.filter(p => p.statut === 'en_attente').length;

  /* ─── Filtering ───────────────────────────────────────────────── */
  const visible = filter === 'all' ? paiements : paiements.filter(p => p.statut === filter);

  const FILTERS = [
    { key: 'all',        label: 'All',       count: paiements.length },
    { key: 'confirme',   label: 'Confirmed', count: confirmedCount },
    { key: 'en_attente', label: 'Pending',   count: pendingCount },
  ];

  return (
    <ApprenantLayout title="Transaction <em>History</em>" subtitle="Your complete payment record">
      <style>{`
        .tp-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .tp-card { border-radius: 16px; padding: 22px 24px; }
        .tp-card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 10px; }
        .tp-card-value { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 400; line-height: 1; }
        .tp-card-sub { font-size: 12px; color: #555; margin-top: 6px; }

        .tp-filters { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .tp-filter { padding: 7px 16px; border-radius: 20px; font-size: 13px; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: #777; transition: all 0.15s; }
        .tp-filter:hover { border-color: rgba(124,168,212,0.25); color: #aaa; }
        .tp-filter.active { background: rgba(124,168,212,0.12); border-color: rgba(124,168,212,0.35); color: #7ca8d4; }
        .tp-filter-count { margin-left: 6px; font-size: 11px; opacity: 0.7; }

        .tp-list { display: flex; flex-direction: column; gap: 10px; }
        .tp-row { display: grid; grid-template-columns: 56px 1fr auto; align-items: center; gap: 18px; padding: 20px 22px; border-radius: 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); transition: border-color 0.2s; }
        .tp-row:hover { border-color: rgba(255,255,255,0.12); }
        .tp-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tp-title { font-size: 15px; font-weight: 500; color: #e8e4dc; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tp-meta { font-size: 12px; color: #4a4a4a; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .tp-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: #333; }
        .tp-right { text-align: right; flex-shrink: 0; }
        .tp-amount { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 400; color: #f0ebe0; line-height: 1; }
        .tp-badge { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; font-size: 10px; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }
        .tp-cancel { margin-top: 8px; font-size: 11px; color: #e07070; background: none; border: 1px solid rgba(224,112,112,0.2); padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .tp-cancel:hover { background: rgba(224,112,112,0.08); border-color: rgba(224,112,112,0.4); }
        .tp-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

        .tp-empty { text-align: center; padding: 70px 40px; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08); }
        .tp-empty-icon { width: 64px; height: 64px; background: rgba(124,168,212,0.06); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }

        .tp-error { background: rgba(224,112,112,0.07); border: 1px solid rgba(224,112,112,0.18); border-radius: 12px; padding: 14px 20px; color: #e07070; font-size: 13px; margin-bottom: 24px; }

        .tp-toast { position: fixed; bottom: 28px; right: 28px; padding: 14px 22px; border-radius: 12px; font-size: 13px; font-weight: 500; z-index: 9999; animation: tp-slide-in 0.25s ease; }
        .tp-toast.success { background: rgba(74,168,125,0.95); color: #fff; }
        .tp-toast.error   { background: rgba(224,112,112,0.95); color: #fff; }
        @keyframes tp-slide-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .tp-spinner { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #7ca8d4; animation: tp-spin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes tp-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Toast ── */}
      {toast && <div className={`tp-toast ${toast.type}`}>{toast.msg}</div>}

      {/* ── Summary cards ── */}
      <div className="tp-summary">
        <div className="tp-card" style={{ background: 'rgba(124,168,212,0.07)', border: '1px solid rgba(124,168,212,0.18)' }}>
          <div className="tp-card-label">Total Transactions</div>
          <div className="tp-card-value" style={{ color: '#7ca8d4' }}>{paiements.length}</div>
          <div className="tp-card-sub">All time</div>
        </div>
        <div className="tp-card" style={{ background: 'rgba(74,168,125,0.07)', border: '1px solid rgba(74,168,125,0.18)' }}>
          <div className="tp-card-label">Confirmed Payments</div>
          <div className="tp-card-value" style={{ color: '#4aa87d' }}>
            {confirmedTotal.toLocaleString()} <span style={{ fontSize: 16 }}>DT</span>
          </div>
          <div className="tp-card-sub">{confirmedCount} transaction{confirmedCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="tp-card" style={{ background: 'rgba(200,168,110,0.07)', border: '1px solid rgba(200,168,110,0.18)' }}>
          <div className="tp-card-label">Pending Payments</div>
          <div className="tp-card-value" style={{ color: '#c8a86e' }}>
            {pendingTotal.toLocaleString()} <span style={{ fontSize: 16 }}>DT</span>
          </div>
          <div className="tp-card-sub">{pendingCount} awaiting confirmation</div>
        </div>
        <div className="tp-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="tp-card-label">Total Spent</div>
          <div className="tp-card-value" style={{ color: '#f0ebe0' }}>
            {(confirmedTotal + pendingTotal).toLocaleString()} <span style={{ fontSize: 16, color: '#555' }}>DT</span>
          </div>
          <div className="tp-card-sub">Confirmed + pending</div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && <div className="tp-error">⚠️ {error}</div>}

      {/* ── Filter tabs ── */}
      <div className="tp-filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`tp-filter${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="tp-filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* ── Transaction list ── */}
      {loading ? (
        <div className="tp-spinner" />
      ) : visible.length === 0 ? (
        <div className="tp-empty">
          <div className="tp-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div style={{ fontSize: 17, color: '#888', marginBottom: 8 }}>
            {filter === 'all' ? 'No payments yet' : `No ${filter === 'confirme' ? 'confirmed' : 'pending'} payments`}
          </div>
          <div style={{ fontSize: 13, color: '#555' }}>
            {filter === 'all'
              ? 'Your transaction history will appear here once you enroll in a paid course.'
              : 'Switch to "All" to see your complete history.'}
          </div>
        </div>
      ) : (
        <div className="tp-list">
          {visible.map(p => {
            const meta   = STATUS[p.statut] || STATUS.en_attente;
            const isPending = p.statut === 'en_attente';
            const formationTitle = p.formation?.titre || 'Course Payment';
            const centre  = p.formation?.centreNom || '';
            const method  = p.methodePaiement || 'carte';

            return (
              <div key={p._id} className="tp-row">
                {/* Icon */}
                <div
                  className="tp-icon"
                  style={{ background: `${meta.color}12`, color: meta.color }}
                >
                  <MethodIcon method={method} />
                </div>

                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  <div className="tp-title">{formationTitle}</div>
                  <div className="tp-meta">
                    {centre && <span>{centre}</span>}
                    {centre && <span className="tp-meta-dot" />}
                    <span>{METHOD_LABEL[method] || method}</span>
                    <span className="tp-meta-dot" />
                    <span>{formatDate(p.createdAt)}</span>
                    {p.inscriptionId && (
                      <>
                        <span className="tp-meta-dot" />
                        <span style={{ color: '#333', fontSize: 11 }}>
                          ID: {String(p._id).slice(-6).toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount + badge + cancel */}
                <div className="tp-right">
                  <div className="tp-amount">
                    {(p.montant || 0).toLocaleString()}
                    <span style={{ fontSize: 13, color: '#555', marginLeft: 4 }}>DT</span>
                  </div>
                  <div
                    className="tp-badge"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <span>{meta.icon}</span>
                    {meta.label}
                  </div>
                  {isPending && (
                    <div>
                      <button
                        className="tp-cancel"
                        disabled={cancelingId === p._id}
                        onClick={() => handleCancel(p._id)}
                      >
                        {cancelingId === p._id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ApprenantLayout>
  );
}
