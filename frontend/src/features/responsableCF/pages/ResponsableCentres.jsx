import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { centreService } from '../services/centre';
import ResponsableCFLayout from '../components/ResponsableCFLayout';

export default function ResponsableCentres() {
  const navigate = useNavigate();
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);
  const [formData, setFormData] = useState({ nom: '', adresse: '', description: '', telephone: '', logo: null, user_image: null });
  const [logoPreview, setLogoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await centreService.getMyCentres();
      setCentres(res.data.data || []);
    } catch {
      setError('Failed to load centres');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim() || !editingCentre) return;

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('nom', formData.nom);
      data.append('adresse', formData.adresse);
      data.append('description', formData.description);
      data.append('telephone', formData.telephone);
      if (formData.logo) data.append('logo', formData.logo);

      await centreService.update(editingCentre._id, data);
      
      setShowModal(false);
      setEditingCentre(null);
      setFormData({ nom: '', adresse: '', description: '', telephone: '', logo: null, user_image: null });
      setLogoPreview('');
      fetchCentres();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save centre');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (centre) => {
    setEditingCentre(centre);
    setFormData({
      nom: centre.nom || '',
      adresse: centre.adresse || '',
      description: centre.description || '',
      telephone: centre.telephone || '',
      logo: null,
    });
    setLogoPreview(centre.logo || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this centre?')) return;
    try {
      await centreService.delete(id);
      fetchCentres();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete centre');
    }
  };



  return (
    <ResponsableCFLayout title="My <em>Centres</em>" subtitle="Manage your training centres">
      <style>{`
        .rc-add-btn { padding: 10px 20px; background: linear-gradient(135deg, #7dbf7d, #4aa87d); color: #0c0c0e; font-size: 14px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; font-family: 'DM Sans', sans-serif; }
        .rc-add-btn:hover { opacity: 0.9; }

        .rc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .rc-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; transition: border-color 0.2s, transform 0.2s; }
        .rc-card:hover { border-color: rgba(125,191,125,0.3); transform: translateY(-2px); }
        .rc-card-image { width: 100%; height: 160px; object-fit: cover; background: linear-gradient(135deg, rgba(106,159,216,0.2), rgba(106,159,216,0.1)); display: flex; align-items: center; justify-content: center; }
        .rc-card-image img { width: 100%; height: 100%; object-fit: cover; }
        .rc-card-image svg { width: 48px; height: 48px; opacity: 0.3; color: #6a9fd8; }
        .rc-card-body { padding: 20px; }
        .rc-card-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #f0ebe0; margin: 0 0 8px; }
        .rc-card-address { font-size: 13px; color: #555; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .rc-card-desc { font-size: 14px; color: #666; line-height: 1.5; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .rc-card-actions { display: flex; gap: 8px; }

        .rc-btn { flex: 1; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); background: transparent; font-family: 'DM Sans', sans-serif; }
        .rc-btn-edit { color: #7dbf7d; }
        .rc-btn-edit:hover { background: rgba(125,191,125,0.15); }
        .rc-btn-delete { color: #e07070; }
        .rc-btn-delete:hover { background: rgba(224,112,112,0.15); }

        .rc-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .rc-modal { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; max-width: 500px; width: 100%; }
        .rc-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .rc-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; color: #f0ebe0; }
        .rc-modal-close { background: none; border: none; color: #555; cursor: pointer; font-size: 24px; }
        .rc-modal-close:hover { color: #e8e4dc; }
        .rc-modal-body { padding: 24px; }
        .rc-form-group { margin-bottom: 16px; }
        .rc-form-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin-bottom: 8px; }
        .rc-form-input, .rc-form-textarea { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e8e4dc; font-size: 14px; font-family: 'DM Sans', sans-serif; }
        .rc-form-textarea { min-height: 100px; resize: vertical; }
        .rc-form-input:focus, .rc-form-textarea:focus { border-color: #7dbf7d; outline: none; }
        .rc-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .rc-btn-cancel { padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #888; font-family: 'DM Sans', sans-serif; }
        .rc-btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: #e8e4dc; }
        .rc-btn-submit { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: linear-gradient(135deg, #7dbf7d, #4aa87d); color: #0c0c0e; font-family: 'DM Sans', sans-serif; }
        .rc-btn-submit:hover { opacity: 0.9; }
        .rc-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .rc-form-file { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; color: #888; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; }
        .rc-form-file:hover { border-color: #7dbf7d; }
        .rc-logo-preview { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; margin-top: 12px; border: 1px solid rgba(255,255,255,0.1); }

        .rc-empty { text-align: center; padding: 60px 20px; color: #555; }
        .rc-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #888; margin-bottom: 8px; }
        .rc-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .rc-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #7dbf7d; animation: rcspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes rcspin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button className="rc-add-btn" onClick={() => navigate('/centres/apply')}>+ Apply for New Centre</button>
      </div>

      {error && <div className="rc-error">{error}</div>}

      {loading ? (
        <div className="rc-spinner" />
      ) : centres.length === 0 ? (
        <div className="rc-empty">
          <div className="rc-empty-title">No centres yet</div>
          <p>Create your first training centre to get started</p>
        </div>
      ) : (
        <div className="rc-grid">
          {centres.map(centre => (
            <div key={centre._id} className="rc-card">
              <div className="rc-card-image">
                {centre.logo ? (
                  <img src={centre.logo.startsWith('http') ? centre.logo : `http://localhost:5000/${centre.logo}`} alt={centre.nom} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/></svg>
                )}
              </div>
              <div className="rc-card-body">
                <h3 className="rc-card-name">{centre.nom}</h3>
                <div className="rc-card-address">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {centre.adresse || 'No address'}
                </div>
                <p className="rc-card-desc">{centre.description || 'No description'}</p>
                <div className="rc-card-actions">
                  <button className="rc-btn rc-btn-edit" onClick={() => handleEdit(centre)}>Edit</button>
                  <button 
                    className="rc-btn rc-btn-delete" 
                    onClick={() => handleDelete(centre._id)}
                    disabled={centre.status !== 'rejected'}
                    title={centre.status !== 'rejected' ? 'Only rejected centres can be deleted' : ''}
                    style={centre.status !== 'rejected' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="rc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="rc-modal" onClick={e => e.stopPropagation()}>
            <div className="rc-modal-header">
              <h2 className="rc-modal-title">{editingCentre ? 'Edit Centre' : 'Add Centre'}</h2>
              <button className="rc-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="rc-modal-body">
                <div className="rc-form-group">
                  <label className="rc-form-label">Name *</label>
                  <input type="text" className="rc-form-input" value={formData.nom} onChange={e => setFormData(d => ({ ...d, nom: e.target.value }))} placeholder="Centre name" required />
                </div>
                <div className="rc-form-group">
                  <label className="rc-form-label">Address</label>
                  <input type="text" className="rc-form-input" value={formData.adresse} onChange={e => setFormData(d => ({ ...d, adresse: e.target.value }))} placeholder="Address" />
                </div>
                <div className="rc-form-group">
                  <label className="rc-form-label">Phone</label>
                  <input type="text" className="rc-form-input" value={formData.telephone} onChange={e => setFormData(d => ({ ...d, telephone: e.target.value }))} placeholder="Phone number" />
                </div>
                <div className="rc-form-group">
                  <label className="rc-form-label">Description</label>
                  <textarea className="rc-form-textarea" value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} placeholder="Description..." />
                </div>
                <div className="rc-form-group">
                  <label className="rc-form-label">Logo</label>
                  <input type="file" className="rc-form-file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData(d => ({ ...d, logo: file }));
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }} />
                  {logoPreview && <img src={logoPreview} alt="Logo preview" className="rc-logo-preview" />}
                </div>
              </div>
              <div className="rc-modal-footer">
                <button type="button" className="rc-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="rc-btn-submit" disabled={submitting || !formData.nom.trim()}>
                  {submitting ? 'Saving...' : (editingCentre ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResponsableCFLayout>
  );
}
