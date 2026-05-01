import { useState, useCallback, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';

/* ─── icons ─── */
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const Spinner = () => (
  <svg className="rf-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

/* ─── password strength ─── */
const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8)         score++;
  if (/[A-Z]/.test(pw))       score++;
  if (/[0-9]/.test(pw))       score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#e07070', '#e09a40', '#7dbf7d', '#4aa87d'];

/* ─── roles config ─── */
const ROLES = [
  { value: 'apprenant',    label: 'Student',         desc: 'Join courses & track progress',      icon: '🎓' },
  { value: 'formateur',    label: 'Trainer',          desc: 'Create & deliver training',           icon: '🧑‍🏫' },
];


/* ─── steps ─── */
const STEPS = ['Account', 'Profile', 'Role'];

const INITIAL_FORM = {
  nom: '', prenom: '', email: '', telephone: '',
  password: '', confirmPassword: '', user_image: null,
  role: '',
  niveauEtude: '', dateNaissance: '', adresse: '',
  specialite: '', experience: '',
};


/* ─── field helper (Outside to prevent remounting on each keystroke) ─── */
const Field = ({ name, label, type = 'text', placeholder, children, className = '', formData, touched, fieldErrors, change, blur, showPw, setShowPw, showCpw, setShowCpw, ...props }) => {
  const isSelect = !!children;
  const hasErr   = touched[name] && fieldErrors[name];
  return (
    <div className={`rf-field ${className}`}>
      <label className="rf-label">{label}</label>
      <div className="rf-input-wrap">
        {isSelect ? (
          <select
            name={name} value={formData[name]}
            onChange={change} onBlur={() => blur(name)}
            className={`rf-input rf-select${hasErr ? ' err' : ''}`}
            {...props}
          >
            {children}
          </select>
        ) : (
          <input
            name={name} type={type} placeholder={placeholder}
            value={formData[name]}
            onChange={change} onBlur={() => blur(name)}
            className={`rf-input${hasErr ? ' err' : ''}${
              (name === 'password' || name === 'confirmPassword') ? ' has-icon' : ''
            }`}
            {...props}
          />
        )}
        {name === 'password' && (
          <button type="button" className="rf-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
            <EyeIcon open={showPw} />
          </button>
        )}
        {name === 'confirmPassword' && (
          <button type="button" className="rf-eye" onClick={() => setShowCpw(p => !p)} tabIndex={-1}>
            <EyeIcon open={showCpw} />
          </button>
        )}
      </div>
      {hasErr && <p className="rf-field-error">{fieldErrors[name]}</p>}
    </div>
  );
};

const RegisterForm = () => {
  const [step, setStep]         = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [touched, setTouched]   = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const change = useCallback((e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files[0]) {
      setFormData(p => ({ ...p, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  }, []);

  const blur = (field) => setTouched(t => ({ ...t, [field]: true }));
  const touch = (fields) => setTouched(t => { const n = {...t}; fields.forEach(f => n[f]=true); return n; });

  /* ─── per-step validation ─── */
  const validate0 = () => {
    const e = {};
    if (!formData.nom.trim())                       e.nom     = 'Required';
    else if (formData.nom.trim().length < 2)        e.nom     = 'Min 2 characters';
    if (!formData.prenom.trim())                    e.prenom  = 'Required';
    else if (formData.prenom.trim().length < 2)     e.prenom  = 'Min 2 characters';
    if (!formData.email)                            e.email   = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email   = 'Invalid email';
    if (!formData.password)                         e.password = 'Required';
    else if (formData.password.length < 8)          e.password = 'Min 8 characters';
    if (!formData.confirmPassword)                  e.confirmPassword = 'Required';
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    
    if (formData.telephone && !/^(?:\+216|00216)?[ ]?[24579][0-9]{7}$/.test(formData.telephone)) {
      e.telephone = 'Invalid Tunisian phone number format';
    }
    return e;
  };
  const validate1 = () => ({});
  const validate2 = () => {
    const e = {};
    if (!formData.role) e.role = 'Please select a role';
    if (formData.dateNaissance) {
      const birth = new Date(formData.dateNaissance);
      const now = new Date();
      if (birth >= now) {
        e.dateNaissance = 'Birth date must be in the past';
      } else {
        const age = now.getFullYear() - birth.getFullYear();
        if (age < 13) e.dateNaissance = 'You must be at least 13 years old';
      }
    }
    return e;
  };
  const validators = [validate0, validate1, validate2];
  const fieldErrors = validators[step]();

  const nextStep = () => {
    const errs = validators[step]();
    if (Object.keys(errs).length) {
      touch(Object.keys(errs));
      return;
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate2();
    if (Object.keys(errs).length) { touch(['role']); return; }

    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== '') data.append(k, v);
      });
      await register(data);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(formData.password);

  /* ── step content ── */
  const renderStep = () => {
    if (step === 0) return (
      <>
        <div className="rf-row-2">
          <Field name="prenom" label="First Name" placeholder="Jane" autoComplete="given-name" formData={formData} touched={touched} fieldErrors={fieldErrors} change={change} blur={blur} />
          <Field name="nom"    label="Last Name"  placeholder="Doe"  autoComplete="family-name" formData={formData} touched={touched} fieldErrors={fieldErrors} change={change} blur={blur} />
        </div>
        <Field name="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" formData={formData} touched={touched} fieldErrors={fieldErrors} change={change} blur={blur} />
        <Field name="telephone" label="Phone (optional)" type="tel" placeholder="+216 00 000 000" formData={formData} touched={touched} fieldErrors={fieldErrors} change={change} blur={blur} />

        {/* password */}
        <div className="rf-field">
          <label className="rf-label">Password</label>
          <div className="rf-input-wrap">
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={change}
              onBlur={() => blur('password')}
              className={`rf-input has-icon${touched.password && fieldErrors.password ? ' err' : ''}`}
            />
            <button type="button" className="rf-eye" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
              <EyeIcon open={showPw} />
            </button>
          </div>
          {formData.password && (
            <div className="rf-strength">
              <div className="rf-strength-bars">
                {[1,2,3,4].map(n => (
                  <div key={n} className="rf-strength-bar" style={{ background: strength >= n ? strengthColor[strength] : 'rgba(255,255,255,.08)' }} />
                ))}
              </div>
              <span className="rf-strength-label" style={{ color: strengthColor[strength] }}>
                {strengthLabel[strength]}
              </span>
            </div>
          )}
          {touched.password && fieldErrors.password && <p className="rf-field-error">{fieldErrors.password}</p>}
        </div>

        <div className="rf-field">
          <label className="rf-label">Confirm Password</label>
          <div className="rf-input-wrap">
            <input
              name="confirmPassword"
              type={showCpw ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={change}
              onBlur={() => blur('confirmPassword')}
              className={`rf-input has-icon${touched.confirmPassword && fieldErrors.confirmPassword ? ' err' : ''}`}
            />
            <button type="button" className="rf-eye" onClick={() => setShowCpw(p => !p)} tabIndex={-1}>
              <EyeIcon open={showCpw} />
            </button>
          </div>
          {touched.confirmPassword && fieldErrors.confirmPassword && <p className="rf-field-error">{fieldErrors.confirmPassword}</p>}
          {!fieldErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="rf-field-ok">✓ Passwords match</p>
          )}
        </div>
      </>
    );

    if (step === 1) return (
      <>
        {/* Avatar upload */}
        <div className="rf-avatar-section">
          <div className="rf-avatar" onClick={() => document.getElementById('rf-file').click()}>
            {imagePreview
              ? <img src={imagePreview} alt="Preview" className="rf-avatar-img" />
              : <div className="rf-avatar-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Add photo</span>
                </div>
            }
            <div className="rf-avatar-overlay">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
          </div>
          <input id="rf-file" type="file" name="user_image" accept="image/*" onChange={change} style={{ display: 'none' }} />
          <div>
            <p className="rf-avatar-hint">Profile photo (optional)</p>
            <p className="rf-avatar-sub">JPG, PNG up to 5MB</p>
          </div>
        </div>

        <p className="rf-step-note">These details are optional — you can update them later in your profile.</p>
      </>
    );

    if (step === 2) return (
      <>
        <p className="rf-step-note" style={{ marginBottom: 20 }}>Choose your role to personalise your experience.</p>
        <div className="rf-role-grid">
          {ROLES.map(r => (
            <button
              key={r.value} type="button"
              className={`rf-role-card${formData.role === r.value ? ' selected' : ''}`}
              onClick={() => setFormData(p => ({ ...p, role: r.value }))}
            >
              <span className="rf-role-icon">{r.icon}</span>
              <span className="rf-role-label">{r.label}</span>
              <span className="rf-role-desc">{r.desc}</span>
              {formData.role === r.value && <span className="rf-role-check"><CheckIcon /></span>}
            </button>
          ))}
        </div>
        {touched.role && fieldErrors.role && <p className="rf-field-error" style={{marginTop:8}}>{fieldErrors.role}</p>}

        {/* Role-specific extra fields */}
        {formData.role === 'apprenant' && (
          <div className="rf-role-fields">
            <div className="rf-row-2">
              <div className="rf-field">
                <label className="rf-label">Education Level</label>
                <div className="rf-input-wrap">
                  <select name="niveauEtude" value={formData.niveauEtude} onChange={change} className="rf-input rf-select">
                    <option value="">Select level</option>
                    <option value="primaire">Primary</option>
                    <option value="secondaire">Secondary</option>
                    <option value="bac">Baccalaureate</option>
                    <option value="licence">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="doctorat">PhD</option>
                  </select>
                </div>
              </div>
              <div className="rf-field">
                <label className="rf-label">Date of Birth</label>
                <div className="rf-input-wrap">
                  <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={change} onBlur={() => blur('dateNaissance')} className={`rf-input${touched.dateNaissance && fieldErrors.dateNaissance ? ' err' : ''}`} />
                </div>
                {touched.dateNaissance && fieldErrors.dateNaissance && <p className="rf-field-error">{fieldErrors.dateNaissance}</p>}
              </div>
            </div>
            <div className="rf-field">
              <label className="rf-label">Address</label>
              <div className="rf-input-wrap">
                <input type="text" name="adresse" placeholder="Your address" value={formData.adresse} onChange={change} className="rf-input" />
              </div>
            </div>
          </div>
        )}
        {formData.role === 'formateur' && (
          <div className="rf-role-fields rf-row-2">
            <div className="rf-field">
              <label className="rf-label">Specialty</label>
              <div className="rf-input-wrap">
                <input type="text" name="specialite" placeholder="Your specialty" value={formData.specialite} onChange={change} className="rf-input" />
              </div>
            </div>
            <div className="rf-field">
              <label className="rf-label">Years of Experience</label>
              <div className="rf-input-wrap">
                <input type="number" name="experience" placeholder="0" min="0" value={formData.experience} onChange={change} className="rf-input" />
              </div>
            </div>
          </div>
        )}

      </>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .rf-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0c0c0e;
          font-family: 'DM Sans', sans-serif;
          color: #e8e4dc;
          padding: 40px 24px;
        }

        .rf-card { width: 100%; max-width: 480px; }

        .rf-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 500; letter-spacing: .04em;
          color: #b4915a; margin-bottom: 40px;
        }

        /* ── stepper ── */
        .rf-stepper {
          display: flex; align-items: center; gap: 0; margin-bottom: 36px;
        }
        .rf-step-item {
          display: flex; flex-direction: column; align-items: center; flex: 1;
        }
        .rf-step-dot {
          width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255,255,255,.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #555; background: transparent;
          transition: all .3s;
        }
        .rf-step-dot.active { border-color: #b4915a; color: #b4915a; background: rgba(180,145,90,.1); }
        .rf-step-dot.done  { border-color: #4aa87d; background: rgba(74,168,125,.15); color: #4aa87d; }
        .rf-step-name {
          font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #444; margin-top: 6px;
          transition: color .3s;
        }
        .rf-step-name.active { color: #b4915a; }
        .rf-step-name.done  { color: #4aa87d; }
        .rf-step-line { flex: 1; height: 1px; background: rgba(255,255,255,.08); margin: 0 4px; margin-bottom: 22px; }
        .rf-step-line.done { background: rgba(74,168,125,.3); }

        .rf-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 400; color: #f0ebe0; margin-bottom: 4px;
        }
        .rf-subtitle { font-size: 13px; color: #555; margin-bottom: 28px; }

        /* ── error banner ── */
        .rf-error {
          background: rgba(220,53,53,.08); border: 1px solid rgba(220,53,53,.25);
          border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #e07070;
          margin-bottom: 24px; display: flex; align-items: center; gap: 10px;
        }

        /* ── fields ── */
        .rf-field { margin-bottom: 18px; }
        .rf-label {
          display: block; font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
          color: #888; margin-bottom: 7px; font-weight: 500;
        }
        .rf-input-wrap { position: relative; }
        .rf-input {
          width: 100%; padding: 13px 16px; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
          font-size: 14px; color: #e8e4dc; font-family: 'DM Sans', sans-serif;
          transition: border-color .2s, background .2s; outline: none; box-sizing: border-box;
        }
        .rf-input::placeholder { color: #444; }
        .rf-input:focus { border-color: #b4915a; background: rgba(180,145,90,.05); }
        .rf-input.err { border-color: rgba(220,53,53,.5); }
        .rf-input.has-icon { padding-right: 48px; }
        .rf-select { appearance: none; cursor: pointer; color-scheme: dark; }
        .rf-select option { background: #1a1a1e; color: #e8e4dc; }
        .rf-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #666; cursor: pointer; padding: 4px;
          display: flex; align-items: center; transition: color .15s;
        }
        .rf-eye:hover { color: #b4915a; }
        .rf-field-error { font-size: 12px; color: #e07070; margin-top: 5px; }
        .rf-field-ok { font-size: 12px; color: #4aa87d; margin-top: 5px; }
        .rf-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* ── password strength ── */
        .rf-strength { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .rf-strength-bars { display: flex; gap: 4px; flex: 1; }
        .rf-strength-bar { height: 3px; flex: 1; border-radius: 2px; transition: background .3s; }
        .rf-strength-label { font-size: 12px; font-weight: 500; min-width: 40px; }

        /* ── avatar upload ── */
        .rf-avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
        .rf-avatar {
          width: 80px; height: 80px; border-radius: 50%; border: 2px dashed rgba(255,255,255,.15);
          cursor: pointer; overflow: hidden; position: relative; flex-shrink: 0;
          background: rgba(255,255,255,.03); transition: border-color .2s;
        }
        .rf-avatar:hover { border-color: #b4915a; }
        .rf-avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .rf-avatar-placeholder {
          width: 100%; height: 100%; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 4px; color: #555;
          font-size: 10px; text-align: center;
        }
        .rf-avatar-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,.5);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .2s;
        }
        .rf-avatar:hover .rf-avatar-overlay { opacity: 1; }
        .rf-avatar-hint { font-size: 13px; color: #aaa; margin-bottom: 3px; }
        .rf-avatar-sub  { font-size: 12px; color: #555; }

        .rf-step-note { font-size: 13px; color: #555; margin-bottom: 6px; line-height: 1.6; }

        /* ── role cards ── */
        .rf-role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px; }
        @media(max-width: 480px){ .rf-role-grid { grid-template-columns: 1fr; } }
        .rf-role-card {
          position: relative; display: flex; flex-direction: column; align-items: flex-start;
          padding: 16px 14px; background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.09); border-radius: 10px;
          cursor: pointer; text-align: left; transition: border-color .2s, background .2s;
          font-family: 'DM Sans', sans-serif;
        }
        .rf-role-card:hover { border-color: rgba(180,145,90,.4); background: rgba(180,145,90,.04); }
        .rf-role-card.selected { border-color: #b4915a; background: rgba(180,145,90,.08); }
        .rf-role-icon { font-size: 22px; margin-bottom: 8px; }
        .rf-role-label { font-size: 13px; font-weight: 500; color: #e8e4dc; margin-bottom: 3px; }
        .rf-role-desc  { font-size: 11px; color: #555; line-height: 1.4; }
        .rf-role-check {
          position: absolute; top: 10px; right: 10px;
          width: 18px; height: 18px; border-radius: 50%; background: #b4915a;
          display: flex; align-items: center; justify-content: center; color: #0c0c0e;
        }
        .rf-role-fields { margin-top: 18px; }

        /* ── nav buttons ── */
        .rf-nav {
          display: flex; gap: 10px; margin-top: 8px;
        }
        .rf-btn-back {
          padding: 14px 20px; border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
          background: transparent; color: #888; font-family: 'DM Sans', sans-serif;
          font-size: 14px; cursor: pointer; transition: border-color .2s, color .2s; flex-shrink: 0;
        }
        .rf-btn-back:hover { border-color: rgba(255,255,255,.2); color: #e8e4dc; }
        .rf-btn-next {
          flex: 1; padding: 14px; border: none; border-radius: 8px;
          background: linear-gradient(135deg, #b4915a, #c8a86e);
          color: #0c0c0e; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; letter-spacing: .04em;
          cursor: pointer; transition: opacity .2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .rf-btn-next:hover:not(:disabled) { opacity: .9; }
        .rf-btn-next:disabled { opacity: .5; cursor: not-allowed; }

        .rf-spinner { animation: rf-spin .8s linear infinite; }
        @keyframes rf-spin { to { transform: rotate(360deg); } }

        /* ── progress bar ── */
        .rf-progress {
          height: 2px; background: rgba(255,255,255,.06); border-radius: 1px; margin-bottom: 32px;
        }
        .rf-progress-fill {
          height: 100%; border-radius: 1px; background: linear-gradient(90deg, #b4915a, #c8a86e);
          transition: width .4s ease;
        }

        .rf-footer { text-align: center; font-size: 13px; color: #555; margin-top: 24px; }
        .rf-footer a { color: #b4915a; text-decoration: none; font-weight: 500; }
        .rf-footer a:hover { text-decoration: underline; color: #d4b07a; }
      `}</style>

      <div className="rf-root">
        <div className="rf-card">
          <div className="rf-logo">Forma</div>

          {/* Progress */}
          <div className="rf-progress">
            <div className="rf-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>

          {/* Stepper */}
          <div className="rf-stepper">
            {STEPS.map((label, i) => (
              <Fragment key={i}>
                <div className="rf-step-item">
                  <div className={`rf-step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                    {i < step ? <CheckIcon /> : i + 1}
                  </div>
                  <span className={`rf-step-name ${i < step ? 'done' : i === step ? 'active' : ''}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`rf-step-line${i < step ? ' done' : ''}`} key={`line-${i}`} />}
              </Fragment>
            ))}
          </div>

          <h1 className="rf-title">
            {step === 0 ? 'Create your account' : step === 1 ? 'Complete your profile' : 'Choose your role'}
          </h1>
          <p className="rf-subtitle">
            {step === 0 ? 'Fill in your credentials to get started'
              : step === 1 ? 'Add a photo to personalize your experience'
              : 'How will you be using Forma?'}
          </p>

          {error && (
            <div className="rf-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {renderStep()}

            <div className="rf-nav" style={{ marginTop: 28 }}>
              {step > 0 && (
                <button type="button" className="rf-btn-back" onClick={() => setStep(s => s - 1)}>
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="rf-btn-next" onClick={nextStep}>
                  Continue →
                </button>
              ) : (
                <button type="submit" className="rf-btn-next" disabled={loading}>
                  {loading ? <><Spinner /> Creating account…</> : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          <p className="rf-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;