import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import profileService from '../services/profile';
import skillService from '../services/skill';

/* ─── icons ─── */
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const SaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const Spinner = () => (
  <svg className="pf-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ─── role badge ─── */
const ROLE_META = {
  apprenant: { label: 'Student', color: '#6a9fd8', bg: 'rgba(106,159,216,.12)', icon: '🎓' },
  formateur: { label: 'Trainer', color: '#c8a86e', bg: 'rgba(200,168,110,.12)', icon: '🧑‍🏫' },
  responsableCF: { label: 'Center Manager', color: '#7dbf7d', bg: 'rgba(125,191,125,.12)', icon: '🏢' },
  admin: { label: 'Admin', color: '#e07070', bg: 'rgba(220,110,110,.12)', icon: '🔑' },
};

/* ─── inline editable field ─── */
const InfoRow = ({ label, value, name, editing, formData, onChange, type = 'text', children }) => {
  if (!editing) {
    return (
      <div className="pf-info-row">
        <span className="pf-info-label">{label}</span>
        <span className="pf-info-value">{value || <span className="pf-info-empty">—</span>}</span>
      </div>
    );
  }
  return (
    <div className="pf-info-row pf-info-row--edit">
      <span className="pf-info-label">{label}</span>
      {children ? (
        <select name={name} value={formData[name]} onChange={onChange} className="pf-input pf-select">
          {children}
        </select>
      ) : (
        <input type={type} name={name} value={formData[name]} onChange={onChange} className="pf-input" />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   DELETE ACCOUNT MODAL
══════════════════════════════════════════ */
const DeleteModal = ({ profile, onConfirm, onClose, deleting }) => {
  const [step, setStep] = useState(1); // 1 = consequences, 2 = type confirmation
  const [typed, setTyped] = useState('');
  const inputRef = useRef(null);
  const confirmWord = profile?.email?.split('@')[0] || 'delete';

  // Focus input when step 2 appears
  useEffect(() => {
    if (step === 2) setTimeout(() => inputRef.current?.focus(), 80);
  }, [step]);

  // Trap focus / close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const match = typed.trim() === confirmWord;

  const consequences = [
    { icon: '🎓', text: 'All course enrollments and progress will be lost' },
    { icon: '💳', text: 'Payment history and receipts will be deleted' },
    { icon: '♡', text: 'Saved favorites and bookmarks will be removed' },
    { icon: '📝', text: 'Reviews and ratings you submitted will be erased' },
  ];

  return (
    <>
      <style>{`
        .dm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: dm-fade-in 0.2s ease;
        }
        @keyframes dm-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .dm-modal {
          width: 100%; max-width: 460px;
          background: #111113;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(220,80,80,0.08);
          animation: dm-slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes dm-slide-up { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* ── Modal header ── */
        .dm-header {
          padding: 28px 28px 0;
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px;
        }
        .dm-header-icon {
          width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
          background: rgba(220,80,80,0.1);
          border: 1px solid rgba(220,80,80,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .dm-close {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: color 0.2s, background 0.2s; margin-top: -4px;
          font-family: 'DM Sans', sans-serif;
        }
        .dm-close:hover { color: #aaa; background: rgba(255,255,255,0.08); }

        .dm-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 400; color: #f0ebe0;
          margin: 16px 28px 6px;
        }
        .dm-subtitle { font-size: 13px; color: #555; margin: 0 28px 24px; line-height: 1.6; font-weight: 300; }

        /* ── Step indicator ── */
        .dm-steps {
          display: flex; align-items: center; gap: 6px;
          margin: 0 28px 20px;
        }
        .dm-step-dot {
          height: 3px; border-radius: 2px; transition: all 0.3s ease;
          background: rgba(255,255,255,0.1);
        }
        .dm-step-dot.active { background: #e07070; flex: 2; }
        .dm-step-dot.done   { background: rgba(220,80,80,0.3); }
        .dm-step-dot:not(.active):not(.done) { flex: 1; }
        .dm-step-dot.active { flex: 2; }
        .dm-step-dot.done   { flex: 1; }

        /* Divider */
        .dm-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0 28px; }

        /* ── Step 1: Consequences ── */
        .dm-body { padding: 20px 28px 24px; }

        .dm-consequence-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
        .dm-consequence-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 10px;
          background: rgba(220,80,80,0.04);
          border: 1px solid rgba(220,80,80,0.1);
        }
        .dm-consequence-icon { font-size: 16px; flex-shrink: 0; width: 24px; text-align: center; }
        .dm-consequence-text { font-size: 13px; color: #888; font-weight: 300; line-height: 1.4; }

        /* ── Step 2: Type to confirm ── */
        .dm-confirm-section { }
        .dm-confirm-label {
          font-size: 13px; color: #888; line-height: 1.7; margin-bottom: 16px; font-weight: 300;
        }
        .dm-confirm-label strong { color: #e8e4dc; font-weight: 500; }
        .dm-confirm-word {
          display: inline-block;
          font-family: 'Courier New', monospace;
          background: rgba(220,80,80,0.08);
          border: 1px solid rgba(220,80,80,0.2);
          color: #e07070; padding: 2px 8px; border-radius: 5px;
          font-size: 13px; letter-spacing: 0.05em;
        }
        .dm-type-input {
          width: 100%; padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; font-size: 14px; color: #e8e4dc;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .dm-type-input::placeholder { color: #333; }
        .dm-type-input:focus { border-color: rgba(220,80,80,0.35); background: rgba(220,80,80,0.03); }
        .dm-type-input.matched { border-color: rgba(220,80,80,0.6); background: rgba(220,80,80,0.05); }
        .dm-match-hint {
          font-size: 11px; margin-top: 6px; height: 16px; letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .dm-match-hint.ok { color: #e07070; }
        .dm-match-hint.no { color: #333; }

        /* ── Footer buttons ── */
        .dm-footer {
          padding: 0 28px 24px;
          display: flex; gap: 10px;
        }
        .dm-btn-cancel {
          flex: 1; padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 10px;
          color: #666; font-size: 13px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .dm-btn-cancel:hover { color: #aaa; border-color: rgba(255,255,255,0.15); }

        .dm-btn-next {
          flex: 1; padding: 12px;
          background: rgba(220,80,80,0.12);
          border: 1px solid rgba(220,80,80,0.3); border-radius: 10px;
          color: #e07070; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .dm-btn-next:hover { background: rgba(220,80,80,0.2); }

        .dm-btn-delete-final {
          flex: 1; padding: 12px;
          background: linear-gradient(135deg, #c0392b, #e74c3c);
          border: none; border-radius: 10px;
          color: #fff; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 4px 16px rgba(192,57,43,0.3);
        }
        .dm-btn-delete-final:not(:disabled):hover { opacity: 0.88; transform: translateY(-1px); }
        .dm-btn-delete-final:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .dm-btn-back {
          padding: 12px 16px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
          color: #555; font-size: 13px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .dm-btn-back:hover { color: #888; border-color: rgba(255,255,255,0.15); }
      `}</style>

      <div className="dm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="dm-modal" role="dialog" aria-modal="true" aria-labelledby="dm-title">

          {/* Header */}
          <div className="dm-header">
            <div className="dm-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e07070" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <button className="dm-close" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <h2 className="dm-title" id="dm-title">Delete Account</h2>
          <p className="dm-subtitle">
            {step === 1
              ? 'This is permanent and cannot be undone. Here\'s what you\'ll lose:'
              : 'To confirm, please type your username below.'}
          </p>

          {/* Step dots */}
          <div className="dm-steps">
            <div className={`dm-step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`} />
            <div className={`dm-step-dot ${step >= 2 ? 'active' : ''}`} />
          </div>

          <div className="dm-divider" />

          {/* Step 1 — Consequences */}
          {step === 1 && (
            <>
              <div className="dm-body">
                <div className="dm-consequence-list">
                  {consequences.map((c, i) => (
                    <div key={i} className="dm-consequence-item">
                      <span className="dm-consequence-icon">{c.icon}</span>
                      <span className="dm-consequence-text">{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dm-footer">
                <button className="dm-btn-cancel" onClick={onClose}>Keep Account</button>
                <button className="dm-btn-next" onClick={() => setStep(2)}>
                  I understand
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </>
          )}

          {/* Step 2 — Type to confirm */}
          {step === 2 && (
            <>
              <div className="dm-body">
                <div className="dm-confirm-section">
                  <p className="dm-confirm-label">
                    Type <span className="dm-confirm-word">{confirmWord}</span> to permanently delete your account. There is no going back.
                  </p>
                  <input
                    ref={inputRef}
                    className={`dm-type-input${match ? ' matched' : ''}`}
                    type="text"
                    placeholder={`Type "${confirmWord}" to confirm`}
                    value={typed}
                    onChange={e => setTyped(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && match && !deleting && onConfirm()}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <div className={`dm-match-hint ${match ? 'ok' : 'no'}`}>
                    {typed.length > 0 && !match && '✗ Does not match'}
                    {match && '✓ Confirmed — ready to delete'}
                  </div>
                </div>
              </div>
              <div className="dm-footer">
                <button className="dm-btn-back" onClick={() => { setStep(1); setTyped(''); }}>
                  ←
                </button>
                <button className="dm-btn-cancel" onClick={onClose}>Cancel</button>
                <button
                  className="dm-btn-delete-final"
                  onClick={onConfirm}
                  disabled={!match || deleting}
                >
                  {deleting
                    ? <><svg className="pf-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg> Deleting…</>
                    : <>Delete forever</>
                  }
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════
   MAIN PROFILE COMPONENT
══════════════════════════════════════════ */
const Profile = () => {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  const [formData, setFormData] = useState({
    nom: '', prenom: '', telephone: '',
    niveauEtude: '', dateNaissance: '', adresse: '',
    specialite: '', experience: '', user_image: null,
    skills: [],
  });
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: { pathname: '/profile' } } });
    else if (user) {
      fetchProfile();
      if (user.role === 'formateur' || user.role === 'admin') {
        fetchSkills();
      }
    }
  }, [user, authLoading]);

  const fetchSkills = async () => {
    try {
      const res = await skillService.getAll();
      setAllSkills(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    }
  };

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showDeleteModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showDeleteModal]);

  const fetchProfile = async () => {
    try {
      const res = await profileService.getProfile();
      const d = res.data.data || res.data;
      setProfile(d);
      setFormData({
        nom: d.nom || '',
        prenom: d.prenom || '',
        telephone: d.telephone || '',
        niveauEtude: d.niveauEtude || '',
        dateNaissance: d.dateNaissance ? d.dateNaissance.split('T')[0] : '',
        adresse: d.adresse || '',
        specialite: d.specialite || '',
        experience: d.experience || '',
        skills: d.skills?.map(s => s._id || s) || [],
        user_image: null,
      });
      setImagePreview(null);
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    const err = (() => {
      if (formData.telephone && !/^(?:\+216|00216)?[ ]?[24579][0-9]{7}$/.test(formData.telephone)) {
        return 'Invalid Tunisian phone number format';
      }
      if (formData.dateNaissance) {
        const birth = new Date(formData.dateNaissance);
        const now = new Date();
        if (birth >= now) return 'Birth date must be in the past';
        const age = now.getFullYear() - birth.getFullYear();
        if (age < 13) return 'You must be at least 13 years old';
      }
      return null;
    })();

    if (err) {
      setError(err);
      return;
    }

    setSaving(true); setError(''); setSuccess('');
    try {
      let dataToSend;
      if (formData.user_image instanceof File) {
        dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined)
            dataToSend.append(key, formData[key]);
        });
      } else {
        const { user_image: _u, ...rest } = formData;
        dataToSend = rest;
      }
      await profileService.updateProfile(profile._id || profile.id, dataToSend);
      setSuccess('Profile updated successfully');
      setEditing(false); setImagePreview(null);
      await fetchProfile();
      await refreshUser(); // Sync with global state for Header
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setEditing(false); setError(''); setImagePreview(null);
    if (profile) {
      setFormData({
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        telephone: profile.telephone || '',
        niveauEtude: profile.niveauEtude || '',
        dateNaissance: profile.dateNaissance ? profile.dateNaissance.split('T')[0] : '',
        adresse: profile.adresse || '',
        specialite: profile.specialite || '',
        experience: profile.experience || '',
        skills: profile.skills?.map(s => s._id || s) || [],
        user_image: null,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(p => ({ ...p, user_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true); setError('');
    try {
      await profileService.deleteAccount(profile._id || profile.id);
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setError('Password must contain one uppercase letter, one lowercase letter, and one number');
      return;
    }
    setChangingPw(true); setError('');
    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const roleMeta = ROLE_META[profile?.role] || {};

  if (loading || authLoading) return (
    <div className="pf-loading"><div className="pf-loading-ring" /></div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

        .pf-root {
          min-height: 100vh; background: #0c0c0e;
          font-family: 'DM Sans', sans-serif; color: #e8e4dc;
          padding: 40px 24px;
        }
        .pf-loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0c0c0e; }
        .pf-loading-ring { width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(255,255,255,.08); border-top-color: #b4915a; animation: pf-spin .8s linear infinite; }
        @keyframes pf-spin { to { transform: rotate(360deg); } }

        .pf-container { max-width: 640px; margin: 0 auto; }

        .pf-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
        .pf-logo { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 500; color: #b4915a; letter-spacing: .04em; }
        .pf-logout-btn { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 8px; padding: 8px 14px; color: #888; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .2s; }
        .pf-logout-btn:hover { border-color: rgba(220,110,110,.4); color: #e07070; }

        .pf-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; overflow: hidden; }

        .pf-hero { background: linear-gradient(145deg, #111114 0%, #1a1a22 100%); padding: 36px 32px; position: relative; overflow: hidden; }
        .pf-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(180,145,90,.08) 0%, transparent 65%); }
        .pf-hero-content { position: relative; display: flex; align-items: center; gap: 24px; }
        .pf-avatar { width: 72px; height: 72px; border-radius: 50%; border: 2px solid rgba(180,145,90,.3); flex-shrink: 0; background: rgba(255,255,255,.05); display: flex; align-items: center; justify-content: center; font-size: 28px; overflow: hidden; }
        .pf-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pf-hero-text h1 { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 400; color: #f0ebe0; margin: 0 0 6px; }
        .pf-hero-text p { font-size: 13px; color: #666; margin: 0 0 12px; }
        .pf-role-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }

        .pf-body { padding: 28px 32px; }

        .pf-section { margin-bottom: 28px; }
        .pf-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.06); }
        .pf-section-title { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #555; font-weight: 500; }

        .pf-info-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.04); }
        .pf-info-row:last-child { border-bottom: none; }
        .pf-info-row--edit { align-items: center; }
        .pf-info-label { width: 160px; font-size: 12px; color: #555; letter-spacing: .04em; text-transform: uppercase; flex-shrink: 0; }
        .pf-info-value { font-size: 14px; color: #e8e4dc; }
        .pf-info-empty { color: #333; }

        .pf-input { flex: 1; padding: 8px 12px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); border-radius: 7px; font-size: 13px; color: #e8e4dc; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color .2s; }
        .pf-input:focus { border-color: #b4915a; }
        .pf-select { appearance: none; cursor: pointer; color-scheme: dark; }
        .pf-select option { background: #1a1a1e; color: #e8e4dc; }

        .pf-actions { display: flex; gap: 10px; }
        .pf-btn-edit { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(180,145,90,.1); border: 1px solid rgba(180,145,90,.25); border-radius: 8px; color: #b4915a; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .2s; }
        .pf-btn-edit:hover { background: rgba(180,145,90,.18); }
        .pf-btn-save { display: flex; align-items: center; gap: 6px; padding: 8px 18px; background: linear-gradient(135deg, #b4915a, #c8a86e); border: none; border-radius: 8px; color: #0c0c0e; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity .2s; }
        .pf-btn-save:disabled { opacity: .5; cursor: not-allowed; }
        .pf-btn-cancel { padding: 8px 16px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; color: #666; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .2s; }
        .pf-btn-cancel:hover { border-color: rgba(255,255,255,.2); color: #aaa; }

        .pf-spinner { animation: pf-spin .8s linear infinite; }

        /* ── Danger zone card ── */
        .pf-danger-zone {
          margin: 0 32px 32px;
          border-radius: 14px;
          border: 1px solid rgba(220,80,80,0.15);
          background: rgba(220,80,80,0.03);
          overflow: hidden;
        }
        .pf-danger-header {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(220,80,80,0.1);
          display: flex; align-items: center; gap: 8px;
        }
        .pf-danger-header-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #e07070;
          box-shadow: 0 0 6px rgba(220,80,80,0.5);
        }
        .pf-danger-header-label {
          font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #e07070; font-weight: 500;
        }
        .pf-danger-body {
          padding: 18px 20px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
        }
        .pf-danger-info {}
        .pf-danger-title { font-size: 14px; color: #e8e4dc; font-weight: 500; margin-bottom: 4px; }
        .pf-danger-desc { font-size: 12px; color: #555; line-height: 1.5; font-weight: 300; max-width: 280px; }
        .pf-btn-open-delete {
          display: flex; align-items: center; gap: 7px; flex-shrink: 0;
          padding: 9px 18px; border-radius: 9px;
          background: transparent;
          border: 1px solid rgba(220,80,80,0.3);
          color: #e07070; font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .pf-btn-open-delete:hover { background: rgba(220,80,80,0.1); border-color: rgba(220,80,80,0.5); transform: translateY(-1px); }

        /* ── Toast ── */
        .pf-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(0,0,0,.4); z-index: 999; animation: pf-toast-in .3s ease; }
        .pf-toast.success { background: #1a2e1a; border: 1px solid rgba(74,168,125,.3); color: #4aa87d; }
        .pf-toast.error   { background: #2e1a1a; border: 1px solid rgba(220,110,110,.3); color: #e07070; }
        @keyframes pf-toast-in { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

        .pf-role-section-label { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #555; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.06); font-weight: 500; }
      `}</style>

      <div className="pf-root">
        <div className="pf-container">
          <div className="pf-topbar">
            <div className="pf-logo">Forma</div>
            <button className="pf-logout-btn" onClick={handleLogout}>
              <LogoutIcon /> Sign out
            </button>
          </div>

          <div className="pf-card">
            {/* Hero */}
            <div className="pf-hero">
              <div className="pf-hero-content">
                <div className="pf-avatar" style={{ position: 'relative', overflow: 'visible' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : profile?.user_image ? (
                      <img src={profile.user_image.startsWith('http') ? profile.user_image : `http://localhost:5000/${profile.user_image}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      roleMeta.icon || '👤'
                    )}
                  </div>
                  {editing && (
                    <label style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#b4915a', color: '#0c0c0e', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', zIndex: 2 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
                <div className="pf-hero-text">
                  <h1>{profile?.nom} {profile?.prenom}</h1>
                  <p>{profile?.email}</p>
                  {roleMeta.label && (
                    <span className="pf-role-badge" style={{ color: roleMeta.color, background: roleMeta.bg, border: `1px solid ${roleMeta.color}30` }}>
                      {roleMeta.icon} {roleMeta.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="pf-body">
              <div className="pf-section">
                <div className="pf-section-header">
                  <span className="pf-section-title">Personal Information</span>
                  {!editing ? (
                    <button className="pf-btn-edit" onClick={() => setEditing(true)}><EditIcon /> Edit</button>
                  ) : (
                    <div className="pf-actions">
                      <button className="pf-btn-cancel" onClick={handleCancel}>Cancel</button>
                      <button className="pf-btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <Spinner /> : <SaveIcon />}
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
                <InfoRow label="First Name" value={profile?.prenom} name="prenom" editing={editing} formData={formData} onChange={handleChange} />
                <InfoRow label="Last Name" value={profile?.nom} name="nom" editing={editing} formData={formData} onChange={handleChange} />
                <InfoRow label="Email" value={profile?.email} name="email" editing={false} formData={formData} onChange={handleChange} />
                <InfoRow label="Phone" value={profile?.telephone} name="telephone" editing={editing} formData={formData} onChange={handleChange} type="tel" />
              </div>

              {profile?.role === 'apprenant' && (
                <div className="pf-section">
                  <p className="pf-role-section-label">Academic Details</p>
                  <InfoRow label="Education Level" value={profile?.niveauEtude} name="niveauEtude" editing={editing} formData={formData} onChange={handleChange}>
                    <option value="">Select level</option>
                    {['primaire', 'secondaire', 'bac', 'licence', 'master', 'doctorat'].map(v => (
                      <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                    ))}
                  </InfoRow>
                  <InfoRow label="Date of Birth" value={profile?.dateNaissance ? new Date(profile.dateNaissance).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} name="dateNaissance" editing={editing} formData={formData} onChange={handleChange} type="date" />
                  <InfoRow label="Address" value={profile?.adresse} name="adresse" editing={editing} formData={formData} onChange={handleChange} />
                </div>
              )}
              {profile?.role === 'formateur' && (
                <div className="pf-section">
                  <p className="pf-role-section-label">Professional Details</p>
                  <InfoRow label="Specialty" value={profile?.specialite} name="specialite" editing={editing} formData={formData} onChange={handleChange} />
                  <InfoRow label="Experience" value={profile?.experience ? `${profile.experience} year${profile.experience !== 1 ? 's' : ''}` : ''} name="experience" editing={editing} formData={formData} onChange={handleChange} type="number" />
                  
                  {/* Skills Section */}
                  <div className="pf-info-row" style={{ alignItems: 'flex-start' }}>
                    <span className="pf-info-label" style={{ marginTop: editing ? '10px' : '0' }}>Skills</span>
                    <div style={{ flex: 1 }}>
                      {!editing ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {profile?.skills?.length > 0 ? (
                            profile.skills.map(s => (
                              <span key={s._id || s} style={{ padding: '4px 10px', background: 'rgba(180,145,90,0.12)', border: '1px solid rgba(180,145,90,0.25)', borderRadius: '6px', fontSize: '12px', color: '#c8a86e' }}>
                                {typeof s === 'object' ? s.name : (allSkills.find(sk => sk._id === s)?.name || s)}
                              </span>
                            ))
                          ) : <span className="pf-info-empty">—</span>}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {allSkills.map(s => {
                            const isSelected = formData.skills.includes(s._id);
                            return (
                              <label key={s._id} style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px', 
                                padding: '6px 14px', 
                                background: isSelected ? 'rgba(180,145,90,0.12)' : 'rgba(255,255,255,0.02)', 
                                border: '1px solid',
                                borderColor: isSelected ? '#b4915a' : 'rgba(255,255,255,0.08)', 
                                borderRadius: '20px', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                userSelect: 'none',
                                transform: isSelected ? 'translateY(-1px)' : 'none',
                                boxShadow: isSelected ? '0 4px 12px rgba(180,145,90,0.15)' : 'none'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    const next = isSelected 
                                      ? formData.skills.filter(id => id !== s._id)
                                      : [...formData.skills, s._id];
                                    setFormData(d => ({ ...d, skills: next }));
                                  }}
                                  style={{ display: 'none' }}
                                />
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: isSelected ? '#f0ebe0' : '#555',
                                  fontWeight: isSelected ? '500' : '400',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}>
                                  {isSelected ? (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                  ) : (
                                    <span style={{ fontSize: '14px', lineHeight: 1, marginTop: '-1px', opacity: 0.5 }}>+</span>
                                  )}
                                  {s.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Center Details Section */}
              {(profile?.centreId || profile?.centreGereId) && (
                <div className="pf-section">
                  <p className="pf-role-section-label">Training Center</p>
                  {(() => {
                    const center = profile.centreGereId || profile.centreId;
                    return (
                      <div className="pf-center-card">
                        <div className="pf-info-row">
                          <span className="pf-info-label">Name</span>
                          <span className="pf-info-value" style={{ color: '#b4915a', fontWeight: 500 }}>{center.nom}</span>
                        </div>
                        <div className="pf-info-row">
                          <span className="pf-info-label">Address</span>
                          <span className="pf-info-value">{center.adresse}</span>
                        </div>
                        {center.telephone && (
                          <div className="pf-info-row">
                            <span className="pf-info-label">Phone</span>
                            <span className="pf-info-value">{center.telephone}</span>
                          </div>
                        )}
                        {center.description && (
                          <div className="pf-info-row" style={{ borderBottom: 'none' }}>
                            <span className="pf-info-label">Description</span>
                            <span className="pf-info-value" style={{ opacity: 0.7, fontSize: '13px', lineHeight: 1.5 }}>{center.description}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── Change Password ── */}
              <div className="pf-section">
                <div className="pf-section-header">
                  <span className="pf-section-title">Security</span>
                  {!showPasswordForm ? (
                    <button className="pf-btn-edit" onClick={() => setShowPasswordForm(true)}>Change Password</button>
                  ) : (
                    <div className="pf-actions">
                      <button className="pf-btn-cancel" onClick={() => { setShowPasswordForm(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>Cancel</button>
                      <button className="pf-btn-save" onClick={handlePasswordChange} disabled={changingPw}>
                        {changingPw ? <Spinner /> : <SaveIcon />}
                        {changingPw ? 'Updating…' : 'Update'}
                      </button>
                    </div>
                  )}
                </div>
                {showPasswordForm && (
                  <>
                    <div className="pf-info-row pf-info-row--edit">
                      <span className="pf-info-label">Current Password</span>
                      <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="pf-input" placeholder="••••••••" />
                    </div>
                    <div className="pf-info-row pf-info-row--edit">
                      <span className="pf-info-label">New Password</span>
                      <input type="password" name="newPassword" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="pf-input" placeholder="••••••••" />
                    </div>
                    <div className="pf-info-row pf-info-row--edit">
                      <span className="pf-info-label">Confirm Password</span>
                      <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="pf-input" placeholder="••••••••" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Danger Zone ── */}
            <div className="pf-danger-zone">
              <div className="pf-danger-header">
                <div className="pf-danger-header-dot" />
                <span className="pf-danger-header-label">Danger Zone</span>
              </div>
              <div className="pf-danger-body">
                <div className="pf-danger-info">
                  <div className="pf-danger-title">Delete Account</div>
                  <div className="pf-danger-desc">Permanently remove your account and all associated data. This cannot be undone.</div>
                </div>
                <button className="pf-btn-open-delete" onClick={() => setShowDeleteModal(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          profile={profile}
          onConfirm={handleDeleteConfirm}
          onClose={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}

      {success && (
        <div className="pf-toast success">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          {success}
        </div>
      )}
      {error && (
        <div className="pf-toast error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </div>
      )}
    </>
  );
};

export default Profile;