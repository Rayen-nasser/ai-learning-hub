import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ApprenantLayout from '../components/ApprenantLayout';
import { inscriptionService } from '../../../services/api';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function ApprenantFormations() {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await inscriptionService.getMyInscriptions();
      setInscriptions(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch inscriptions', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredInscriptions = inscriptions.filter(ins => {
    if (filter === 'all') return true;
    return ins.statut === filter;
  });

  const statusCounts = {
    all: inscriptions.length,
    acceptee: inscriptions.filter(i => i.statut === 'acceptee').length,
    en_attente: inscriptions.filter(i => i.statut === 'en_attente').length,
    refusee: inscriptions.filter(i => i.statut === 'refusee').length,
  };

  const filterTabs = [
    { key: 'all',       label: t('apprenant.filterAll') },
    { key: 'acceptee',  label: t('apprenant.statusActive') },
    { key: 'en_attente',label: t('apprenant.statusPending') },
    { key: 'refusee',   label: t('apprenant.statusRejected') },
  ];

  return (
    <ApprenantLayout title={`${t('nav.myCourses').replace('Mes ','')} <em>${t('apprenant.coursesEm')}</em>`} subtitle={t('apprenant.manageEnrollments')}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: filter === tab.key ? '1px solid rgba(124,168,212,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: filter === tab.key ? 'rgba(124,168,212,0.15)' : 'rgba(255,255,255,0.02)',
              color: filter === tab.key ? '#7ca8d4' : '#888',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label} ({statusCounts[tab.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredInscriptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>{t('apprenant.noCoursesFound')}</div>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
            {filter !== 'all' ? t('apprenant.tryDifferentFilter') : t('apprenant.startLearning')}
          </div>
          {filter === 'all' && (
            <Link to="/formations" style={{ color: '#7ca8d4', textDecoration: 'none', fontSize: 14 }}>
              {t('home.exploreCourses')} →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredInscriptions.filter(ins => ins.formationId).map(ins => (
            <Link 
                  key={ins._id} 
                  to={ins.statut === 'acceptee' ? `/apprenant/learn/${ins.formationId}` : '/apprenant/paiements'} 
                  style={{ textDecoration: 'none' }}
                >
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
                <div style={{ height: 140, background: 'linear-gradient(135deg, rgba(124,168,212,0.15), rgba(100,140,180,0.08))', position: 'relative' }}>
                  {ins.formationImage ? (
                    <img src={ins.formationImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <StatusBadge status={ins.statut} />
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: '#f0ebe0', margin: '0 0 8px', fontWeight: 400 }}>
                    {ins.formationTitre || 'Course'}
                  </h3>
                  <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                    {ins.centreNom || ''}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#444' }}>
                      {ins.duree || 0}h total
                    </span>
                    <span style={{ color: '#7ca8d4', fontSize: 12 }}>
                      {ins.statut === 'acceptee' ? t('apprenant.continueLearning') : t('apprenant.viewPayment')} →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ApprenantLayout>
  );
}

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const statusMeta = {
    acceptee:   { label: t('apprenant.statusActive'),   color: '#4aa87d', bg: 'rgba(74,168,125,0.15)' },
    en_attente: { label: t('apprenant.statusPending'),  color: '#c8a86e', bg: 'rgba(200,168,110,0.15)' },
    refusee:    { label: t('apprenant.statusRejected'), color: '#e07070', bg: 'rgba(220,110,110,0.15)' },
  };
  
  const meta = statusMeta[status] || statusMeta.en_attente;
  
  return (
    <span style={{
      fontSize: 10,
      padding: '4px 10px',
      borderRadius: 12,
      background: meta.bg,
      color: meta.color,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 500,
    }}>
      {meta.label}
    </span>
  );
}
