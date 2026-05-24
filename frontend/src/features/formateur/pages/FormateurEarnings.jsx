import { useState, useEffect } from 'react';
import FormateurLayout from '../components/FormateurLayout';
import client from '../../../services/client';
import { formateurPaymentService } from '../../responsableCF/services/formateurPayment';

const STATUT_STYLES = {
  en_attente: { color: '#c8a86e', bg: 'rgba(200,168,110,0.12)', label: 'Pending' },
  paye: { color: '#4aa87d', bg: 'rgba(74,168,125,0.12)', label: 'Paid' },
  refuse: { color: '#e07070', bg: 'rgba(224,112,112,0.12)', label: 'Refused' },
};

export default function FormateurEarnings() {
  const [contrats, setContrats] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contratsRes, paymentsRes] = await Promise.all([
        client.get('/formateur-paiements/contrats/mine'),
        client.get('/formateur-paiements/payments/mine'),
      ]);
      setContrats(contratsRes.data.data || []);
      setPayments(paymentsRes.data.data || []);
    } catch {
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConfirm = async (id) => {
    try {
      await formateurPaymentService.confirmContrat(id);
      setContrats(prev => prev.map(c => c._id === id ? { ...c, statut: 'actif' } : c));
    } catch {
      setError('Failed to confirm contract');
    }
  };

  const totalEarned = payments.filter(p => p.statut === 'paye').reduce((s, p) => s + p.montant, 0);
  const pendingAmount = payments.filter(p => p.statut === 'en_attente').reduce((s, p) => s + p.montant, 0);

  if (loading) {
    return (
      <FormateurLayout title="My <em>Earnings</em>" subtitle="Track your payments and contracts">
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--border-main)', borderTopColor: '#b4915a', animation: 'spin 0.8s linear infinite', margin: '40px auto' }} />
      </FormateurLayout>
    );
  }

  return (
    <FormateurLayout title="My <em>Earnings</em>" subtitle="Track your payments and contracts">
      <style>{`
        .fe-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .fe-stat-card { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; padding: 20px; }
        .fe-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #b4915a; }
        .fe-stat-lbl { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
        .fe-card { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .fe-card-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .fe-card-info { flex: 1; }
        .fe-card-title { font-size: 14px; font-weight: 500; color: var(--text-primary); }
        .fe-card-sub { font-size: 12px; color: #555; margin-top: 2px; }
        .fe-card-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .fe-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .fe-amount { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #b4915a; white-space: nowrap; }
        .fe-empty { text-align: center; padding: 40px; color: #555; font-size: 14px; }
        .fe-confirm-btn { background: linear-gradient(135deg, #b4915a, #c8a86e); color: #fff; border: none; border-radius: 20px; padding: 6px 18px; font-size: 12px; font-weight: 600; cursor: pointer; letter-spacing: 0.04em; text-transform: uppercase; transition: opacity .2s; white-space: nowrap; }
        .fe-confirm-btn:hover { opacity: .85; }
        .fe-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .fe-section-title { font-size: 16px; font-weight: 500; color: var(--text-primary); margin-bottom: 16px; margin-top: 32px; }
        .fe-section-title:first-of-type { margin-top: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {error && <div className="fe-error">{error}</div>}

      <div className="fe-stats">
        <div className="fe-stat-card">
          <div className="fe-stat-val">{totalEarned} DT</div>
          <div className="fe-stat-lbl">Total Earned</div>
        </div>
        <div className="fe-stat-card">
          <div className="fe-stat-val">{pendingAmount} DT</div>
          <div className="fe-stat-lbl">Pending</div>
        </div>
        <div className="fe-stat-card">
          <div className="fe-stat-val">{payments.filter(p => p.statut === 'paye').length}</div>
          <div className="fe-stat-lbl">Payments Received</div>
        </div>
        <div className="fe-stat-card">
          <div className="fe-stat-val">{contrats.filter(c => c.statut === 'actif').length}</div>
          <div className="fe-stat-lbl">Active Contracts</div>
        </div>
      </div>

      {/* Pending Contracts */}
      {contrats.filter(c => c.statut === 'en_attente').length > 0 && (
        <>
          <div className="fe-section-title">Pending Confirmation</div>
          {contrats.filter(c => c.statut === 'en_attente').map(c => (
            <div key={c._id} className="fe-card">
              <div className="fe-card-left">
                <div className="fe-card-info">
                  <div className="fe-card-title">{c.centreId?.nom || 'Centre'}</div>
                  <div className="fe-card-sub">
                    Per Lesson · {c.prixParLecon} DT/lesson
                  </div>
                </div>
              </div>
              <div className="fe-card-right">
                <span className="fe-badge" style={{ background: 'rgba(200,168,110,0.12)', color: '#c8a86e' }}>Pending</span>
                <button className="fe-confirm-btn" onClick={() => handleConfirm(c._id)}>Confirm</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Active Contracts */}
      <div className="fe-section-title">Active Contracts</div>
      {contrats.filter(c => c.statut === 'actif').length === 0 ? (
        <div className="fe-empty">No active contracts.</div>
      ) : contrats.filter(c => c.statut === 'actif').map(c => (
        <div key={c._id} className="fe-card">
          <div className="fe-card-left">
            <div className="fe-card-info">
              <div className="fe-card-title">{c.centreId?.nom || 'Centre'}</div>
                  <div className="fe-card-sub">
                    Per Lesson · {c.prixParLecon} DT/lesson
                  </div>
            </div>
          </div>
          <div className="fe-card-right">
            <span className="fe-badge" style={{ background: 'rgba(74,168,125,0.12)', color: '#4aa87d' }}>Active</span>
          </div>
        </div>
      ))}

      {/* Payment History */}
      <div className="fe-section-title">Payment History</div>
      {payments.length === 0 ? (
        <div className="fe-empty">No payments yet.</div>
      ) : payments.map(p => {
        const st = STATUT_STYLES[p.statut] || STATUT_STYLES.en_attente;
        return (
          <div key={p._id} className="fe-card">
            <div className="fe-card-left">
              <div className="fe-card-info">
                <div className="fe-card-title">{p.leconTitre || 'Fixed Payment'} {p.formationTitre ? <span style={{ color: '#888', fontWeight: 300 }}>— {p.formationTitre}</span> : ''}</div>
                <div className="fe-card-sub">{p.centreId?.nom} · {new Date(p.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
            <div className="fe-card-right">
              <span className="fe-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
              <span className="fe-amount">{p.montant} DT</span>
            </div>
          </div>
        );
      })}
    </FormateurLayout>
  );
}
