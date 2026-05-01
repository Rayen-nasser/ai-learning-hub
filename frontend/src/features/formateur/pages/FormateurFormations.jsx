import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formationService } from '../services/formation';
import FormateurLayout from '../components/FormateurLayout';

export default function FormateurFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await formationService.getMyAssignments();
      setFormations(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch formations', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormateurLayout title="My <em>Formations</em>" subtitle="Manage your assigned training courses">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#555' }}>Loading...</div>
        ) : formations.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>No formations assigned</div>
            <div style={{ fontSize: 14, color: '#555' }}>Contact your centre manager to get assigned to formations</div>
          </div>
        ) : (
          formations.map(f => (
            <Link key={f._id} to={`/formateur/formations/${f._id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'all 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,168,110,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ height: 140, background: 'linear-gradient(135deg, rgba(200,168,110,0.2), rgba(180,145,90,0.1))', position: 'relative' }}>
                  {f.image ? (
                    <img src={f.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span style={{ fontSize: 12, padding: '4px 10px', background: 'rgba(12,12,14,0.9)', borderRadius: 6, color: f.prix === 0 ? '#4aa87d' : '#c8a86e', fontWeight: 500 }}>
                      {f.prix === 0 ? 'Free' : `${f.prix} DT`}
                    </span>
                  </div>
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#f0ebe0', margin: '0 0 8px', fontWeight: 400 }}>
                    {f.titre}
                  </h3>
                  <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
                    {f.centreId?.nom || 'No centre'}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666', marginBottom: 12 }}>
                    <span>{f.duree || 0}h</span>
                    {f.categorieId?.nom && <span>&middot; {f.categorieId.nom}</span>}
                  </div>
                  {f.description && (
                    <p style={{ fontSize: 13, color: '#666', margin: 0, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {f.description}
                    </p>
                  )}
                  <div style={{ marginTop: 16, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#c8a86e', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Manage Lessons
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </FormateurLayout>
  );
}
