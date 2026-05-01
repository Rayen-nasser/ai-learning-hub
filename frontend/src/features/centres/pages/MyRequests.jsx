import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import centreService from '../services/centres';
import FixDocumentsModal from '../components/FixDocumentsModal';
import ResponsableCFLayout from '../../responsableCF/components/ResponsableCFLayout';

export default function MyRequests() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fixingCentre, setFixingCentre] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isResponsable = location.pathname.startsWith('/responsable');

  const fetchMyCentres = async () => {
    setLoading(true);
    try {
      const res = await centreService.getMyCentres();
      setCentres(res.data.data || []);
    } catch (err) {
      setError('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCentres();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { color: '#7dbf7d', bg: 'rgba(125,191,125,0.1)' };
      case 'rejected': return { color: '#e07070', bg: 'rgba(224,112,112,0.1)' };
      default: return { color: '#c8a86e', bg: 'rgba(200,168,110,0.1)' };
    }
  };

  return (
    <ResponsableCFLayout 
      title={isResponsable ? "My <em>Applications</em>" : null} 
      subtitle={isResponsable ? "Track the status of your training centre verification requests." : null}
    >
      <div className="mr-container" style={isResponsable ? { maxWidth: '100%', margin: '0', padding: '0' } : {}}>
      <style>{`
        .mr-container { max-width: 1000px; margin: 40px auto; padding: 0 24px; font-family: 'DM Sans', sans-serif; }
        .mr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .mr-header h1 { font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #e8e4dc; }
        .mr-btn-apply { padding: 10px 20px; border-radius: 10px; background: #b4915a; color: #0c0c0e; font-weight: 600; text-decoration: none; font-size: 14px; transition: all 0.2s; }
        .mr-btn-apply:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(180,145,90,0.2); }

        .mr-list { display: flex; flex-direction: column; gap: 16px; }
        .mr-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; transition: all 0.2s; }
        .mr-card:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }

        .mr-logo { width: 64px; height: 64px; border-radius: 12px; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
        .mr-logo img { width: 100%; height: 100%; object-fit: cover; }
        
        .mr-info { flex: 1; min-width: 0; }
        .mr-name { font-size: 18px; font-weight: 500; color: #e8e4dc; margin-bottom: 4px; }
        .mr-meta { display: flex; gap: 12px; color: #555; font-size: 13px; }
        
        .mr-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .mr-actions { display: flex; gap: 10px; }
        .mr-btn-fix { padding: 8px 16px; border-radius: 8px; border: 1px solid #e07070; color: #e07070; background: none; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        .mr-btn-fix:hover { background: rgba(224,112,112,0.1); }
        
        .mr-reason { margin-top: 16px; padding: 12px 16px; background: rgba(224,112,112,0.05); border-left: 3px solid #e07070; border-radius: 4px; font-size: 13px; color: #aaa; width: 100%; }
        .mr-reason strong { color: #e07070; margin-right: 8px; }

        .mr-empty { text-align: center; padding: 80px 40px; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.06); border-radius: 24px; }
        .mr-empty h3 { color: #888; font-family: 'Cormorant Garamond', serif; font-size: 24px; margin-bottom: 12px; }
        .mr-empty p { color: #555; margin-bottom: 24px; }

        .mr-spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.05); border-top-color: #b4915a; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 60px auto; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .mr-card { flex-direction: column; align-items: flex-start; text-align: left; }
          .mr-actions { width: 100%; margin-top: 8px; }
          .mr-btn-fix { width: 100%; }
        }
      `}</style>

      <div className="mr-header" style={isResponsable ? { justifyContent: 'flex-end', marginBottom: '24px' } : {}}>
        {!isResponsable && <h1>My Applications</h1>}
        <button onClick={() => navigate('/centres/apply')} className="mr-btn-apply">+ New Application</button>
      </div>

      {loading ? (
        <div className="mr-spinner" />
      ) : centres.length === 0 ? (
        <div className="mr-empty">
          <h3>No applications yet</h3>
          <p>You haven't submitted any training center verification requests.</p>
          <button onClick={() => navigate('/centres/apply')} className="mr-btn-apply">Start Application</button>
        </div>
      ) : (
        <div className="mr-list">
          {centres.map(centre => {
            const style = getStatusStyle(centre.status);
            return (
              <div key={centre._id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="mr-card">
                  <div className="mr-logo">
                    {centre.logo ? <img src={centre.logo} alt="" onError={e => { e.target.style.display='none'; }} /> : '🏛️'}
                  </div>
                  <div className="mr-info">
                    <div className="mr-name">{centre.nom}</div>
                    <div className="mr-meta">
                      <span>{centre.adresse}</span>
                      <span>&bull;</span>
                      <span>Applied on {new Date(centre.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mr-status" style={{ color: style.color, background: style.bg }}>
                    {centre.status}
                  </div>
                  {(centre.status === 'rejected' || centre.documents?.some(d => d.status === 'invalid')) && (
                    <div className="mr-actions">
                      <button className="mr-btn-fix" onClick={() => setFixingCentre(centre)}>
                        {centre.documents?.some(d => d.status === 'invalid')
                          ? `Fix Documents (${centre.documents.filter(d => d.status === 'invalid').length} invalid)`
                          : 'Fix Documents'}
                      </button>
                    </div>
                  )}
                </div>
                {/* Overall rejection reason */}
                {centre.status === 'rejected' && centre.adminMessage && (
                  <div className="mr-reason">
                    <strong>Rejection Reason:</strong>
                    {centre.adminMessage}
                  </div>
                )}
                {/* Per-document invalid feedback */}
                {centre.documents?.some(d => d.status === 'invalid') && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {centre.documents.filter(d => d.status === 'invalid').map(doc => (
                      <div key={doc.docId || doc._id} style={{ padding: '10px 16px', background: 'rgba(224,112,112,0.05)', border: '1px solid rgba(224,112,112,0.15)', borderLeft: '3px solid #e07070', borderRadius: '8px', fontSize: '13px', color: '#aaa' }}>
                        <span style={{ color: '#e07070', fontWeight: 600 }}>⚠️ {doc.label || doc.type}: </span>
                        {doc.adminNote ? `${doc.adminNote} — ` : ''}
                        <span style={{ color: '#b4915a' }}>Please re-upload this document.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {fixingCentre && (
        <FixDocumentsModal 
          centre={fixingCentre} 
          onClose={() => setFixingCentre(null)} 
          onRefresh={fetchMyCentres} 
        />
      )}
      </div>
    </ResponsableCFLayout>
  );
}
