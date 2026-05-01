import { useState, useEffect } from 'react';
import { paymentService } from '../services/payment';
import ResponsableCFLayout from '../components/ResponsableCFLayout';

export default function ResponsablePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const filteredPayments = statusFilter
    ? payments.filter(p => p.statut === statusFilter)
    : payments;

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
        .rp-select { padding: 10px 16px; background: #1c1c21; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e8e4dc; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; color-scheme: dark; }
        .rp-select:focus { border-color: #4aa87d; outline: none; }
        .rp-select option { background: #1c1c21; color: #e8e4dc; }

        .rp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .rp-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px 24px; }
        .rp-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; color: #f0ebe0; }
        .rp-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-top: 4px; }

        .rp-table-wrap { overflow-x: auto; }
        .rp-table { width: 100%; border-collapse: collapse; }
        .rp-table th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .rp-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
        .rp-table tr:hover td { background: rgba(255,255,255,0.02); }

        .rp-badge { display: inline-flex; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .rp-amount { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #4aa87d; }
        .rp-amount.pending { color: #c8a86e; }

        .rp-actions { display: flex; gap: 8px; }
        .rp-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); background: transparent; font-family: 'DM Sans', sans-serif; }
        .rp-btn-confirm { color: #4aa87d; }
        .rp-btn-confirm:hover { background: rgba(74,168,125,0.15); }
        .rp-btn-cancel { color: #e07070; }
        .rp-btn-cancel:hover { background: rgba(224,112,112,0.15); }

        .rp-empty { text-align: center; padding: 60px 20px; color: #555; }
        .rp-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .rp-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #4aa87d; animation: rspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes rspin { to { transform: rotate(360deg); } }
      `}</style>

      {error && <div className="rp-error">{error}</div>}

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
                    <div style={{ fontWeight: 500, color: '#f0ebe0' }}>
                      {payment.apprenantPrenom} {payment.apprenantNom}
                    </div>
                  </td>
                  <td>{payment.formationTitre || 'Unknown'}</td>
                  <td>
                    <span className={`rp-amount ${payment.statut === 'en_attente' ? 'pending' : ''}`}>
                      {payment.montant} DT
                    </span>
                  </td>
                  <td style={{ color: '#555' }}>{methodLabels[payment.methodePaiement] || payment.methodePaiement}</td>
                  <td>
                    <span className="rp-badge" style={statusColors[payment.statut] || {}}>
                      {statusColors[payment.statut]?.label || payment.statut}
                    </span>
                  </td>
                  <td style={{ color: '#555' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="rp-actions">
                      {payment.statut === 'en_attente' && (
                        <>
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
