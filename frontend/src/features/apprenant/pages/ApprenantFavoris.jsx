import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApprenantLayout from '../components/ApprenantLayout';
import { favoriService } from '../../../services/api';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function ApprenantFavoris() {
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await favoriService.getMyFavoris();
      setFavoris(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch favorites', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e, favoriId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await favoriService.remove(favoriId);
      setFavoris(prev => prev.filter(f => f._id !== favoriId));
    } catch (e) {
      console.error('Failed to remove favorite', e);
    }
  };

  const allFavoris = favoris.filter(fav => fav.cibleId);

  const getIcon = (type) => {
    switch (type) {
      case 'formation': return '📚';
      case 'centreFormation': return '🏢';
      case 'formateur': return '👨‍🏫';
      default: return '💙';
    }
  };

  const getTargetLink = (fav) => {
    switch (fav.typeCible) {
      case 'formation': return `/formations/${fav.cibleId}`;
      case 'centreFormation': return `/formations?centreId=${fav.cibleId}`;
      case 'formateur': return `/formations?formateurId=${fav.cibleId}`;
      default: return '#';
    }
  };

  return (
    <ApprenantLayout title="My <em>Favorites</em>" subtitle="Items you've saved for later">
      {loading ? (
        <LoadingSpinner />
      ) : allFavoris.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>💙</div>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>No favorites yet</div>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
            Save courses, centers or instructors you like to view them later
          </div>
          <Link to="/formations" style={{ color: '#b4915a', textDecoration: 'none', fontSize: 14 }}>
            Explore Courses →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {allFavoris.map(fav => (
            <div key={fav._id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              overflow: 'hidden',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(180,145,90,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ height: 120, position: 'relative', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                  {getIcon(fav.typeCible)}
                </div>
                <button
                  onClick={(e) => handleRemove(e, fav._id)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(220,100,100,0.1)',
                    border: '1px solid rgba(220,100,100,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: '#e07070'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e07070'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,100,100,0.1)'; e.currentTarget.style.color = '#e07070'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
              
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', background: 'rgba(180,145,90,0.1)', color: '#b4915a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600, width: 'fit-content' }}>
                  {fav.typeCible === 'formation' ? 'Course' : fav.typeCible === 'centreFormation' ? 'Training Center' : fav.typeCible === 'formateur' ? 'Instructor' : fav.typeCible}
                </div>
                
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: '#f0ebe0', margin: '0 0 12px', fontWeight: 400, flex: 1 }}>
                  {fav.cibleTitre || 'Untitled Item'}
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <Link 
                    to={getTargetLink(fav)}
                    style={{
                      fontSize: 12,
                      color: '#b4915a',
                      textDecoration: 'none',
                      padding: '7px 16px',
                      border: '1px solid rgba(180,145,90,0.3)',
                      borderRadius: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,145,90,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    View Details →
                  </Link>
                  <span style={{ fontSize: 10, color: '#444' }}>
                    {fav.createdAt && new Date(fav.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ApprenantLayout>
  );
}
