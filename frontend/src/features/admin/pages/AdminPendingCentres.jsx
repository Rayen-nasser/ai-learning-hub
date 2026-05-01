import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import centreService from '../../centres/services/centres';
import AdminLayout from '../components/AdminLayout';

export default function AdminPendingCentres() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await centreService.getPending('pending,rejected');
      setCentres(res.data.data || []);
    } catch (err) {
      setError('Failed to load pending centers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <AdminLayout title="Center <em>Verification</em>" subtitle="Review and approve training center applications">
      <style>{`
        .ap-list { display: flex; flex-direction: column; gap: 16px; }
        .ap-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 24px; transition: all 0.2s; }
        .ap-card:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); }

        .ap-logo { width: 64px; height: 64px; border-radius: 12px; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
        .ap-logo img { width: 100%; height: 100%; object-fit: cover; }

        .ap-info h3 { font-size: 18px; color: #e8e4dc; margin-bottom: 4px; }
        .ap-meta { display: flex; flex-wrap: wrap; gap: 12px; color: #555; font-size: 13px; }
        .ap-meta span { display: flex; align-items: center; gap: 6px; }

        .ap-btn-review { padding: 10px 24px; border-radius: 10px; background: rgba(180,145,90,0.1); border: 1px solid rgba(180,145,90,0.3); color: #b4915a; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .ap-btn-review:hover { background: #b4915a; color: #0c0c0e; }

        .ap-empty { text-align: center; padding: 100px 40px; color: #555; }
        .ap-empty-icon { font-size: 48px; margin-bottom: 20px; opacity: 0.3; }

        .ap-spinner { width: 32px; height: 32px; border: 2px solid rgba(255,255,255,0.05); border-top-color: #b4915a; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 60px auto; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .ap-card { grid-template-columns: 1fr; text-align: center; justify-items: center; }
          .ap-meta { justify-content: center; }
        }
      `}</style>

      {error && <div className="ap-error">{error}</div>}

      {loading ? (
        <div className="ap-spinner" />
      ) : centres.length === 0 ? (
        <div className="ap-empty">
          <div className="ap-empty-icon">📂</div>
          <h3>No pending applications</h3>
          <p>All training center requests have been processed.</p>
        </div>
      ) : (
        <div className="ap-list">
          {centres.map(centre => (
            <div key={centre._id} className="ap-card">
              <div className="ap-logo">
                {centre.logo ? <img src={centre.logo.startsWith('http') ? centre.logo : `http://localhost:5000/${centre.logo}`} alt="" /> : '🏛️'}
              </div>
              <div className="ap-info">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {centre.nom}
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    background: centre.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    color: centre.status === 'rejected' ? '#ef4444' : '#eab308',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    {centre.status}
                  </span>
                </h3>
                <div className="ap-meta">
                  <span>📍 {centre.adresse}</span>
                  <span>📞 {centre.telephone}</span>
                  <span>📧 {centre.id_responsable?.email}</span>
                  <span>🕒 {new Date(centre.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="ap-btn-review" onClick={() => navigate(`/admin/centres/verify/${centre._id}`)}>
                Review Application
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
