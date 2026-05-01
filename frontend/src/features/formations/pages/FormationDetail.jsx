import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formationService, leconService, avisService, inscriptionService, favoriService, contentService, paiementService } from '../../../services/api';
import { useAuth } from '../../../shared/context/AuthContext';

/* ── Star rating component ── */
const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button"
          disabled={readonly}
          style={{ background: 'none', border: 'none', padding: 2, cursor: readonly ? 'default' : 'pointer', transition: 'transform 0.1s' }}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => onChange?.(n)}
          onMouseDown={e => { if (!readonly) e.currentTarget.style.transform = 'scale(0.9)'; }}
          onMouseUp={e => { if (!readonly) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width={readonly ? 14 : 20} height={readonly ? 14 : 20} viewBox="0 0 24 24"
            fill={n <= display ? '#b4915a' : 'none'}
            stroke={n <= display ? '#b4915a' : '#333'}
            strokeWidth="2"
            style={{ transition: 'fill 0.15s, stroke 0.15s' }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const FormationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formation, setFormation] = useState(null);
  const [lecons, setLecons] = useState([]);
  const [avis, setAvis] = useState([]);
  const [newAvis, setNewAvis] = useState({ commentaire: '', note: 5 });
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favoriId, setFavoriId] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'reviews'
  const [expandedLecon, setExpandedLecon] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [editingAvisId, setEditingAvisId] = useState(null);
  const [editAvisData, setEditAvisData] = useState({ commentaire: '', note: 5 });
  const [reviewError, setReviewError] = useState('');
  const [leconContents, setLeconContents] = useState({});
  const [loadingContents, setLoadingContents] = useState({});

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('carte');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleLeconClick = async (lecon) => {
    // Prevent accessing content if not enrolled
    if (!enrolled) return;

    if (expandedLecon === lecon._id) {
      setExpandedLecon(null);
      return;
    }
    setExpandedLecon(lecon._id);

    if (lecon.hasAccess === false) return;

    if (!leconContents[lecon._id]) {
      setLoadingContents(prev => ({ ...prev, [lecon._id]: true }));
      try {
        const res = await contentService.getByLecon(lecon._id);
        setLeconContents(prev => ({ ...prev, [lecon._id]: res.data.data || res.data }));
      } catch (err) {
        console.error("Failed to fetch lesson contents:", err);
      } finally {
        setLoadingContents(prev => ({ ...prev, [lecon._id]: false }));
      }
    }
  };

  useEffect(() => {
    setCheckingEnrollment(true);
    setEnrolled(false);
    
    formationService.getById(id).then(r => setFormation(r.data.data || r.data)).catch(console.error);
    leconService.getByFormation(id).then(r => setLecons(r.data.data || r.data)).catch(console.error);
    avisService.getByFormation(id).then(r => setAvis(r.data.data || r.data)).catch(console.error);

    if (user) {
      inscriptionService.getMyInscriptions().then(r => {
        const inscriptions = r.data.data || r.data || [];
        const isEnrolled = inscriptions.some(ins =>
          ins.formationId === id ||
          ins.formation?._id === id ||
          ins.formation === id
        );
        setEnrolled(isEnrolled);
        setCheckingEnrollment(false);
      }).catch(() => {
        setCheckingEnrollment(false);
      });

      favoriService.getMyFavoris().then(r => {
        const favs = r.data.data || r.data || [];
        const isFav = favs.find(f =>
          f.cibleId === id ||
          f.cibleId?._id === id
        );
        if (isFav) {
          setFavorited(true);
          setFavoriId(isFav._id);
        }
      }).catch(() => {});
    } else {
      setCheckingEnrollment(false);
    }
  }, [id, user]);

  const handleInscription = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/formations/${id}` } } });
      return;
    }

    // For free courses, enroll immediately. For paid, open modal.
    if (formation.prix === 0 || formation.prix === '0' || !formation.prix) {
      setEnrolling(true);
      inscriptionService.create({ formationId: id })
        .then(() => {
          setEnrolled(true);
          setTimeout(() => navigate('/apprenant/formations'), 1200);
        })
        .catch(err => setError(err.response?.data?.message || 'Enrollment failed'))
        .finally(() => setEnrolling(false));
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentConfirm = async () => {
    setProcessingPayment(true);
    setError('');

    try {
      // Create the payment record on the backend
      // Note: Backend confirms "carte" payments automatically
      await paiementService.create({
        formationId: id,
        methodePaiement: paymentMethod
      });

      // Simulate processing delay for "Wow" factor
      await new Promise(resolve => setTimeout(resolve, 1800));

      setPaymentSuccess(true);
      setEnrolled(true);

      // Auto-close and navigate after a brief success display
      setTimeout(() => {
        setShowPaymentModal(false);
        navigate('/apprenant/formations');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setError('');
    // We don't need to call backend cancel anymore as we haven't created the payment yet
  };

  const handleFavorite = async () => {
    if (!user) { navigate('/login'); return; }

    try {
      if (favorited) {
        setFavorited(false);
        if (favoriId) {
          await favoriService.remove(favoriId);
          setFavoriId(null);
        }
      } else {
        setFavorited(true);
        const res = await favoriService.add({ cibleId: id, typeCible: 'formation' });
        const newFav = res.data.data || res.data;
        setFavoriId(newFav._id);
      }
    } catch (err) {
      console.error(err);
      setFavorited(!favorited);
    }
  };

  const handleAvisSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newAvis.commentaire.trim()) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await avisService.create({ formationId: id, commentaire: newAvis.commentaire, note: newAvis.note });
      setAvis(prev => [res.data.data || res.data, ...prev]);
      setNewAvis({ commentaire: '', note: 5 });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to add review');
    } finally { setReviewSubmitting(false); }
  };

  const handleEditClick = (a) => {
    setEditingAvisId(a._id);
    setEditAvisData({ commentaire: a.commentaire, note: a.note });
    setReviewError('');
  };

  const handleUpdateAvis = async (e, avisId) => {
    e.preventDefault();
    if (!editAvisData.commentaire.trim()) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await avisService.update(avisId, editAvisData);
      setAvis(prev => prev.map(item => item._id === avisId ? (res.data.data || res.data) : item));
      setEditingAvisId(null);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to update review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteAvis = async (avisId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    setReviewError('');
    try {
      await avisService.delete(avisId);
      setAvis(prev => prev.filter(item => item._id !== avisId));
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const avgRating = avis.length ? (avis.reduce((s, a) => s + (a.note || 0), 0) / avis.length) : 0;
  const totalDuration = lecons.reduce((s, l) => s + (l.duree || l.duration || 0), 0);

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: avis.filter(a => a.note === n).length,
    pct: avis.length ? Math.round((avis.filter(a => a.note === n).length / avis.length) * 100) : 0,
  }));

  if (!formation) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="fd-spin" />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .fd-root { font-family: 'DM Sans', sans-serif; color: #e8e4dc; padding-top: 48px; }
        .fd-spin { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #b4915a; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Back */
        .fd-back { display: inline-flex; align-items: center; gap: 6px; color: #555; font-size: 13px; text-decoration: none; margin-bottom: 36px; transition: color 0.2s; }
        .fd-back:hover { color: #b4915a; }

        /* ── Hero section ── */
        .fd-hero { display: grid; grid-template-columns: 1fr 300px; gap: 44px; align-items: start; margin-bottom: 0; }
        @media (max-width: 880px) { .fd-hero { grid-template-columns: 1fr; } .fd-enroll-card { position: static !important; } }

        .fd-cat-tag { display: inline-block; padding: 4px 12px; border-radius: 6px; background: rgba(180,145,90,0.1); border: 1px solid rgba(180,145,90,0.2); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #b4915a; margin-bottom: 14px; }
        .fd-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 300; color: #f0ebe0; line-height: 1.1; margin-bottom: 18px; }
        .fd-desc { font-size: 15px; color: #666; line-height: 1.75; font-weight: 300; margin-bottom: 24px; }

        /* Quick stats strip */
        .fd-stats-strip { display: flex; gap: 0; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
        .fd-stat { flex: 1; padding: 14px 16px; background: rgba(255,255,255,0.02); border-right: 1px solid rgba(255,255,255,0.07); text-align: center; }
        .fd-stat:last-child { border-right: none; }
        .fd-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #e8e4dc; line-height: 1; margin-bottom: 3px; }
        .fd-stat-lbl { font-size: 11px; color: #444; letter-spacing: 0.06em; text-transform: uppercase; }

        /* ── Enroll card ── */
        .fd-enroll-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; position: sticky; top: 80px; }
        .fd-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 20px; }
        .fd-price { font-family: 'Cormorant Garamond', serif; font-size: 44px; font-weight: 300; color: #b4915a; line-height: 1; }
        .fd-price-unit { font-size: 13px; color: #555; }

        .fd-enroll-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #b4915a, #c8a86e); border: none; border-radius: 11px; color: #0c0c0e; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.2s, transform 0.15s; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 18px rgba(180,145,90,0.2); }
        .fd-enroll-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .fd-enroll-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .fd-enroll-btn.done { background: linear-gradient(135deg, #4aa87d, #3d9068); box-shadow: 0 4px 18px rgba(74,168,125,0.2); }
        .fd-enroll-btn.done:hover { opacity: 0.9; }

        .fd-fav-btn { width: 100%; padding: 11px; border-radius: 11px; border: 1px solid rgba(255,255,255,0.09); background: transparent; color: ${favorited ? '#e07070' : '#666'}; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.2s; margin-bottom: 18px; }
        .fd-fav-btn:hover { border-color: rgba(220,80,80,0.3); color: #e07070; }

        .fd-card-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }
        .fd-card-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 9px; }
        .fd-card-lbl { color: #555; }
        .fd-card-val { color: #aaa; }
        .fd-enroll-hint { font-size: 11px; color: #444; text-align: center; margin-top: 12px; }

        .fd-error-banner { background: rgba(220,53,53,0.08); border: 1px solid rgba(220,53,53,0.2); border-radius: 8px; padding: 11px 14px; font-size: 13px; color: #e07070; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

        /* ── Tabs ── */
        .fd-tabs-area { margin-top: 44px; }
        .fd-tab-nav { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.07); margin-bottom: 32px; }
        .fd-tab { padding: 12px 20px; font-size: 13px; color: #555; background: none; border: none; font-family: 'DM Sans', sans-serif; cursor: pointer; position: relative; transition: color 0.2s; letter-spacing: 0.03em; display: flex; align-items: center; gap: 7px; }
        .fd-tab:hover { color: #888; }
        .fd-tab.active { color: #e8e4dc; }
        .fd-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #b4915a; border-radius: 1px 1px 0 0; }
        .fd-tab-count { font-size: 11px; background: rgba(255,255,255,0.08); color: #666; padding: 2px 7px; border-radius: 10px; }
        .fd-tab.active .fd-tab-count { background: rgba(180,145,90,0.15); color: #b4915a; }

        /* ── Content tab ── */
        .fd-section-label { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; color: #f0ebe0; margin-bottom: 16px; }
        .fd-total-dur { font-size: 12px; color: #555; margin-bottom: 20px; display: flex; align-items: center; gap: 5px; }

        .fd-lecon { display: flex; align-items: center; gap: 16px; padding: 13px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); margin-bottom: 6px; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .fd-lecon:hover { border-color: rgba(180,145,90,0.2); background: rgba(255,255,255,0.03); }
        .fd-lecon-num { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: rgba(180,145,90,0.35); min-width: 28px; flex-shrink: 0; }
        .fd-lecon-info { flex: 1; }
        .fd-lecon-title { font-size: 14px; color: #e8e4dc; }
        .fd-lecon-dur { font-size: 11px; color: #444; display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .fd-lecon-arrow { color: #444; transition: transform 0.2s; flex-shrink: 0; }
        .fd-lecon.expanded .fd-lecon-arrow { transform: rotate(90deg); }
        .fd-lecon-preview { padding: 10px 16px 14px 44px; font-size: 13px; color: #555; line-height: 1.6; border-radius: 0 0 10px 10px; background: rgba(255,255,255,0.01); margin-top: -6px; margin-bottom: 6px; border: 1px solid rgba(255,255,255,0.04); border-top: none; }

        /* ── Reviews tab ── */
        .fd-rating-hero { display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: center; padding: 24px; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; background: rgba(255,255,255,0.02); margin-bottom: 28px; }
        @media (max-width: 600px) { .fd-rating-hero { grid-template-columns: 1fr; } }
        .fd-rating-big-num { font-family: 'Cormorant Garamond', serif; font-size: 72px; font-weight: 300; color: #b4915a; line-height: 1; text-align: center; }
        .fd-rating-label { font-size: 12px; color: #555; text-align: center; margin-top: 4px; }
        .fd-dist-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .fd-dist-label { font-size: 12px; color: #555; min-width: 30px; }
        .fd-dist-bar-track { flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .fd-dist-bar-fill { height: 100%; background: #b4915a; border-radius: 3px; transition: width 0.5s ease; }
        .fd-dist-count { font-size: 11px; color: #444; min-width: 20px; text-align: right; }

        .fd-avis-card { padding: 18px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); margin-bottom: 10px; animation: fd-fadein 0.3s ease; }
        @keyframes fd-fadein { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .fd-avis-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .fd-avis-date { font-size: 11px; color: #444; }
        .fd-avis-comment { font-size: 13px; color: #777; line-height: 1.7; font-weight: 300; }

        /* Review form */
        .fd-review-form { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 22px; margin-top: 24px; }
        .fd-form-title { font-size: 15px; font-weight: 500; color: #e8e4dc; margin-bottom: 18px; }
        .fd-form-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin-bottom: 8px; display: block; }
        .fd-textarea { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; color: #e8e4dc; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; resize: vertical; min-height: 90px; margin-bottom: 14px; transition: border-color 0.2s; }
        .fd-textarea:focus { border-color: rgba(180,145,90,0.4); }
        .fd-textarea::placeholder { color: #444; }
        .fd-form-footer { display: flex; align-items: center; justify-content: space-between; }
        .fd-submit-btn { padding: 10px 22px; background: linear-gradient(135deg, #b4915a, #c8a86e); border: none; border-radius: 9px; color: #0c0c0e; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.2s; display: flex; align-items: center; gap: 7px; }
        .fd-submit-btn:hover:not(:disabled) { opacity: 0.9; }
        .fd-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .fd-review-success { font-size: 12px; color: #4aa87d; display: flex; align-items: center; gap: 5px; animation: fd-fadein 0.3s ease; }
        .fd-char-count { font-size: 11px; color: #444; }

        .fd-empty { font-size: 14px; color: #444; padding: 12px 0; }
        .fd-sign-in-note { font-size: 13px; color: #555; margin-top: 16px; }
        .fd-sign-in-note a { color: #b4915a; }

        /* Spinner inline */
        .fd-inline-spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(12,12,14,0.3); border-top-color: rgba(12,12,14,0.8); animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="fd-root">
        <Link to="/formations" className="fd-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Back to courses
        </Link>

        {/* Hero grid */}
        <div className="fd-hero">
          {/* Left */}
          <div>
            {(formation.categorie?.nom || formation.categorie?.name) && (
              <span className="fd-cat-tag">{formation.categorie.nom || formation.categorie.name}</span>
            )}
            <h1 className="fd-title">{formation.titre || formation.title}</h1>
            <p className="fd-desc">{formation.description}</p>

            {/* Quick stats */}
            <div className="fd-stats-strip">
              <div className="fd-stat">
                <div className="fd-stat-val">{formation.duree ?? formation.duration}h</div>
                <div className="fd-stat-lbl">Duration</div>
              </div>
              <div className="fd-stat">
                <div className="fd-stat-val">{lecons.length}</div>
                <div className="fd-stat-lbl">Lessons</div>
              </div>
              <div className="fd-stat">
                <div className="fd-stat-val">{avis.length > 0 ? avgRating.toFixed(1) : '—'}</div>
                <div className="fd-stat-lbl">Rating</div>
              </div>
              <div className="fd-stat">
                <div className="fd-stat-val">{avis.length}</div>
                <div className="fd-stat-lbl">Reviews</div>
              </div>
            </div>
          </div>

          {/* Enroll card */}
          <div className="fd-enroll-card">
            {checkingEnrollment ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="fd-spin" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#666', fontSize: 13, margin: 0 }}>Checking enrollment...</p>
              </div>
            ) : enrolled ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,168,125,0.15)', color: '#4aa87d', marginBottom: 16 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(74,168,125,0.1)', border: '1px solid rgba(74,168,125,0.3)', borderRadius: 20, color: '#4aa87d', fontSize: 12, marginBottom: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  You own this course
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#e8e4dc', fontSize: 20, fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>Ready to learn?</h3>
                <p style={{ margin: '0 0 20px 0', color: '#888', fontSize: 14 }}>Continue where you left off</p>
                <button
                  className="fd-enroll-btn done"
                  onClick={() => navigate(`/apprenant/learn/${id}`)}
                  style={{ background: 'linear-gradient(135deg, #4aa87d, #3d9068)', boxShadow: '0 4px 18px rgba(74,168,125,0.25)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Continue Learning
                </button>
              </div>
            ) : (
              <>
                <div className="fd-price-row">
                  <span className="fd-price">{formation.prix ?? formation.price}</span>
                  <span className="fd-price-unit">Tunisian Dinar</span>
                </div>

                {error && (
                  <div className="fd-error-banner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                  </div>
                )}

                <button
                  className="fd-enroll-btn"
                  onClick={handleInscription}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <><div className="fd-inline-spin" /> Processing…</>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      Enroll Now
                    </>
                  )}
                </button>
                <p className="fd-enroll-hint" style={{ marginTop: 12, marginBottom: 0 }}>
                  {user ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Secure enrollment
                    </span>
                  ) : (
                    <><Link to="/login" style={{ color: '#b4915a' }}>Sign in</Link> to enroll</>
                  )}
                </p>
              </>
            )}

            {!checkingEnrollment && (
              <>
                <button className="fd-fav-btn" onClick={handleFavorite} style={{ marginTop: enrolled ? 0 : 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={favorited ? '#e07070' : 'none'} stroke={favorited ? '#e07070' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  {favorited ? 'Saved to Favorites' : 'Save to Favorites'}
                </button>

                <div className="fd-card-row"><span className="fd-card-lbl">Center</span><span className="fd-card-val">{formation.centreId?.nom || formation.centre?.nom || '—'}</span></div>
                <div className="fd-card-divider" />
                <div className="fd-card-row"><span className="fd-card-lbl">Duration</span><span className="fd-card-val">{formation.duree ?? formation.duration}h total</span></div>
                <div className="fd-card-row"><span className="fd-card-lbl">Lessons</span><span className="fd-card-val">{lecons.length}</span></div>
                {totalDuration > 0 && <div className="fd-card-row"><span className="fd-card-lbl">Content</span><span className="fd-card-val">{totalDuration} min</span></div>}
                <div className="fd-card-row"><span className="fd-card-lbl">Language</span><span className="fd-card-val">FR / AR</span></div>
                <div className="fd-card-row"><span className="fd-card-lbl">Access</span><span className="fd-card-val">Lifetime</span></div>
              </>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="fd-tabs-area">
          <nav className="fd-tab-nav">
            <button className={`fd-tab${activeTab === 'content' ? ' active' : ''}`} onClick={() => setActiveTab('content')}>
              Course Content
              <span className="fd-tab-count">{lecons.length}</span>
            </button>
            <button className={`fd-tab${activeTab === 'reviews' ? ' active' : ''}`} onClick={() => setActiveTab('reviews')}>
              Reviews
              <span className="fd-tab-count">{avis.length}</span>
            </button>
          </nav>

          {/* Content tab */}
          {activeTab === 'content' && (
            <div>
              <div className="fd-section-label">Lessons</div>
              {totalDuration > 0 && (
                <div className="fd-total-dur">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {totalDuration} minutes of content
                </div>
              )}
              {lecons.length === 0 ? (
                <p className="fd-empty">No lessons available yet.</p>
              ) : lecons.map((l, i) => (
                <div key={l._id}>
                  <div
                    className={`fd-lecon${expandedLecon === l._id ? ' expanded' : ''}${!enrolled ? ' locked' : ''}`}
                    onClick={() => enrolled && handleLeconClick(l)}
                    style={{ cursor: enrolled ? 'pointer' : 'not-allowed', opacity: enrolled ? 1 : 0.6 }}
                  >
                    <div className="fd-lecon-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="fd-lecon-info">
                      <div className="fd-lecon-title">{l.titre || l.title}</div>
                      {l.contentCount > 0 && <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{l.contentCount} content item{l.contentCount !== 1 && 's'}</div>}
                    </div>
                    <div className="fd-lecon-dur">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {l.duree || l.duration} min
                    </div>
                    {!enrolled ? (
                      <span title="Enroll to view content" style={{ fontSize: 13, flexShrink: 0 }}>🔒</span>
                    ) : (
                      <svg className="fd-lecon-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                    )}
                  </div>
                  {expandedLecon === l._id && enrolled && (
                    <div className="fd-lecon-preview">
                      {l.description && <div style={{ marginBottom: 12 }}>{l.description}</div>}
                      {l.contenu && <div style={{ marginBottom: 12, opacity: 0.9 }}>{l.contenu}</div>}

                      {loadingContents[l._id] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888' }}>
                          <div className="fd-inline-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#b4915a', width: 12, height: 12, borderWidth: 2 }} />
                          <span style={{ fontSize: 12 }}>Loading content...</span>
                        </div>
                      ) : leconContents[l._id] && leconContents[l._id].length > 0 ? (
                        <div className="fd-contents-list" style={{ marginTop: 12 }}>
                          {leconContents[l._id].map(c => (
                            <div key={c._id} className="fd-content-item" style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ color: '#b4915a', fontSize: 18 }}>
                                {c.type === 'video' ? '▶️' : c.type === 'image' ? '🖼️' : c.type === 'file' ? '📄' : c.type === 'test' ? '📝' : '🔗'}
                              </span>
                              <div>
                                <div style={{ color: '#e8e4dc', fontSize: 13, fontWeight: 500 }}>{c.title}</div>
                                {c.description && <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{c.description}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#666', fontStyle: 'italic', fontSize: 12 }}>
                          {!l.description && !l.contenu ? 'No additional content for this lesson.' : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {!enrolled && expandedLecon === l._id && (
                    <div style={{ color: '#e07070', fontSize: 12, marginTop: 8, padding: '10px 14px', background: 'rgba(224,112,112,0.06)', border: '1px solid rgba(224,112,112,0.15)', borderRadius: 8 }}>
                      🔒 You need to enroll in this course to view the full lesson content.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === 'reviews' && (
            <div>
              {/* Rating hero */}
              {avis.length > 0 && (
                <div className="fd-rating-hero">
                  <div>
                    <div className="fd-rating-big-num">{avgRating.toFixed(1)}</div>
                    <StarRating value={Math.round(avgRating)} readonly />
                    <div className="fd-rating-label">{avis.length} review{avis.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div>
                    {dist.map(d => (
                      <div key={d.star} className="fd-dist-row">
                        <span className="fd-dist-label">{d.star}★</span>
                        <div className="fd-dist-bar-track">
                          <div className="fd-dist-bar-fill" style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className="fd-dist-count">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {avis.length === 0 && <p className="fd-empty">No reviews yet. Be the first to review!</p>}

              {reviewError && (
                <div className="fd-error-banner" style={{ marginBottom: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {reviewError}
                </div>
              )}

              {avis.map(a => {
                const ownerId = a.apprenantId?._id || a.apprenantId || a.user?._id || a.user;
                const isOwner = user && ownerId && ownerId === user._id;

                if (editingAvisId === a._id) {
                  return (
                    <form key={a._id} onSubmit={(e) => handleUpdateAvis(e, a._id)} className="fd-review-form" style={{ marginTop: 0, marginBottom: 10 }}>
                      <div className="fd-form-title">Edit Review</div>
                      <label className="fd-form-label">Your Rating</label>
                      <div style={{ marginBottom: 16 }}>
                        <StarRating value={editAvisData.note} onChange={n => setEditAvisData(p => ({ ...p, note: n }))} />
                      </div>
                      <label className="fd-form-label">Comment</label>
                      <textarea
                        className="fd-textarea"
                        value={editAvisData.commentaire}
                        onChange={e => setEditAvisData(p => ({ ...p, commentaire: e.target.value }))}
                        maxLength={500}
                      />
                      <div className="fd-form-footer">
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button type="submit" className="fd-submit-btn" disabled={reviewSubmitting || !editAvisData.commentaire.trim()}>
                            {reviewSubmitting ? 'Updating…' : 'Update Review'}
                          </button>
                          <button type="button" className="fd-submit-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc' }} onClick={() => setEditingAvisId(null)}>
                            Cancel
                          </button>
                        </div>
                        <span className="fd-char-count">{editAvisData.commentaire.length}/500</span>
                      </div>
                    </form>
                  );
                }

                return (
                  <div key={a._id} className="fd-avis-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {a.apprenantId?.user_image ? (
                          <img src={a.apprenantId.user_image.startsWith('http') ? a.apprenantId.user_image : `http://localhost:5000/${a.apprenantId.user_image}`} alt={a.apprenantId?.prenom || 'User'} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(180,145,90,0.2)', color: '#b4915a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' }}>
                            {((a.apprenantId?.prenom?.[0]) || (a.apprenantId?.nom?.[0]) || 'U').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 13, color: '#e8e4dc', fontWeight: 500 }}>
                            {a.apprenantId?.prenom || ''} {a.apprenantId?.nom || 'Anonymous'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <StarRating value={a.note} readonly />
                            {a.createdAt && <span className="fd-avis-date" style={{ fontSize: 10, color: '#666' }}>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {isOwner && (
                          <>
                            <button type="button" onClick={() => handleEditClick(a)} style={{ background: 'none', border: 'none', color: '#b4915a', cursor: 'pointer', fontSize: 12, padding: 0 }}>Edit</button>
                            <button type="button" onClick={() => handleDeleteAvis(a._id)} style={{ background: 'none', border: 'none', color: '#e07070', cursor: 'pointer', fontSize: 12, padding: 0 }}>Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="fd-avis-comment" style={{ marginTop: 6 }}>{a.commentaire}</p>
                  </div>
                );
              })}

              {user ? (
                <form onSubmit={handleAvisSubmit} className="fd-review-form">
                  <div className="fd-form-title">Leave a Review</div>

                  <label className="fd-form-label">Your Rating</label>
                  <div style={{ marginBottom: 16 }}>
                    <StarRating value={newAvis.note} onChange={n => setNewAvis(p => ({ ...p, note: n }))} />
                  </div>

                  <label className="fd-form-label">Comment</label>
                  <textarea
                    className="fd-textarea"
                    placeholder="Share what you learned, what you liked, and any tips for future students…"
                    value={newAvis.commentaire}
                    onChange={e => setNewAvis(p => ({ ...p, commentaire: e.target.value }))}
                    maxLength={500}
                  />

                  <div className="fd-form-footer">
                    <button type="submit" className="fd-submit-btn" disabled={reviewSubmitting || !newAvis.commentaire.trim()}>
                      {reviewSubmitting ? <><div className="fd-inline-spin" style={{ borderTopColor: 'rgba(12,12,14,0.7)' }} /> Posting…</> : 'Post Review'}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {reviewSuccess && <span className="fd-review-success"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> Posted!</span>}
                      <span className="fd-char-count">{newAvis.commentaire.length}/500</span>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="fd-sign-in-note"><Link to="/login">Sign in</Link> to leave a review.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && !processingPayment && handlePaymentCancel()}>
          <div className="pm-modal">
            <div className="pm-header">
              <h2 className="pm-title">Secure Checkout</h2>
              {!paymentSuccess && !processingPayment && (
                <button className="pm-close" onClick={handlePaymentCancel}>×</button>
              )}
            </div>

            <div className="pm-body">
              {paymentSuccess ? (
                <div className="pm-success" style={{ animation: 'pm-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <div className="pm-success-icon">✓</div>
                  <h3>Payment Confirmed!</h3>
                  <p>You've been successfully enrolled in<br /><strong>{formation.titre}</strong></p>
                  <div style={{ marginTop: 24, fontSize: 12, color: '#444' }}>Redirecting to your dashboard...</div>
                </div>
              ) : (
                <>
                  <div className="pm-course-info">
                    <div className="pm-course-title">{formation.titre}</div>
                    <div className="pm-course-price">{formation.prix} <span style={{ fontSize: 14, fontWeight: 300 }}>DT</span></div>
                  </div>

                  <div className="pm-divider" />

                  <div className="pm-method-section">
                    <h4>Select Payment Method</h4>
                    <div className="pm-methods">
                      <label className={`pm-method ${paymentMethod === 'carte' ? 'selected' : ''}`}>
                        <input type="radio" name="payment" value="carte" checked={paymentMethod === 'carte'} onChange={() => setPaymentMethod('carte')} />
                        <span className="pm-method-icon">💳</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#e8e4dc' }}>Credit or Debit Card</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>Instant access granted</span>
                        </div>
                      </label>
                      <label className={`pm-method ${paymentMethod === 'virement' ? 'selected' : ''}`}>
                        <input type="radio" name="payment" value="virement" checked={paymentMethod === 'virement'} onChange={() => setPaymentMethod('virement')} />
                        <span className="pm-method-icon">🏛️</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#e8e4dc' }}>Bank Transfer</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>Requires manual verification</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'carte' && (
                    <div className="pm-card-form" style={{ animation: 'pm-fadein 0.3s ease' }}>
                      <input type="text" placeholder="Card Number" className="pm-input" defaultValue="4242 4242 4242 4242" />
                      <div className="pm-card-row">
                        <input type="text" placeholder="MM / YY" className="pm-input" defaultValue="12/26" />
                        <input type="text" placeholder="CVC" className="pm-input" defaultValue="123" />
                      </div>
                    </div>
                  )}

                  {error && <div className="pm-error">{error}</div>}

                  <button className="pm-pay-btn" onClick={handlePaymentConfirm} disabled={processingPayment}>
                    {processingPayment ? (
                      <><div className="fd-inline-spin" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000' }} /> Finalizing...</>
                    ) : (
                      <>Enroll & Pay {formation.prix} DT</>
                    )}
                  </button>

                  <button className="pm-cancel-btn" onClick={handlePaymentCancel} disabled={processingPayment}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pm-bounce { 0% { transform: scale(0.8); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes pm-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <style>{`
        .pm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .pm-modal {
          width: 100%; max-width: 440px;
          background: #111114; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; overflow: hidden;
        }
        .pm-header {
          padding: 24px 28px 20px; display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg, #111114, #1a1a22);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .pm-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #f0ebe0; margin: 0; }
        .pm-close { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 32px; height: 32px; color: #666; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }
        .pm-close:hover { color: #aaa; }
        .pm-body { padding: 28px; }
        .pm-course-info { text-align: center; margin-bottom: 20px; }
        .pm-course-title { font-size: 16px; color: #e8e4dc; margin-bottom: 8px; }
        .pm-course-price { font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #b4915a; }
        .pm-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 20px 0; }
        .pm-method-section h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin: 0 0 12px; }
        .pm-methods { display: flex; flex-direction: column; gap: 8px; }
        .pm-method { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .pm-method:hover { border-color: rgba(180,145,90,0.3); }
        .pm-method.selected { border-color: #b4915a; background: rgba(180,145,90,0.08); }
        .pm-method input { display: none; }
        .pm-method-icon { font-size: 20px; }
        .pm-method span:last-child { font-size: 14px; color: #e8e4dc; }
        .pm-card-form { margin-top: 16px; }
        .pm-card-row { display: flex; gap: 12px; }
        .pm-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e8e4dc; font-size: 14px; margin-bottom: 10px; outline: none; }
        .pm-input:focus { border-color: #b4915a; }
        .pm-error { padding: 10px 14px; background: rgba(220,100,100,0.1); border: 1px solid rgba(220,100,100,0.3); border-radius: 8px; color: #e07070; font-size: 13px; margin: 16px 0; }
        .pm-pay-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #b4915a, #c8a86e); border: none; border-radius: 10px; color: #0c0c0e; font-size: 15px; font-weight: 500; cursor: pointer; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .pm-pay-btn:hover { opacity: 0.9; }
        .pm-pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pm-cancel-btn { width: 100%; padding: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #666; font-size: 14px; cursor: pointer; margin-top: 10px; }
        .pm-cancel-btn:hover { border-color: rgba(255,255,255,0.2); color: #888; }
        .pm-success { text-align: center; padding: 20px 0; }
        .pm-success-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(74,168,125,0.15); border: 2px solid #4aa87d; color: #4aa87d; font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .pm-success h3 { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #f0ebe0; margin: 0 0 8px; }
        .pm-success p { font-size: 14px; color: #666; margin: 0; }
      `}</style>
    </>
  );
};

export default FormationDetail;