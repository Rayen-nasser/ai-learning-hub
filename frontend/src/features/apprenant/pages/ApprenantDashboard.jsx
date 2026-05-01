import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApprenantLayout from '../components/ApprenantLayout';
import { inscriptionService, favoriService, paiementService } from '../../../services/api';
import AICourseRecommender from '../../../shared/components/AICourseRecommender';

export default function ApprenantDashboard() {
  const [inscriptions, setInscriptions] = useState([]);
  const [favoris, setFavoris] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insRes, favRes, payRes] = await Promise.all([
        inscriptionService.getMyInscriptions().catch(() => ({ data: { data: [] } })),
        favoriService.getMyFavoris().catch(() => ({ data: { data: [] } })),
        paiementService.getMyPaiements().catch(() => ({ data: { data: [] } })),
      ]);
      
      setInscriptions(insRes.data.data || []);
      setFavoris(favRes.data.data || []);
      setPaiements(payRes.data.data || []);
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Enrolled Courses',
      value: inscriptions.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      color: '#7ca8d4',
      bg: 'rgba(124,168,212,0.1)',
      link: '/apprenant/formations',
    },
    {
      label: 'Favorites',
      value: favoris.length,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
      color: '#e07070',
      bg: 'rgba(224,112,112,0.1)',
      link: '/apprenant/favoris',
    },
    {
      label: 'Total Spent',
      value: `${paiements.reduce((s, p) => s + (p.montant || 0), 0)} DT`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      color: '#c8a86e',
      bg: 'rgba(200,168,110,0.1)',
      link: '/apprenant/paiements',
    },
  ];

  const recentFormations = inscriptions.slice(0, 3);

  return (
    <ApprenantLayout title="Welcome back, <em>Learner</em>" subtitle="Track your learning journey">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        {stats.map((stat, i) => (
          <Link key={i} to={stat.link} style={{ textDecoration: 'none' }}>
            <div style={{
              background: stat.bg,
              border: `1px solid ${stat.color}30`,
              borderRadius: 16,
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${stat.color}60`}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${stat.color}30`}
            >
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: 32, fontFamily: "'Cormorant Garamond', serif", color: '#f0ebe0', fontWeight: 400 }}>
                  {loading ? '...' : stat.value}
                </div>
                <div style={{ fontSize: 13, color: '#555' }}>{stat.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <AICourseRecommender />

      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: '#f0ebe0', marginBottom: 20, marginTop: 40 }}>
        Recent Enrollments
      </h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>Loading...</div>
      ) : recentFormations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>No enrollments yet</div>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>Start learning by enrolling in a course</div>
          <Link to="/formations" style={{ color: '#7ca8d4', textDecoration: 'none', fontSize: 14 }}>
            Explore Courses →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {recentFormations.filter(f => f.formationId).map(f => (
            <Link key={f._id} to={`/formations/${f.formationId}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,168,212,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(124,168,212,0.2), rgba(100,140,180,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.formationImage ? (
                    <img src={f.formationImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  )}
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#f0ebe0', margin: '0 0 8px', fontWeight: 400 }}>
                    {f.formationTitre || 'Course'}
                  </h3>
                  <div style={{ fontSize: 13, color: '#555' }}>
                    {f.centreNom || ''}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <StatusBadge status={f.statut} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {inscriptions.length > 3 && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/apprenant/formations" style={{ color: '#7ca8d4', textDecoration: 'none', fontSize: 14 }}>
            View All Courses →
          </Link>
        </div>
      )}
    </ApprenantLayout>
  );
}

function StatusBadge({ status }) {
  const statusMeta = {
    acceptee: { label: 'Active', color: '#4aa87d', bg: 'rgba(74,168,125,0.1)' },
    en_attente: { label: 'Pending', color: '#c8a86e', bg: 'rgba(200,168,110,0.1)' },
    refusee: { label: 'Rejected', color: '#e07070', bg: 'rgba(220,110,110,0.1)' },
  };
  
  const meta = statusMeta[status] || statusMeta.en_attente;
  
  return (
    <span style={{
      fontSize: 10,
      padding: '3px 10px',
      borderRadius: 12,
      background: meta.bg,
      color: meta.color,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {meta.label}
    </span>
  );
}
