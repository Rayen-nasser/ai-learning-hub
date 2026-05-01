import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriService } from '../../../services/api';
import { useAuth } from '../../../shared/context/AuthContext';

const MyFavoris = () => {
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      favoriService.getMyFavoris()
        .then((res) => setFavoris(res.data.data || res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleRemove = async (id) => {
    try {
      await favoriService.remove(id);
      setFavoris(f => f.filter(fav => fav._id !== id));
    } catch (err) { console.error(err); }
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'DM Sans, sans-serif', color: '#555' }}>
      <p style={{ marginBottom: 16, color: '#666' }}>Please sign in to view your favorites.</p>
      <Link to="/login" style={{ color: '#b4915a', fontWeight: 500 }}>Sign In</Link>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .mf-root { font-family: 'DM Sans', sans-serif; color: #e8e4dc; padding-top: 48px; }
        .mf-header { margin-bottom: 40px; }
        .mf-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 4vw, 48px); font-weight: 300; color: #f0ebe0; margin: 0 0 8px; }
        .mf-title em { font-style: italic; color: #b4915a; }
        .mf-subtitle { font-size: 14px; color: #555; }

        .mf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

        .mf-card {
          border: 1px solid rgba(255,255,255,0.07); border-radius: 14px;
          background: rgba(255,255,255,0.02); overflow: hidden;
          display: flex; flex-direction: column;
          transition: border-color 0.25s, transform 0.2s;
        }
        .mf-card:hover { border-color: rgba(180,145,90,0.2); transform: translateY(-2px); }

        .mf-card-thumb {
          height: 120px;
          background: linear-gradient(135deg, #111114, #1a1a22);
          display: flex; align-items: center; justify-content: center;
          position: relative; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .mf-thumb-glyph { font-family: 'Cormorant Garamond', serif; font-size: 56px; color: rgba(180,145,90,0.12); font-weight: 300; }

        .mf-card-body { padding: 18px 20px; flex: 1; }
        .mf-card-title {
          font-size: 15px; font-weight: 500; color: #e8e4dc; margin-bottom: 6px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .mf-card-desc {
          font-size: 12px; color: #555; line-height: 1.6; font-weight: 300; margin-bottom: 16px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .mf-card-footer {
          display: flex; gap: 8px;
          padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.05);
        }
        .mf-view-btn {
          flex: 1; padding: 9px 12px; border-radius: 8px; text-align: center;
          background: rgba(180,145,90,0.1); border: 1px solid rgba(180,145,90,0.2);
          color: #b4915a; font-size: 13px; text-decoration: none;
          transition: background 0.2s; display: inline-block;
        }
        .mf-view-btn:hover { background: rgba(180,145,90,0.18); }
        .mf-remove-btn {
          padding: 9px 12px; border-radius: 8px;
          background: rgba(220,80,80,0.07); border: 1px solid rgba(220,80,80,0.15);
          color: #c07070; font-size: 13px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, color 0.2s;
        }
        .mf-remove-btn:hover { background: rgba(220,80,80,0.15); color: #e07070; }

        .mf-empty { text-align: center; padding: 80px 24px; color: #444; }
        .mf-empty-icon { font-size: 44px; margin-bottom: 16px; opacity: 0.3; }
        .mf-explore-link { color: #b4915a; text-decoration: none; font-size: 14px; font-weight: 500; border: 1px solid rgba(180,145,90,0.3); padding: 10px 20px; border-radius: 8px; display: inline-block; margin-top: 16px; }

        .mf-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #b4915a; animation: mfspin 0.8s linear infinite; margin: 80px auto; display: block; }
        @keyframes mfspin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="mf-root">
        <div className="mf-header">
          <h1 className="mf-title">My <em>Favorites</em></h1>
          <p className="mf-subtitle">{favoris.length} saved course{favoris.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? <div className="mf-spinner" /> : favoris.length === 0 ? (
          <div className="mf-empty">
            <div className="mf-empty-icon">♡</div>
            <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>No favorites yet</div>
            <div style={{ fontSize: 13 }}>Save courses you're interested in</div>
            <Link to="/formations" className="mf-explore-link">Browse Courses</Link>
          </div>
        ) : (
          <div className="mf-grid">
            {favoris.map((fav, i) => (
              <div key={fav._id} className="mf-card">
                <div className="mf-card-thumb">
                  <div className="mf-thumb-glyph">{String.fromCharCode(65 + (i % 26))}</div>
                </div>
                <div className="mf-card-body">
                  <div style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', background: 'rgba(180,145,90,0.1)', color: '#b4915a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>
                    {fav.typeCible === 'formation' ? 'Course' : fav.typeCible === 'lecon' ? 'Lesson' : fav.typeCible === 'centreFormation' ? 'Training Center' : (fav.typeCible || 'Item')}
                  </div>
                  <div className="mf-card-title">{fav.cibleTitre || 'Untitled Item'}</div>
                  <div className="mf-card-desc">Saved on {fav.createdAt ? new Date(fav.createdAt).toLocaleDateString('en-GB') : 'N/A'}</div>
                </div>
                <div className="mf-card-footer">
                  {fav.typeCible === 'centreFormation' ? (
                    <Link to={`/centers/${fav.cibleId}`} className="mf-view-btn">View Center</Link>
                  ) : fav.typeCible === 'lecon' ? (
                    <Link to={`/formations`} className="mf-view-btn">View Lesson</Link>
                  ) : (
                    <Link to={`/formations/${fav.cibleId}`} className="mf-view-btn">View Course</Link>
                  )}
                  <button className="mf-remove-btn" onClick={() => handleRemove(fav._id)} title="Remove from favorites">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyFavoris;