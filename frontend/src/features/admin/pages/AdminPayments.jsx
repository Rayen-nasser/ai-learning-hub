import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import centreService from '../../centres/services/centres';
import AdminLayout from '../components/AdminLayout';

export default function AdminPayments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingPaymentId, setConfirmingPaymentId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'paid'

  const fetchCentres = async () => {
    setLoading(true);
    try {
      const res = await centreService.getAdminAll();
      // Only keep centres that have at least applied for payment (pending or paid) or have an unpaid status.
      // For this page, we'll focus on payments.
      setCentres(res.data.data || []);
    } catch (err) {
      setError(t('admin.failedLoadCentres') || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const handleConfirm = async (id) => {
    if (!window.confirm(t('admin.confirmPaymentPrompt') || 'Are you sure you want to confirm this payment?')) return;
    setConfirmingPaymentId(id);
    try {
      await centreService.confirmPayment(id);
      await fetchCentres();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  const paymentList = centres.filter(c => {
    if (filter === 'all') return c.paiementStatus === 'pending' || c.paiementStatus === 'paid';
    return c.paiementStatus === filter;
  });

  const stats = {
    total: centres.filter(c => c.paiementStatus === 'pending' || c.paiementStatus === 'paid').length,
    pending: centres.filter(c => c.paiementStatus === 'pending').length,
    paid: centres.filter(c => c.paiementStatus === 'paid').length,
  };

  return (
    <AdminLayout title={`Centre <em>Payments</em>`} subtitle="Manage and confirm centre creation fees">
      <style>{`
        .ap-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .ap-stat { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; padding: 16px 20px; }
        .ap-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; color: #b4915a; }
        .ap-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-top: 4px; }
        
        .ap-tabs { display: flex; gap: 4px; background: var(--bg-card); border-radius: 8px; padding: 4px; margin-bottom: 24px; width: fit-content; }
        .ap-tab { padding: 8px 16px; border: none; background: transparent; color: #555; font-size: 13px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .ap-tab:hover { color: #888; }
        .ap-tab.active { background: rgba(180,145,90,0.15); color: #b4915a; }
        .ap-tab-count { margin-left: 6px; opacity: 0.7; }

        .ap-table-wrap { overflow-x: auto; background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; }
        .ap-table { width: 100%; border-collapse: collapse; }
        .ap-table th { text-align: left; padding: 16px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; border-bottom: 1px solid var(--border-main); background: rgba(255,255,255,0.02); }
        .ap-table td { padding: 16px 20px; border-bottom: 1px solid var(--border-main); font-size: 14px; }
        .ap-table tr:last-child td { border-bottom: none; }
        .ap-table tr:hover td { background: rgba(255,255,255,0.02); }

        .ap-empty { text-align: center; padding: 60px 20px; color: #555; font-size: 15px; }
        .ap-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border-main); border-top-color: #b4915a; animation: apspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes apspin { to { transform: rotate(360deg); } }
        
        .ap-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(125,191,125,0.3); background: transparent; font-family: 'DM Sans', sans-serif; color: #7dbf7d; }
        .ap-btn:hover:not(:disabled) { background: rgba(125,191,125,0.1); }
        .ap-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(224,112,112,0.1)', border: '1px solid rgba(224,112,112,0.3)', borderRadius: '8px', color: '#e07070', fontSize: '14px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="ap-stats">
        <div className="ap-stat"><div className="ap-stat-val">{stats.total}</div><div className="ap-stat-label">Total Payments</div></div>
        <div className="ap-stat"><div className="ap-stat-val" style={{color: '#c8a86e'}}>{stats.pending}</div><div className="ap-stat-label">Pending Verifications</div></div>
        <div className="ap-stat"><div className="ap-stat-val" style={{color: '#7dbf7d'}}>{stats.paid}</div><div className="ap-stat-label">Confirmed Payments</div></div>
      </div>

      <div className="ap-tabs">
        <button className={`ap-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          Pending <span className="ap-tab-count">{stats.pending}</span>
        </button>
        <button className={`ap-tab ${filter === 'paid' ? 'active' : ''}`} onClick={() => setFilter('paid')}>
          Confirmed <span className="ap-tab-count">{stats.paid}</span>
        </button>
        <button className={`ap-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All <span className="ap-tab-count">{stats.total}</span>
        </button>
      </div>

      {loading ? (
        <div className="ap-spinner" />
      ) : paymentList.length === 0 ? (
        <div className="ap-empty">No payments found in this category.</div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Centre Name</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Proof</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentList.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{fontWeight: 500, color: 'var(--text-primary)'}}>{c.nom}</div>
                    <div style={{fontSize: 12, color: '#555'}}>{c.id_responsable?.prenom} {c.id_responsable?.nom}</div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', padding: '3px 10px', borderRadius: 6,
                      fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                      color: 'var(--text-primary)', background: 'rgba(180,145,90,0.1)',
                    }}>
                      {c.methodePaiement === 'carte' ? 'Card' :
                       c.methodePaiement === 'virement' ? 'Bank Transfer' :
                       c.methodePaiement === 'especes' ? 'Cash' :
                       c.methodePaiement || '—'}
                    </span>
                  </td>
                  <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>
                    {c.montant?.toLocaleString() || '0'} DT
                  </td>
                  <td>
                    {c.proofImage ? (
                      <img
                        src={c.proofImage.startsWith('http') ? c.proofImage : `http://localhost:5000${c.proofImage}`}
                        alt="Proof"
                        style={{width: 48, height: 48, borderRadius: 8, objectFit: 'cover', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)'}}
                        onClick={() => window.open(c.proofImage.startsWith('http') ? c.proofImage : `http://localhost:5000${c.proofImage}`, '_blank')}
                      />
                    ) : (
                      <span style={{color: '#555', fontSize: 12}}>—</span>
                    )}
                  </td>
                  <td style={{color: '#555', fontSize: 13}}>
                    {c.datePaiement ? new Date(c.datePaiement).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      color: c.paiementStatus === 'paid' ? '#7dbf7d' : '#c8a86e',
                      background: c.paiementStatus === 'paid' ? 'rgba(125,191,125,0.1)' : 'rgba(200,168,110,0.1)',
                    }}>
                      {c.paiementStatus === 'paid' ? 'Confirmed' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {c.paiementStatus === 'pending' ? (
                      <button
                        className="ap-btn"
                        disabled={confirmingPaymentId === c._id}
                        onClick={() => handleConfirm(c._id)}
                      >
                        {confirmingPaymentId === c._id ? 'Processing...' : '✓ Confirm'}
                      </button>
                    ) : (
                      <button
                        className="ap-btn"
                        style={{ color: '#b4915a', borderColor: 'rgba(180,145,90,0.3)' }}
                        onClick={() => navigate(`/admin/centres/verify/${c._id}`)}
                      >
                        View Demand
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
