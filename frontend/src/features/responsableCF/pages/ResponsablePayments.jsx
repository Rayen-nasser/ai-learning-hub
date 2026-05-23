import { useState, useEffect } from 'react';
import { paymentService } from '../services/payment';
import ResponsableCFLayout from '../components/ResponsableCFLayout';

export default function ResponsablePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [imageModal, setImageModal] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentService.getCentrePayments();
      setPayments(res.data.data || []);
    } catch {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await paymentService.confirm(id);
      fetchPayments();
    } catch {
      setError('Failed to confirm payment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this payment?')) return;
    try {
      await paymentService.cancel(id);
      fetchPayments();
    } catch {
      setError('Failed to cancel payment');
    }
  };

  const sortedPayments = [...payments].sort((a, b) => {
    // Pending payments first, then by newest
    if (a.statut === 'en_attente' && b.statut !== 'en_attente') return -1;
    if (a.statut !== 'en_attente' && b.statut === 'en_attente') return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredPayments = statusFilter
    ? sortedPayments.filter(p => p.statut === statusFilter)
    : sortedPayments;

  const confirmedTotal = payments.filter(p => p.statut === 'confirmé').reduce((sum, p) => sum + (p.montant || 0), 0);
  const pendingTotal = payments.filter(p => p.statut === 'en_attente').reduce((sum, p) => sum + (p.montant || 0), 0);

  const statusColors = {
    'en_attente': { bg: 'rgba(200,168,110,.15)', color: '#c8a86e', label: 'Pending' },
    'confirmé': { bg: 'rgba(74,168,125,.15)', color: '#4aa87d', label: 'Confirmed' },
  };

  const methodLabels = {
    'carte': 'Card',
    'virement': 'Transfer',
    'especes': 'Cash',
  };

  return (
    <ResponsableCFLayout title="Payments" subtitle="Track revenue and transactions">
      <style>{`
        .rp-filters { display: flex; gap: 12px; margin-bottom: 24px; }
        .rp-select { padding: 10px 16px; background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 8px; color: var(--text-primary); font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; color-scheme: light; }
        .rp-select:focus { border-color: #4aa87d; outline: none; }
        .rp-select option { background: var(--bg-card); color: var(--text-primary); }

        .rp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .rp-stat { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; padding: 20px 24px; }
        .rp-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; color: var(--text-primary); }
        .rp-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); margin-top: 4px; }

        .rp-table-wrap { overflow-x: auto; }
        .rp-table { width: 100%; border-collapse: collapse; }
        .rp-table th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); border-bottom: 1px solid var(--border-main); }
        .rp-table td { padding: 14px 16px; border-bottom: 1px solid var(--bg-card); font-size: 14px; }
        .rp-table tr:hover td { background: var(--bg-card); }

        .rp-badge { display: inline-flex; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .rp-amount { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #4aa87d; }
        .rp-amount.pending { color: #c8a86e; }

        .rp-actions { display: flex; gap: 8px; }
        .rp-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-main); background: transparent; font-family: 'DM Sans', sans-serif; }
        .rp-btn-confirm { color: #4aa87d; }
        .rp-btn-confirm:hover { background: rgba(74,168,125,0.15); }
        .rp-btn-cancel { color: #c62828; }
        .rp-btn-cancel:hover { background: rgba(198,40,40,0.12); }
        .rp-btn-view { color: #c8a86e; }
        .rp-btn-view:hover { background: rgba(200,168,110,0.15); }

        .rp-empty { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
        .rp-error { padding: 12px 16px; background: rgba(198,40,40,0.08); border: 1px solid rgba(198,40,40,0.2); border-radius: 8px; color: #c62828; font-size: 14px; margin-bottom: 20px; }
        .rp-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border-main); border-top-color: #4aa87d; animation: rspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes rspin { to { transform: rotate(360deg); } }
        .rp-proof-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; cursor: pointer; transition: transform 0.15s; border: 1px solid var(--border-main); }
        .rp-proof-thumb:hover { transform: scale(1.15); }
        .rp-image-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 40px; animation: fadeIn 0.2s ease; }
        .rp-image-modal { position: relative; max-width: 80vw; max-height: 80vh; background: var(--bg-card); border-radius: 12px; padding: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .rp-image-full { display: block; width: 100%; height: auto; max-height: 70vh; object-fit: contain; border-radius: 8px; }
        .rp-image-close { position: absolute; top: -12px; right: -12px; width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--bg-card); color: var(--text-primary); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2); line-height: 1; }
      `}</style>

      {error && <div className="rp-error">{error}</div>}

      {imageModal && (
        <div className="rp-image-overlay" onClick={() => setImageModal(null)}>
          <div className="rp-image-modal">
            <button className="rp-image-close" onClick={() => setImageModal(null)}>×</button>
            <img src={imageModal} alt="Payment proof" className="rp-image-full" />
          </div>
        </div>
      )}

      <div className="rp-stats">
        <div className="rp-stat">
          <div className="rp-stat-val">{payments.length}</div>
          <div className="rp-stat-label">Total Transactions</div>
        </div>
        <div className="rp-stat">
          <div className="rp-stat-val" style={{ color: '#4aa87d' }}>{confirmedTotal.toLocaleString()} DT</div>
          <div className="rp-stat-label">Confirmed Revenue</div>
        </div>
        <div className="rp-stat">
          <div className="rp-stat-val" style={{ color: '#c8a86e' }}>{pendingTotal.toLocaleString()} DT</div>
          <div className="rp-stat-label">Pending Amount</div>
        </div>
      </div>

      <div className="rp-filters">
        <select className="rp-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="en_attente">Pending</option>
          <option value="confirmé">Confirmed</option>
        </select>
      </div>

      {loading ? (
        <div className="rp-spinner" />
      ) : filteredPayments.length === 0 ? (
        <div className="rp-empty">No payments found</div>
      ) : (
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Learner</th>
                <th>Formation</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment._id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {payment.apprenantPrenom} {payment.apprenantNom}
                    </div>
                  </td>
                  <td>{payment.formation?.titre || 'Unknown'}</td>
                  <td>
                    <span className={`rp-amount ${payment.statut === 'en_attente' ? 'pending' : ''}`}>
                      {payment.montant} DT
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{methodLabels[payment.methodePaiement] || payment.methodePaiement}</td>
                  <td>
                    <span className="rp-badge" style={statusColors[payment.statut] || {}}>
                      {statusColors[payment.statut]?.label || payment.statut}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="rp-actions">
                      {payment.statut === 'en_attente' && (
                        <>
                          {payment.methodePaiement === 'virement' && payment.proofImage && (
                            <button className="rp-btn rp-btn-view" onClick={() => setImageModal(`http://localhost:5000${payment.proofImage}`)}>View Receipt</button>
                          )}
                          <button className="rp-btn rp-btn-confirm" onClick={() => handleConfirm(payment._id)}>Confirm</button>
                          <button className="rp-btn rp-btn-cancel" onClick={() => handleCancel(payment._id)}>Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ResponsableCFLayout>
  );
}
