import { useState, useEffect } from 'react';
import { inscriptionService, paiementService } from '../services/inscription';
import ResponsableCFLayout from '../components/ResponsableCFLayout';

export default function ResponsableInscriptions() {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await inscriptionService.getCentreInscriptions();
      setInscriptions(res.data.data || []);
    } catch {
      setError('Failed to load inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const [actionLoading, setActionLoading] = useState(null);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await paiementService.confirm(id);
      fetchInscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept inscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this inscription?')) return;
    setActionLoading(id);
    try {
      await inscriptionService.reject(id);
      fetchInscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject inscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (id) => {
    setActionLoading(id);
    try {
      await inscriptionService.reactivate(id);
      fetchInscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reactivate inscription');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInscriptions = statusFilter
    ? inscriptions.filter(i => i.statut === statusFilter)
    : inscriptions;

  const statusColors = {
    'en attente': { bg: 'rgba(200,168,110,.15)', color: '#c8a86e' },
    'acceptee': { bg: 'rgba(74,168,125,.15)', color: '#4aa87d' },
    'refusee': { bg: 'rgba(224,112,112,.15)', color: '#e07070' },
  };

  const statusLabels = {
    'en attente': 'Pending',
    'acceptee': 'Accepted',
    'refusee': 'Rejected',
  };

  return (
    <ResponsableCFLayout title="Inscriptions" subtitle="Manage learner registrations">
      <style>{`
        .ri-filters { display: flex; gap: 12px; margin-bottom: 24px; }
        .ri-select { padding: 10px 16px; background: #1c1c21; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e8e4dc; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; color-scheme: dark; }
        .ri-select:focus { border-color: #e07070; outline: none; }
        .ri-select option { background: #1c1c21; color: #e8e4dc; }

        .ri-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .ri-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px 20px; text-align: center; }
        .ri-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; color: #f0ebe0; }
        .ri-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-top: 4px; }

        .ri-table-wrap { overflow-x: auto; }
        .ri-table { width: 100%; border-collapse: collapse; }
        .ri-table th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ri-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
        .ri-table tr:hover td { background: rgba(255,255,255,0.02); }

        .ri-badge { display: inline-flex; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .ri-apprenant { display: flex; align-items: center; gap: 10px; }
        .ri-avatar { width: 32px; height: 32px; border-radius: 50%; background: rgba(200,168,110,0.15); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #c8a86e; }
        .ri-apprenant-name { font-weight: 500; color: #f0ebe0; }
        .ri-apprenant-email { font-size: 12px; color: #555; }

        .ri-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); background: transparent; font-family: 'DM Sans', sans-serif; }
        .ri-btn-accept { color: #4aa87d; }
        .ri-btn-accept:hover { background: rgba(74,168,125,0.15); }
        .ri-btn-reject { color: #e07070; }
        .ri-btn-reject:hover { background: rgba(224,112,112,0.15); }
        .ri-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ri-empty { text-align: center; padding: 60px 20px; color: #555; }
        .ri-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .ri-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #e07070; animation: rispin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes rispin { to { transform: rotate(360deg); } }
      `}</style>

      {error && <div className="ri-error">{error}</div>}

      <div className="ri-stats">
        <div className="ri-stat">
          <div className="ri-stat-val">{inscriptions.length}</div>
          <div className="ri-stat-label">Total</div>
        </div>
        <div className="ri-stat">
          <div className="ri-stat-val" style={{ color: '#c8a86e' }}>{inscriptions.filter(i => i.statut === 'en attente').length}</div>
          <div className="ri-stat-label">Pending</div>
        </div>
        <div className="ri-stat">
          <div className="ri-stat-val" style={{ color: '#4aa87d' }}>{inscriptions.filter(i => i.statut === 'acceptee').length}</div>
          <div className="ri-stat-label">Accepted</div>
        </div>
        <div className="ri-stat">
          <div className="ri-stat-val" style={{ color: '#e07070' }}>{inscriptions.filter(i => i.statut === 'refusee').length}</div>
          <div className="ri-stat-label">Rejected</div>
        </div>
      </div>

      <div className="ri-filters">
        <select className="ri-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="en attente">Pending</option>
          <option value="acceptee">Accepted</option>
          <option value="refusee">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="ri-spinner" />
      ) : filteredInscriptions.length === 0 ? (
        <div className="ri-empty">No inscriptions found</div>
      ) : (
        <div className="ri-table-wrap">
          <table className="ri-table">
            <thead>
              <tr>
                <th>Learner</th>
                <th>Formation</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInscriptions.map(inscription => (
                <tr key={inscription._id}>
                  <td>
                    <div className="ri-apprenant">
                      <div className="ri-avatar">
                        {inscription.apprenantPrenom?.[0]}{inscription.apprenantNom?.[0]}
                      </div>
                      <div>
                        <div className="ri-apprenant-name">
                          {inscription.apprenantPrenom} {inscription.apprenantNom}
                        </div>
                        {inscription.apprenantEmail && (
                          <div className="ri-apprenant-email">{inscription.apprenantEmail}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{inscription.formationTitre || inscription.formationId || 'Unknown'}</td>
                  <td>
                    <span className="ri-badge" style={statusColors[inscription.statut] || { bg: 'rgba(136,136,136,.15)', color: '#888' }}>
                      {statusLabels[inscription.statut] || inscription.statut}
                    </span>
                  </td>
                  <td style={{ color: '#555' }}>{new Date(inscription.createdAt).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    {inscription.statut === 'en attente' && (
                      <>
                        <button 
                          className="ri-btn ri-btn-accept" 
                          onClick={() => handleAccept(inscription._id)}
                          disabled={actionLoading === inscription._id}
                        >
                          {actionLoading === inscription._id ? '...' : 'Accept'}
                        </button>
                        <button 
                          className="ri-btn ri-btn-reject" 
                          onClick={() => handleReject(inscription._id)}
                          disabled={actionLoading === inscription._id}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {inscription.statut === 'acceptee' && (
                      <button 
                        className="ri-btn ri-btn-reject" 
                        onClick={() => handleReject(inscription._id)}
                        disabled={actionLoading === inscription._id}
                      >
                        Revoke
                      </button>
                    )}
                    {inscription.statut === 'refusee' && (
                      <button 
                        className="ri-btn ri-btn-accept" 
                        onClick={() => handleReactivate(inscription._id)}
                        disabled={actionLoading === inscription._id}
                      >
                        Reactivate
                      </button>
                    )}
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
