import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { centreService, favoriService } from '../../../services/api';
import { useAuth } from '../../../shared/context/AuthContext';

const Centres = () => {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    centreService.getAll()
      .then((res) => setCentres(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      favoriService.getMyFavoris()
        .then((res) => {
          const favs = res.data.data || res.data;
          setFavorites(favs.filter(f => f.typeCible === 'centreFormation').map(f => f.cibleId));
        })
        .catch(console.error);
    }
  }, [user]);

  const toggleFavorite = async (centreId, e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/centres' } } });
      return;
    }

    const isFav = favorites.includes(centreId);
    try {
      if (isFav) {
        const fav = await favoriService.getMyFavoris();
        const allFavs = fav.data.data || fav.data;
        const targetFav = allFavs.find(f => f.cibleId === centreId && f.typeCible === 'centreFormation');
        if (targetFav) {
          await favoriService.remove(targetFav._id);
          setFavorites(favorites.filter(id => id !== centreId));
        }
      } else {
        await favoriService.add({ cibleId: centreId, typeCible: 'centreFormation' });
        setFavorites([...favorites, centreId]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .ct-root { font-family: 'DM Sans', sans-serif; color: #e8e4dc; padding-top: 48px; }
        .ct-header { margin-bottom: 48px; }
        .ct-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 5vw, 56px); font-weight: 300; color: #f0ebe0; margin: 0 0 12px; }
        .ct-title em { font-style: italic; color: #b4915a; }
        .ct-subtitle { font-size: 14px; color: #555; font-weight: 300; }

        .ct-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

        .ct-card {
          border: 1px solid rgba(255,255,255,0.07); border-radius: 14px;
          background: rgba(255,255,255,0.02); overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .ct-card:hover { border-color: rgba(180,145,90,0.25); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }

        .ct-card-header {
          padding: 28px 28px 20px;
          background: linear-gradient(135deg, #111114, #161620);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: flex-start; gap: 16px;
          position: relative;
        }
        .ct-fav-btn {
          position: absolute; top: 16px; right: 16px;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
          color: #555;
        }
        .ct-fav-btn:hover { background: rgba(255,255,255,0.1); color: #888; }
        .ct-fav-btn.active { background: rgba(220,100,100,0.15); border-color: rgba(220,100,100,0.3); color: #e07070; }
        .ct-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(180,145,90,0.1); border: 1px solid rgba(180,145,90,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .ct-name { font-size: 17px; font-weight: 500; color: #e8e4dc; margin-bottom: 4px; }
        .ct-address { font-size: 12px; color: #555; display: flex; align-items: center; gap: 5px; }

        .ct-card-body { padding: 20px 28px 24px; }
        .ct-description { font-size: 13px; color: #666; line-height: 1.7; font-weight: 300; margin-bottom: 20px; min-height: 40px; }

        .ct-details { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .ct-detail { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
        .ct-detail-icon { color: #444; flex-shrink: 0; }

        .ct-view-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 8px;
          background: rgba(180,145,90,0.1); border: 1px solid rgba(180,145,90,0.25);
          color: #b4915a; font-size: 13px; text-decoration: none;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          transition: background 0.2s, transform 0.15s;
        }
        .ct-view-btn:hover { background: rgba(180,145,90,0.18); transform: translateY(-1px); }

        .ct-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #b4915a; animation: ctspin 0.8s linear infinite; margin: 80px auto; display: block; }
        @keyframes ctspin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ct-root">
        <div className="ct-header">
          <h1 className="ct-title">Training <em>Centers</em></h1>
          <p className="ct-subtitle">Find a professional training center near you</p>
        </div>

        {loading ? <div className="ct-spinner" /> : (
          <div className="ct-grid">
            {centres.map((centre) => (
              <div key={centre._id} className="ct-card">
                <div className="ct-card-header">
                  <button
                    className={`ct-fav-btn ${favorites.includes(centre._id) ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(centre._id, e)}
                    title={favorites.includes(centre._id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(centre._id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </button>
                  <div className="ct-icon">🏢</div>
                  <div>
                    <div className="ct-name">{centre.nom || centre.name}</div>
                    {(centre.adresse || centre.address) && (
                      <div className="ct-address">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {centre.adresse || centre.address}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ct-card-body">
                  <p className="ct-description">{centre.description || 'Professional training center offering a wide range of courses.'}</p>
                  <div className="ct-details">
                    {(centre.telephone || centre.phone) && (
                      <div className="ct-detail">
                        <svg className="ct-detail-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.49 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.39 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.08 6.08l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                        {centre.telephone || centre.phone}
                      </div>
                    )}
                    {centre.email && (
                      <div className="ct-detail">
                        <svg className="ct-detail-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        {centre.email}
                      </div>
                    )}
                  </div>
                  <Link to={`/formations?centreId=${centre._id}`} className="ct-view-btn">
                    View Courses →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Centres;
