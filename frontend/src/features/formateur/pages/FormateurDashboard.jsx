import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formationService } from '../services/formation';
import { leconService } from '../services/lecon';
import FormateurLayout from '../components/FormateurLayout';

export default function FormateurDashboard() {
  const [formations, setFormations] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const formationsRes = await formationService.getMyAssignments();
      setFormations(formationsRes.data.data || []);
      
      const allLessons = [];
      for (const f of formationsRes.data.data || []) {
        try {
          const lessonsRes = await leconService.getAll({ formationId: f._id });
          allLessons.push(...(lessonsRes.data.data || []));
        } catch (e) {
          console.warn('Failed to fetch lessons for formation', e);
        }
      }
      setLessons(allLessons);
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Assigned Formations',
      value: formations.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      color: '#c8a86e',
      bg: 'rgba(200,168,110,0.1)',
    },
    {
      label: 'Total Lessons',
      value: lessons.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      color: '#7ca8d4',
      bg: 'rgba(124,168,212,0.1)',
    },
  ];

  return (
    <FormateurLayout title="Welcome back, <em>Formateur</em>">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: stat.bg,
            border: `1px solid ${stat.color}30`,
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{ color: stat.color }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 32, fontFamily: "'Cormorant Garamond', serif", color: '#f0ebe0', fontWeight: 400 }}>
                {loading ? '...' : stat.value}
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: '#f0ebe0', marginBottom: 20 }}>
        My Formations
      </h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading...</div>
      ) : formations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>No formations assigned yet</div>
          <div style={{ fontSize: 14, color: '#555' }}>You will be able to manage lessons once a formation is assigned to you</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {formations.map(f => (
            <Link key={f._id} to={`/formateur/formations/${f._id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,168,110,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(200,168,110,0.2), rgba(180,145,90,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.image ? (
                    <img src={f.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  )}
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#f0ebe0', margin: '0 0 8px', fontWeight: 400 }}>
                    {f.titre}
                  </h3>
                  <div style={{ fontSize: 13, color: '#555' }}>
                    {f.centreId?.nom || 'No centre'} &middot; {f.duree || 0}h
                  </div>
                  {f.categorieId?.nom && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(200,168,110,0.1)', borderRadius: 4, color: '#c8a86e' }}>
                        {f.categorieId.nom}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </FormateurLayout>
  );
}
