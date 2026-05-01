import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formationService, categorieService } from '../../../services/api';
import { useAuth } from '../../../shared/context/AuthContext';
import AICourseRecommender from '../../../shared/components/AICourseRecommender';

const CATEGORY_ICONS = ['✦', '◈', '⊕', '◉', '⬡', '⟁', '⊞', '⬖'];

const Home = () => {
  const { user } = useAuth();
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([formationService.getAll(), categorieService.getAll()])
      .then(([fRes, cRes]) => {
        setFormations(fRes.data.data || fRes.data);
        setCategories(cRes.data.data || cRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="home-spinner" />
    </div>
  );

  const stats = [
    { value: formations.length || '200+', label: 'Courses' },
    { value: categories.length || '20+', label: 'Categories' },
    { value: '5K+', label: 'Students' },
    { value: '98%', label: 'Satisfaction' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .home-root {
          font-family: 'DM Sans', sans-serif;
          color: #e8e4dc;
        }

        .home-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.06);
          border-top-color: #b4915a;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ══ HERO ══ */
        .hero {
          padding: 96px 0 80px;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 60% 0%, rgba(180,145,90,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 80% at 10% 100%, rgba(100,80,180,0.05) 0%, transparent 50%);
        }
        .hero-grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: linear-gradient(to bottom, transparent, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 70%, transparent);
        }
        .hero-content { position: relative; max-width: 700px; }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #b4915a; margin-bottom: 28px;
          padding: 6px 14px;
          border: 1px solid rgba(180,145,90,0.25);
          border-radius: 40px;
          background: rgba(180,145,90,0.06);
        }
        .hero-eyebrow-dot { width: 5px; height: 5px; border-radius: 50%; background: #b4915a; }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 6vw, 80px);
          font-weight: 300;
          line-height: 1.05;
          color: #f0ebe0;
          margin: 0 0 24px;
          letter-spacing: -0.01em;
        }
        .hero-title em {
          font-style: italic;
          color: #b4915a;
        }

        .hero-desc {
          font-size: 16px; line-height: 1.75; color: #666;
          max-width: 480px; margin-bottom: 44px; font-weight: 300;
        }

        .hero-cta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 10px;
          background: linear-gradient(135deg, #b4915a, #c8a86e);
          color: #0c0c0e; font-size: 14px; font-weight: 500;
          letter-spacing: 0.04em; text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(180,145,90,0.25);
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 24px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          color: #888; font-size: 14px; text-decoration: none;
          transition: color 0.2s, border-color 0.2s;
        }
        .btn-ghost:hover { color: #e8e4dc; border-color: rgba(255,255,255,0.2); }

        /* ══ STATS ══ */
        .stats-row {
          display: flex; gap: 0;
          margin-top: 64px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 40px;
        }
        .stat-item {
          flex: 1; padding-right: 32px;
          border-right: 1px solid rgba(255,255,255,0.06);
          margin-right: 32px;
        }
        .stat-item:last-child { border-right: none; margin-right: 0; padding-right: 0; }
        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px; font-weight: 400; color: #f0ebe0;
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label { font-size: 12px; color: #555; letter-spacing: 0.1em; text-transform: uppercase; }

        /* ══ SECTION HEADER ══ */
        .section { padding: 80px 0 0; }
        .section-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 40px;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 400; color: #f0ebe0;
          margin: 0; line-height: 1.1;
        }
        .section-title span { font-style: italic; color: #b4915a; }
        .section-link {
          font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #b4915a; text-decoration: none;
          display: flex; align-items: center; gap: 6px;
          transition: gap 0.2s;
        }
        .section-link:hover { gap: 10px; }

        /* ══ FEATURES ══ */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
        @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }

        .feature-card {
          padding: 36px 32px;
          background: rgba(255,255,255,0.02);
          transition: background 0.3s;
        }
        .feature-card:hover { background: rgba(255,255,255,0.04); }
        .feature-icon {
          width: 44px; height: 44px; border-radius: 12px;
          border: 1px solid rgba(180,145,90,0.2);
          background: rgba(180,145,90,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; margin-bottom: 20px;
        }
        .feature-title { font-size: 16px; font-weight: 500; color: #e8e4dc; margin-bottom: 8px; }
        .feature-desc { font-size: 13px; color: #555; line-height: 1.7; font-weight: 300; }

        /* ══ CATEGORIES ══ */
        .cats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }
        .cat-card {
          padding: 20px 16px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          display: block;
        }
        .cat-card:hover {
          border-color: rgba(180,145,90,0.3);
          background: rgba(180,145,90,0.04);
          transform: translateY(-2px);
        }
        .cat-icon { font-size: 20px; color: #b4915a; margin-bottom: 10px; font-family: monospace; }
        .cat-name { font-size: 13px; color: #aaa; font-weight: 400; }
        .cat-card:hover .cat-name { color: #e8e4dc; }

        /* ══ COURSE CARDS ══ */
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .course-card {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          background: rgba(255,255,255,0.02);
          overflow: hidden;
          text-decoration: none;
          display: flex; flex-direction: column;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .course-card:hover {
          border-color: rgba(180,145,90,0.25);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .course-thumb {
          height: 150px;
          background: linear-gradient(135deg, #111114 0%, #1a1a22 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .course-thumb-glow {
          position: absolute;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(180,145,90,0.2) 0%, transparent 70%);
        }
        .course-thumb-label {
          position: absolute; top: 12px; left: 12px;
          padding: 4px 10px; border-radius: 6px;
          background: rgba(180,145,90,0.15);
          border: 1px solid rgba(180,145,90,0.25);
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #b4915a;
        }
        .course-glyph {
          font-size: 40px; opacity: 0.15; color: #b4915a;
          font-family: 'Cormorant Garamond', serif;
        }
        .course-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        .course-title {
          font-size: 15px; font-weight: 500; color: #e8e4dc;
          margin-bottom: 6px; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .course-card:hover .course-title { color: #f5f0e8; }
        .course-desc {
          font-size: 12px; color: #555; line-height: 1.6;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          margin-bottom: 16px; flex: 1; font-weight: 300;
        }
        .course-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .course-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 400; color: #b4915a;
        }
        .course-price-unit { font-size: 12px; color: #555; margin-left: 2px; font-family: 'DM Sans', sans-serif; }
        .course-meta { font-size: 12px; color: #444; }

        /* ══ CTA BANNER ══ */
        .cta-banner {
          margin-top: 80px;
          padding: 64px 56px;
          border-radius: 20px;
          background: linear-gradient(145deg, #111114 0%, #161620 100%);
          border: 1px solid rgba(255,255,255,0.07);
          position: relative; overflow: hidden;
          text-align: center;
        }
        .cta-banner-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(180,145,90,0.1) 0%, transparent 60%);
        }
        .cta-banner-content { position: relative; }
        .cta-banner-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 52px); font-weight: 300;
          color: #f0ebe0; margin-bottom: 16px; line-height: 1.1;
        }
        .cta-banner-desc { font-size: 15px; color: #666; margin-bottom: 36px; font-weight: 300; }
        .cta-banner-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 600px) {
          .hero { padding: 60px 0 48px; }
          .stats-row { flex-wrap: wrap; gap: 24px; }
          .stat-item { border: none; margin: 0; min-width: calc(50% - 12px); }
          .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .cta-banner { padding: 40px 24px; }
        }
      `}</style>

      <div className="home-root">
        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grid-lines" />
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Professional Learning Platform
            </div>
            <h1 className="hero-title">
              Knowledge that<br/><em>shapes</em> futures
            </h1>
            <p className="hero-desc">
              Discover expertly curated courses taught by industry professionals.
              Learn at your own pace and unlock your full potential.
            </p>
              <div className="hero-cta">
              <Link to="/formations" className="btn-primary">
                Explore Courses
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              {!user && <Link to="/register" className="btn-ghost">Create Account</Link>}
            </div>

            {/* Stats */}
            <div className="stats-row">
              {stats.map((s, i) => (
                <div key={i} className="stat-item">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <AICourseRecommender />
        </section>

        {/* FEATURES */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Why choose <span>Forma</span></h2>
          </div>
          <div className="features-grid">
            {[
              { icon: '🎓', title: 'Expert Instructors', desc: 'Learn from industry professionals with decades of real-world experience across diverse fields.' },
              { icon: '⏱', title: 'Flexible Learning', desc: 'Study at your own pace, on any device. No schedules, no pressure — your journey, your timeline.' },
              { icon: '🏅', title: 'Certificates', desc: 'Earn recognized certificates upon completion to showcase your skills to employers worldwide.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        {categories.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Browse by <span>Category</span></h2>
              <Link to="/formations" className="section-link">All courses →</Link>
            </div>
            <div className="cats-grid">
              {categories.map((cat, i) => (
                <Link key={cat._id} to={`/formations?categorieId=${cat._id}`} className="cat-card">
                  <div className="cat-icon">{CATEGORY_ICONS[i % CATEGORY_ICONS.length]}</div>
                  <div className="cat-name">{cat.nom || cat.name}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FEATURED COURSES */}
        {formations.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Featured <span>Courses</span></h2>
              <Link to="/formations" className="section-link">View all →</Link>
            </div>
            <div className="courses-grid">
              {formations.slice(0, 8).map((f, i) => (
                <Link key={f._id} to={`/formations/${f._id}`} className="course-card">
                  <div className="course-thumb">
                    <div className="course-thumb-glow" />
                    <span className="course-thumb-label">{f.categorie?.nom || 'Course'}</span>
                    <div className="course-glyph">{String.fromCharCode(65 + (i % 26))}</div>
                  </div>
                  <div className="course-body">
                    <div className="course-title">{f.titre || f.title}</div>
                    { (f.centreId?.nom || f.centre?.nom) && (
                      <div className="course-centre" style={{ fontSize: '10px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {f.centreId?.nom || f.centre?.nom}
                      </div>
                    )}
                    <div className="course-desc">{f.description}</div>
                    <div className="course-footer">
                      <div>
                        <span className="course-price">{f.prix || f.price}</span>
                        <span className="course-price-unit">DT</span>
                      </div>
                      <span className="course-meta">{f.duree || f.duration}h</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA BANNER */}
        <div className="cta-banner">
          <div className="cta-banner-bg" />
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">Ready to start learning?</h2>
            <p className="cta-banner-desc">Join thousands of students already building their future with Forma.</p>
            <div className="cta-banner-btns">
              {!user && <Link to="/register" className="btn-primary">Start for free</Link>}
              <Link to="/formations" className="btn-ghost">Browse courses</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;