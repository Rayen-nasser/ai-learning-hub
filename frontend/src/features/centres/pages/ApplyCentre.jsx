import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import centreService from '../services/centres';

export default function ApplyCentre() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    description: '',
  });

  const [files, setFiles] = useState({
    logo: null,
    registration: null,
    tax_id: null,
    identity: null,
    authorization: null,
    lease: null,
  });

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await centreService.getRequirements();
        // Backend returns { data: [ { type, name, mandatory } ] }
        setRequirements(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch requirements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    Object.keys(files).forEach(key => {
      if (files[key]) data.append(key, files[key]);
    });

    try {
      await centreService.create(data);
      setSuccess(true);
      setTimeout(() => navigate('/centres/my-requests'), 3000);
    } catch (err) {
      const missing = err.response?.data?.missing;
      if (missing && missing.length > 0) {
        setError(`Missing mandatory documents: ${missing.join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Failed to submit application. Please check all mandatory files.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ac-loading">
      <div className="ac-spinner" />
      <p>Loading requirements...</p>
    </div>
  );

  if (success) return (
    <div className="ac-success-overlay">
      <div className="ac-success-card">
        <div className="ac-success-icon">✓</div>
        <h2>Application Submitted!</h2>
        <p>Your request is now "Pending Review". We will notify you once an admin has reviewed your documents.</p>
        <button onClick={() => navigate('/centres/my-requests')} className="ac-btn-primary">Go to My Requests</button>
      </div>
    </div>
  );

  return (
    <div className="ac-container">
      <style>{`
        .ac-container { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: 'DM Sans', sans-serif; }
        .ac-header { margin-bottom: 40px; text-align: center; }
        .ac-header h1 { font-family: 'Cormorant Garamond', serif; font-size: 36px; color: #b4915a; margin-bottom: 10px; }
        .ac-header p { color: #888; font-size: 16px; }

        .ac-requirements { background: rgba(180,145,90,0.05); border: 1px solid rgba(180,145,90,0.2); border-radius: 16px; padding: 24px; margin-bottom: 32px; }
        .ac-requirements h3 { font-size: 18px; color: #b4915a; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .ac-req-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .ac-req-item { display: flex; align-items: center; gap: 8px; color: #aaa; font-size: 14px; }
        .ac-req-dot { width: 6px; height: 6px; border-radius: 50%; background: #b4915a; }

        .ac-form { display: flex; flex-direction: column; gap: 32px; }
        .ac-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 32px; }
        .ac-section-title { font-size: 20px; color: #e8e4dc; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; }

        .ac-field-group { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .ac-field { display: flex; flex-direction: column; gap: 8px; }
        .ac-field.full { grid-column: span 2; }
        .ac-field label { font-size: 14px; color: #aaa; font-weight: 500; }
        .ac-field input, .ac-field textarea { 
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; 
          padding: 12px 16px; color: #e8e4dc; font-size: 15px; transition: all 0.2s;
        }
        .ac-field input:focus, .ac-field textarea:focus { border-color: #b4915a; outline: none; background: rgba(255,255,255,0.06); }
        .ac-field input::placeholder { color: #555; }

        .ac-file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .ac-file-input { 
          position: relative; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; 
          text-align: center; transition: all 0.2s; cursor: pointer; background: rgba(255,255,255,0.01);
        }
        .ac-file-input:hover { border-color: #b4915a; background: rgba(180,145,90,0.03); }
        .ac-file-input.has-file { border-style: solid; border-color: #7dbf7d; background: rgba(125,191,125,0.03); }
        .ac-file-input input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .ac-file-label { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .ac-file-name { font-size: 14px; color: #e8e4dc; font-weight: 500; }
        .ac-file-desc { font-size: 12px; color: #555; }
        .ac-file-status { font-size: 12px; color: #7dbf7d; margin-top: 4px; font-weight: 600; }

        .ac-error-msg { 
          padding: 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); 
          border-radius: 12px; color: #e07070; font-size: 14px; margin-bottom: 24px;
        }

        .ac-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 20px; }
        .ac-btn-primary { 
          padding: 14px 40px; border-radius: 12px; background: linear-gradient(135deg, #b4915a, #c8a86e); 
          color: #0c0c0e; font-weight: 600; font-size: 16px; border: none; cursor: pointer; 
          transition: all 0.2s; display: flex; align-items: center; gap: 10px;
        }
        .ac-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(180,145,90,0.3); }
        .ac-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .ac-spinner { width: 20px; height: 20px; border: 2px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ac-success-overlay { position: fixed; inset: 0; background: #0c0c0e; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .ac-success-card { max-width: 500px; text-align: center; }
        .ac-success-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(125,191,125,0.1); color: #7dbf7d; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 24px; border: 2px solid #7dbf7d; }
        .ac-success-card h2 { font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #e8e4dc; margin-bottom: 16px; }
        .ac-success-card p { color: #888; margin-bottom: 32px; line-height: 1.6; }

        @media (max-width: 640px) {
          .ac-field-group { grid-template-columns: 1fr; }
          .ac-field.full { grid-column: span 1; }
        }
      `}</style>

      <div className="ac-header">
        <h1>Create Your Training Center</h1>
        <p>Fill in the details and upload the required legal documents to begin the verification process.</p>
      </div>

      <div className="ac-requirements">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Mandatory Requirements
        </h3>
        <div className="ac-req-list">
          {requirements.map((req, i) => (
            <div key={i} className="ac-req-item">
              <span className="ac-req-dot" style={{ background: req.mandatory ? '#b4915a' : '#555' }} />
              <span>{req.name || req.type}</span>
              {req.mandatory && <span style={{ fontSize: '10px', color: '#b4915a', marginLeft: '4px' }}>*</span>}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="ac-error-msg">{error}</div>}

      <form className="ac-form" onSubmit={handleSubmit}>
        <section className="ac-section">
          <h2 className="ac-section-title">General Information</h2>
          <div className="ac-field-group">
            <div className="ac-field">
              <label>Center Name *</label>
              <input name="nom" value={formData.nom} onChange={handleInputChange} placeholder="e.g. Excellence Academy" required />
            </div>
            <div className="ac-field">
              <label>Phone Number *</label>
              <input name="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="+216 ..." required />
            </div>
            <div className="ac-field full">
              <label>Address *</label>
              <input name="adresse" value={formData.adresse} onChange={handleInputChange} placeholder="Full physical address" required />
            </div>
            <div className="ac-field full">
              <label>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Briefly describe your center and its mission..." rows="4" required />
            </div>
          </div>
        </section>

        <section className="ac-section">
          <h2 className="ac-section-title">Public Identity</h2>
          <div className={`ac-file-input ${files.logo ? 'has-file' : ''}`}>
            <input type="file" name="logo" accept="image/*" onChange={handleFileChange} />
            <div className="ac-file-label">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span className="ac-file-name">{files.logo ? files.logo.name : 'Upload Logo (optional)'}</span>
              <span className="ac-file-desc">Official logo of your training center (JPG, PNG)</span>
              {files.logo && <span className="ac-file-status">✓ Selected</span>}
            </div>
          </div>
        </section>

        <section className="ac-section">
          <h2 className="ac-section-title">Legal Documentation</h2>
          <p style={{ color: '#555', fontSize: '13px', marginBottom: '20px' }}>These documents are private and only used for verification purposes.</p>
          
          <div className="ac-file-grid">
            {[
              { key: 'registration', label: 'Trade Register (Registre de Commerce)', desc: 'Proof of legal entity registration' },
              { key: 'tax_id', label: 'Tax ID Card (Carte Matricule Fiscale)', desc: 'Your center\'s tax identification' },
              { key: 'identity', label: 'Manager ID (CIN / Passport)', desc: 'Valid ID of the legal representative' },
              { key: 'authorization', label: 'Ministry Authorization', desc: 'Official permit to operate as a center' },
              { key: 'lease', label: 'Lease Agreement / Ownership', desc: 'Proof of premises availability' },
            ].map(doc => (
              <div key={doc.key} className={`ac-file-input ${files[doc.key] ? 'has-file' : ''}`}>
                <input type="file" name={doc.key} accept=".pdf,image/*" onChange={handleFileChange} required />
                <div className="ac-file-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  <span className="ac-file-name">{files[doc.key] ? files[doc.key].name : doc.label}</span>
                  <span className="ac-file-desc">{doc.desc}</span>
                  {files[doc.key] && <span className="ac-file-status">Selected</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="ac-actions">
          <button type="button" onClick={() => navigate(-1)} className="ac-btn-secondary" style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
          <button type="submit" disabled={submitting} className="ac-btn-primary">
            {submitting ? (
              <>
                <div className="ac-spinner" /> Submitting...
              </>
            ) : (
              'Submit for Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
