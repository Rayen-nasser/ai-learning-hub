import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import categorieService from '../../formations/services/categories';
import AdminLayout from '../components/AdminLayout';
import ResponsableCFLayout from '../../responsableCF/components/ResponsableCFLayout';

export default function AdminCategories() {
  const { user } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '', image: null });
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'responsableCF';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await categorieService.getAll();
      setCategories(res.data.data || []);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('nom', formData.nom);
      if (formData.description) data.append('description', formData.description);
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      } else if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingCategory) {
        await categorieService.update(editingCategory._id, data);
      } else {
        await categorieService.create(data);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ nom: '', description: '', image: null });
      setImagePreview('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ nom: category.nom || '', description: category.description || '', image: category.image || null });
    setImagePreview(category.image || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categorieService.delete(id);
      fetchCategories();
    } catch {
      setError('Failed to delete category');
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ nom: '', description: '', image: null });
    setImagePreview('');
    setShowModal(true);
  };

  const isResponsable = location.pathname.startsWith('/responsable');
  const Layout = isResponsable ? ResponsableCFLayout : AdminLayout;

  return (
    <Layout title="Course <em>Categories</em>" subtitle="Manage training course categories">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .cat-add-btn { padding: 10px 20px; background: linear-gradient(135deg, #b4915a, #c8a86e); color: #0c0c0e; font-size: 14px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.2s, transform 0.1s; font-family: 'DM Sans', sans-serif; }
        .cat-add-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .cat-add-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .cat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; transition: border-color 0.2s, transform 0.2s; }
        .cat-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
        .cat-card-image { width: 100%; height: 140px; object-fit: cover; background: rgba(255,255,255,0.05); }
        .cat-card-placeholder { width: 100%; height: 140px; background: linear-gradient(135deg, rgba(180,145,90,0.2), rgba(200,168,110,0.1)); display: flex; align-items: center; justify-content: center; }
        .cat-card-placeholder-icon { font-size: 48px; opacity: 0.3; }
        .cat-card-body { padding: 20px; }
        .cat-card-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #f0ebe0; margin: 0 0 8px; }
        .cat-card-desc { font-size: 14px; color: #666; line-height: 1.5; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cat-card-actions { display: flex; gap: 8px; }

        .cat-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); background: transparent; font-family: 'DM Sans', sans-serif; }
        .cat-btn-edit { color: #b4915a; }
        .cat-btn-edit:hover { background: rgba(180,145,90,0.15); }
        .cat-btn-delete { color: #e07070; }
        .cat-btn-delete:hover { background: rgba(224,112,112,0.15); }

        .cat-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .cat-modal { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; max-width: 500px; width: 100%; }
        .cat-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .cat-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; color: #f0ebe0; }
        .cat-modal-close { background: none; border: none; color: #555; cursor: pointer; font-size: 24px; }
        .cat-modal-close:hover { color: #e8e4dc; }
        .cat-modal-body { padding: 24px; }
        .cat-form-group { margin-bottom: 16px; }
        .cat-form-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin-bottom: 8px; }
        .cat-form-input, .cat-form-textarea { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e8e4dc; font-size: 14px; font-family: 'DM Sans', sans-serif; }
        .cat-form-textarea { min-height: 100px; resize: vertical; }
        .cat-form-input:focus, .cat-form-textarea:focus { border-color: #b4915a; outline: none; }
        .cat-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .cat-btn-cancel { padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #888; font-family: 'DM Sans', sans-serif; }
        .cat-btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: #e8e4dc; }
        .cat-btn-submit { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: linear-gradient(135deg, #b4915a, #c8a86e); color: #0c0c0e; font-family: 'DM Sans', sans-serif; }
        .cat-btn-submit:hover { opacity: 0.9; }
        .cat-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .cat-empty { text-align: center; padding: 60px 20px; color: #555; }
        .cat-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #888; margin-bottom: 8px; }
        .cat-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .cat-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #b4915a; animation: catspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes catspin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cat-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        {canManage && (
          <button className="cat-add-btn" onClick={openCreateModal}>
            + Add Category
          </button>
        )}
      </div>

      {error && <div className="cat-error">{error}</div>}

      {loading ? (
        <div className="cat-spinner" />
      ) : categories.length === 0 ? (
        <div className="cat-empty">
          <div className="cat-empty-title">No categories yet</div>
          <p>Create your first category to organize your courses</p>
        </div>
      ) : (
        <div className="cat-grid">
          {categories.map(category => (
            <div key={category._id} className="cat-card">
              {category.image ? (
                <img src={category.image} alt={category.nom} className="cat-card-image" />
              ) : (
                <div className="cat-card-placeholder">
                  <span className="cat-card-placeholder-icon">📁</span>
                </div>
              )}
              <div className="cat-card-body">
                <h3 className="cat-card-name">{category.nom}</h3>
                <p className="cat-card-desc">{category.description || 'No description'}</p>
                {/* Authorization: Only owner or admin can edit/delete */}
                {(user?.role === 'admin' || category.ownerId === user?._id) && (
                  <div className="cat-card-actions">
                    <button className="cat-btn cat-btn-edit" onClick={() => handleEdit(category)}>Edit</button>
                    <button className="cat-btn cat-btn-delete" onClick={() => handleDelete(category._id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="cat-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cat-modal" onClick={e => e.stopPropagation()}>
            <div className="cat-modal-header">
              <h2 className="cat-modal-title">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button className="cat-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="cat-modal-body">
                <div className="cat-form-group">
                  <label className="cat-form-label">Name *</label>
                  <input
                    type="text"
                    className="cat-form-input"
                    value={formData.nom}
                    onChange={e => setFormData(d => ({ ...d, nom: e.target.value }))}
                    placeholder="Category name"
                    required
                  />
                </div>
                <div className="cat-form-group">
                  <label className="cat-form-label">Description</label>
                  <textarea
                    className="cat-form-textarea"
                    value={formData.description}
                    onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                    placeholder="Category description..."
                  />
                </div>
                <div className="cat-form-group">
                  <label className="cat-form-label">Category image</label>
                  <label className="cat-file-drop" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                      const file = e.target.files[0];
                      if (file) { 
                        setFormData(d => ({ ...d, image: file })); 
                        setImagePreview(URL.createObjectURL(file)); 
                      }
                    }} />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    <span style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>Click to upload image</span>
                  </label>
                  {imagePreview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                      <img src={imagePreview} alt="preview" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <button type="button" style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(224,112,112,0.1)', border: '1px solid rgba(224,112,112,0.2)', color: '#e07070', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => { setFormData(d => ({ ...d, image: null })); setImagePreview(''); }}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="cat-modal-footer">
                <button type="button" className="cat-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="cat-btn-submit" disabled={submitting || !formData.nom.trim()}>
                  {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
