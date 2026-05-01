import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inscriptionService } from '../../../services/api';
import { useAuth } from '../../../shared/context/AuthContext';
import { LoadingSpinner, StatusBadge, EmptyState } from '../../../shared/components';
import { formatDate } from '../../../shared/utils/format';
import { ROUTES } from '../../../shared/constants/routes';

const MyInscriptions = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    inscriptionService.getMyInscriptions()
      .then((res) => setInscriptions(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <EmptyState
      icon="🎓"
      title="Please sign in to view your enrollments."
      linkTo={ROUTES.LOGIN}
      linkLabel="Sign In"
    />
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .mi-root { font-family: 'DM Sans', sans-serif; color: #e8e4dc; padding-top: 48px; }
        .mi-header { margin-bottom: 40px; }
        .mi-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 4vw, 48px); font-weight: 300; color: #f0ebe0; margin: 0 0 8px; }
        .mi-title em { font-style: italic; color: #b4915a; }
        .mi-subtitle { font-size: 14px; color: #555; }

        .mi-list { display: flex; flex-direction: column; gap: 12px; }
        .mi-card { display: flex; align-items: center; gap: 20px; padding: 20px 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.02); transition: border-color .2s; }
        .mi-card:hover { border-color: rgba(255,255,255,.12); }
        .mi-card-icon { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; background: linear-gradient(135deg, #111114, #1a1a22); border: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: 20px; color: rgba(180,145,90,.5); }
        .mi-card-info { flex: 1; min-width: 0; }
        .mi-card-name { font-size: 15px; font-weight: 500; color: #e8e4dc; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mi-card-date { font-size: 12px; color: #444; }
        .mi-view-link { font-size: 12px; color: #b4915a; text-decoration: none; padding: 6px 14px; border: 1px solid rgba(180,145,90,.2); border-radius: 7px; transition: background .2s; flex-shrink: 0; }
        .mi-view-link:hover { background: rgba(180,145,90,.08); }
        @media (max-width: 600px) { .mi-card { flex-wrap: wrap; } }
      `}</style>

      <div className="mi-root">
        <div className="mi-header">
          <h1 className="mi-title">My <em>Enrollments</em></h1>
          <p className="mi-subtitle">Track your learning progress and course status</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : inscriptions.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No enrollments yet"
            desc="Start learning by enrolling in a course"
            linkTo={ROUTES.FORMATIONS}
            linkLabel="Explore Courses"
          />
        ) : (
          <div className="mi-list">
            {inscriptions.map((ins, i) => (
              <div key={ins._id} className="mi-card">
                <div className="mi-card-icon">{String.fromCharCode(65 + (i % 26))}</div>
                <div className="mi-card-info">
                  <div className="mi-card-name">
                    {ins.formation?.titre || ins.formation?.title || 'Formation'}
                  </div>
                  { (ins.formation?.centreId?.nom || ins.formation?.centre?.nom) && (
                    <div className="mi-card-centre" style={{ fontSize: '11px', color: '#666', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {ins.formation.centreId?.nom || ins.formation.centre?.nom}
                    </div>
                  )}
                  <div className="mi-card-date">{formatDate(ins.createdAt)}</div>
                </div>
                <StatusBadge status={ins.statut || ins.status} />
                {ins.formation?._id && (
                  <Link to={ROUTES.FORMATION_DETAIL(ins.formation._id)} className="mi-view-link">
                    View →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyInscriptions;