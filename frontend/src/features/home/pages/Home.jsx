import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formationService, categorieService } from '../../../services/api';
import client from '../../../services/client';
import { useAuth } from '../../../shared/context/AuthContext';
import AICourseRecommender from '../../../shared/components/AICourseRecommender';

const CATEGORY_ICONS = ['✦', '◈', '⊕', '◉', '⬡', '⟁', '⊞', '⬖'];

const Home = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dynamicStats, setDynamicStats] = useState({
    students: '0',
    formations: '0',
    categories: '0',
    satisfaction: '0%',
    enrollments: '0'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      formationService.getAll(),
      categorieService.getAll(),
      client.get('/public/stats').catch(() => ({ data: { data: {} } }))
    ])
      .then(([fRes, cRes, statsRes]) => {
        setFormations(fRes.data?.data || fRes.data || []);
        setCategories(cRes.data?.data || cRes.data || []);
        if (statsRes.data?.data && statsRes.data.data.students) {
          setDynamicStats(statsRes.data.data);
        }
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
    { value: dynamicStats.formations || formations.length || '200+', label: t('home.stats.courses') },
    { value: dynamicStats.categories || categories.length || '20+', label: t('home.stats.categories') },
    { value: dynamicStats.students || '5K+', label: t('home.stats.students') },
    { value: dynamicStats.satisfaction || '98%', label: t('home.stats.satisfaction') },
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
          padding: 110px 0 90px;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 90% 70% at 65% -10%, rgba(180,145,90,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 60% 90% at 5% 110%, rgba(100,80,200,0.07) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 90% 80%, rgba(180,145,90,0.05) 0%, transparent 60%);
        }
        .hero-orb {
          position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px);
        }
        .hero-orb-1 { width: 500px; height: 500px; top: -200px; right: -100px; background: rgba(180,145,90,0.08); animation: orbFloat 8s ease-in-out infinite; }
        .hero-orb-2 { width: 300px; height: 300px; bottom: -100px; left: 20%; background: rgba(100,80,200,0.06); animation: orbFloat 10s ease-in-out infinite reverse; }
        @keyframes orbFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-30px)} }
        .hero-grid-lines {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(to bottom, transparent, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.4) 80%, transparent);
        }
        .hero-content { position: relative; max-width: 720px; }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #c8a86e; margin-bottom: 32px;
          padding: 8px 18px;
          border: 1px solid rgba(180,145,90,0.3);
          border-radius: 40px;
          background: rgba(180,145,90,0.08);
          backdrop-filter: blur(10px);
          animation: fadeSlideUp 0.7s ease both;
        }
        .hero-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #c8a86e; box-shadow: 0 0 8px rgba(200,168,110,0.8); animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 6.5vw, 88px);
          font-weight: 300;
          line-height: 1.03;
          color: #f0ebe0;
          margin: 0 0 28px;
          letter-spacing: -0.02em;
          animation: fadeSlideUp 0.7s 0.1s ease both;
        }
        .hero-title em { font-style: italic; background: linear-gradient(135deg,#c8a86e,#e8c87a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }

        .hero-desc {
          font-size: 17px; line-height: 1.8; color: #777;
          max-width: 500px; margin-bottom: 48px; font-weight: 300;
          animation: fadeSlideUp 0.7s 0.2s ease both;
        }

        .hero-cta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; animation: fadeSlideUp 0.7s 0.3s ease both; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 32px; border-radius: 12px;
          background: linear-gradient(135deg, #b4915a 0%, #d4a96a 50%, #c8a86e 100%);
          color: #0c0c0e; font-size: 14px; font-weight: 600;
          letter-spacing: 0.04em; text-decoration: none;
          transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
          box-shadow: 0 4px 24px rgba(180,145,90,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
        }
        .btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 32px rgba(180,145,90,0.5); }
        .btn-primary:active { transform: translateY(-1px); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 28px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          color: #888; font-size: 14px; text-decoration: none;
          transition: all 0.2s; backdrop-filter: blur(8px);
          background: rgba(255,255,255,0.02);
        }
        .btn-ghost:hover { color: #e8e4dc; border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); transform: translateY(-1px); }

        /* ══ STATS ══ */
        .stats-row {
          display: flex; gap: 0;
          margin-top: 72px;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 48px;
          animation: fadeSlideUp 0.7s 0.4s ease both;
        }
        .stat-item {
          flex: 1; padding-right: 32px;
          border-right: 1px solid rgba(255,255,255,0.07);
          margin-right: 32px;
          transition: transform 0.2s;
        }
        .stat-item:hover { transform: translateY(-2px); }
        .stat-item:last-child { border-right: none; margin-right: 0; padding-right: 0; }
        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px; font-weight: 400;
          background: linear-gradient(135deg,#f0ebe0,#c8a86e);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          line-height: 1; margin-bottom: 6px;
        }
        .stat-label { font-size: 11px; color: #555; letter-spacing: 0.12em; text-transform: uppercase; }

        /* ══ SECTION HEADER ══ */
        .section { padding: 88px 0 0; }
        .section-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 44px;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px; font-weight: 400; color: #f0ebe0;
          margin: 0; line-height: 1.1;
        }
        .section-title span { font-style: italic; background: linear-gradient(135deg,#c8a86e,#e8c87a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .section-link {
          font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;
          color: #b4915a; text-decoration: none;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s; border-bottom: 1px solid transparent;
          padding-bottom: 2px;
        }
        .section-link:hover { gap: 10px; border-bottom-color: rgba(180,145,90,0.4); }

        /* ══ FEATURES ══ */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; }
        @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }

        .feature-card {
          padding: 40px 36px;
          background: rgba(255,255,255,0.015);
          transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(180,145,90,0.06) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.4s;
        }
        .feature-card:hover { background: rgba(255,255,255,0.035); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon {
          width: 48px; height: 48px; border-radius: 14px;
          border: 1px solid rgba(180,145,90,0.25);
          background: linear-gradient(135deg, rgba(180,145,90,0.12), rgba(180,145,90,0.04));
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(180,145,90,0.1);
          transition: transform 0.3s;
        }
        .feature-card:hover .feature-icon { transform: scale(1.1) rotate(-3deg); }
        .feature-title { font-size: 17px; font-weight: 500; color: #e8e4dc; margin-bottom: 10px; }
        .feature-desc { font-size: 13px; color: #555; line-height: 1.75; font-weight: 300; }

        /* ══ CATEGORIES ══ */
        .cats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
        }
        .cat-card {
          padding: 24px 20px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
          display: block;
          position: relative; overflow: hidden;
        }
        .cat-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(180,145,90,0.05) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s;
        }
        .cat-card:hover {
          border-color: rgba(180,145,90,0.35);
          background: rgba(180,145,90,0.04);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(180,145,90,0.1);
        }
        .cat-card:hover::after { opacity: 1; }
        .cat-icon { font-size: 22px; color: #c8a86e; margin-bottom: 12px; font-family: monospace; transition: transform 0.3s; }
        .cat-card:hover .cat-icon { transform: scale(1.2) rotate(5deg); }
        .cat-name { font-size: 13px; color: #888; font-weight: 400; transition: color 0.2s; }
        .cat-card:hover .cat-name { color: #e8e4dc; }

        /* ══ COURSE CARDS ══ */
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 22px;
        }
        .course-card {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          background: rgba(255,255,255,0.02);
          overflow: hidden;
          text-decoration: none;
          display: flex; flex-direction: column;
          transition: all 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .course-card:hover {
          border-color: rgba(180,145,90,0.3);
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(180,145,90,0.1);
        }
        .course-thumb {
          height: 160px;
          background: linear-gradient(135deg, #111114 0%, #1c1c24 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .course-thumb-glow {
          position: absolute;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(180,145,90,0.25) 0%, transparent 70%);
          transition: transform 0.4s;
        }
        .course-card:hover .course-thumb-glow { transform: scale(1.4); }
        .course-thumb-label {
          position: absolute; top: 12px; left: 12px;
          padding: 4px 10px; border-radius: 6px;
          background: rgba(180,145,90,0.15);
          border: 1px solid rgba(180,145,90,0.3);
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #c8a86e; backdrop-filter: blur(8px);
        }
        .course-glyph {
          font-size: 44px; opacity: 0.12; color: #b4915a;
          font-family: 'Cormorant Garamond', serif;
          transition: opacity 0.3s, transform 0.4s;
        }
        .course-card:hover .course-glyph { opacity: 0.22; transform: scale(1.1) rotate(-5deg); }
        .course-body { padding: 22px; flex: 1; display: flex; flex-direction: column; }
        .course-title {
          font-size: 15px; font-weight: 500; color: #e8e4dc;
          margin-bottom: 6px; line-height: 1.45;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          transition: color 0.2s;
        }
        .course-card:hover .course-title { color: #f5f0e8; }
        .course-desc {
          font-size: 12px; color: #555; line-height: 1.65;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          margin-bottom: 18px; flex: 1; font-weight: 300;
        }
        .course-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .course-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 400;
          background: linear-gradient(135deg,#c8a86e,#e8c87a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .course-price-unit { font-size: 12px; color: #555; margin-left: 2px; font-family: 'DM Sans', sans-serif; }
        .course-meta { font-size: 11px; color: #444; display: flex; align-items: center; gap: 4px; }

        /* ══ CTA BANNER ══ */
        .cta-banner {
          margin-top: 88px;
          padding: 80px 64px;
          border-radius: 24px;
          background: linear-gradient(145deg, #111116 0%, #17171f 50%, #111116 100%);
          border: 1px solid rgba(255,255,255,0.08);
          position: relative; overflow: hidden;
          text-align: center;
        }
        .cta-banner-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 80% at 50% -20%, rgba(180,145,90,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 20% 100%, rgba(100,80,200,0.06) 0%, transparent 60%);
        }
        .cta-banner-lines {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.4), transparent);
        }
        .cta-banner-content { position: relative; }
        .cta-banner-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 4vw, 56px); font-weight: 300;
          color: #f0ebe0; margin-bottom: 18px; line-height: 1.1;
        }
        .cta-banner-title em { font-style: italic; background: linear-gradient(135deg,#c8a86e,#e8c87a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .cta-banner-desc { font-size: 15px; color: #666; margin-bottom: 40px; font-weight: 300; max-width: 480px; margin-left: auto; margin-right: auto; }
        .cta-banner-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 600px) {
          .hero { padding: 72px 0 56px; }
          .stats-row { flex-wrap: wrap; gap: 28px; }
          .stat-item { border: none; margin: 0; min-width: calc(50% - 14px); }
          .section-header { flex-direction: column; align-items: flex-start; gap: 14px; }
          .cta-banner { padding: 48px 28px; }
          .courses-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="home-root">
        {/* HERO */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid-lines" />
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              {t('home.badge')}
            </div>
            <h1 className="hero-title">
              {t('home.heroTitle')}<br/><em>{t('home.heroTitleEm')}</em> {t('home.heroTitleSuffix')}
            </h1>
            <p className="hero-desc">
              {t('home.heroDesc')}
            </p>
            <div className="hero-cta">
              <Link to="/formations" className="btn-primary">
                {t('home.exploreCourses')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              {!user && <Link to="/register" className="btn-ghost">{t('home.createAccount')}</Link>}
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
            <h2 className="section-title">{t('home.whyChoose')} <span>Forma</span></h2>
          </div>
          <div className="features-grid">
            {[
              { icon: '🎓', title: t('home.features.instructors'), desc: t('home.features.instructorsDesc') },
              { icon: '⏱', title: t('home.features.flexible'), desc: t('home.features.flexibleDesc') },
              { icon: '🏅', title: t('home.features.certificates'), desc: t('home.features.certificatesDesc') },
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
              <h2 className="section-title">{t('home.browseByCategory')} <span>{t('home.categoryEm')}</span></h2>
              <Link to="/formations" className="section-link">{t('home.allCourses')}</Link>
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
              <h2 className="section-title">{t('home.featuredCourses')} <span>{t('home.featuredCoursesEm')}</span></h2>
              <Link to="/formations" className="section-link">{t('home.viewAll')}</Link>
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
                      <span className="course-meta">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {f.duree || f.duration}h
                      </span>
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
          <div className="cta-banner-lines" />
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">{t('home.ctaTitle')}</h2>
            <p className="cta-banner-desc">{t('home.ctaDesc')}</p>
            <div className="cta-banner-btns">
              {!user && <Link to="/register" className="btn-primary">{t('home.startFree')}</Link>}
              <Link to="/formations" className="btn-ghost">{t('home.browseCourses')}</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;