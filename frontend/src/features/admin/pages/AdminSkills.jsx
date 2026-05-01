import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import skillService from '../../profile/services/skill';
import AdminLayout from '../components/AdminLayout';

export default function AdminSkills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await skillService.getAll();
      setSkills(res.data.data || res.data || []);
    } catch {
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingSkill) {
        await skillService.update(editingSkill._id, formData);
      } else {
        await skillService.create(formData);
      }
      setShowModal(false);
      setEditingSkill(null);
      setFormData({ name: '', category: '', description: '' });
      fetchSkills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({ 
      name: skill.name || '', 
      category: skill.category || '', 
      description: skill.description || '' 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await skillService.delete(id);
      fetchSkills();
    } catch {
      setError('Failed to delete skill');
    }
  };

  const openCreateModal = () => {
    setEditingSkill(null);
    setFormData({ name: '', category: '', description: '' });
    setShowModal(true);
  };

  return (
    <AdminLayout title="Skill <em>Registry</em>" subtitle="Manage official skills for teacher matching">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .skill-add-btn { padding: 10px 20px; background: linear-gradient(135deg, #b4915a, #c8a86e); color: #0c0c0e; font-size: 14px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.2s, transform 0.1s; font-family: 'DM Sans', sans-serif; }
        .skill-add-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .skill-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .skill-card { 
          background: rgba(255,255,255,0.02); 
          border: 1px solid rgba(255,255,255,0.06); 
          border-radius: 20px; 
          padding: 24px; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .skill-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
          background: linear-gradient(90deg, #b4915a, transparent);
          opacity: 0.5;
        }
        .skill-card:hover { 
          border-color: rgba(180,145,90,0.3); 
          background: rgba(255,255,255,0.04);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }
        .skill-cat { 
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; 
          color: #b4915a; margin-bottom: 12px; font-weight: 500;
          background: rgba(180,145,90,0.1); padding: 4px 10px; border-radius: 4px;
          display: inline-block;
        }
        .skill-name { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; color: #f0ebe0; margin: 0 0 10px; }
        .skill-desc { font-size: 13.5px; color: #777; line-height: 1.6; margin-bottom: 24px; min-height: 42px; }
        .skill-actions { display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 20px; }

        .skill-btn { padding: 8px 16px; border-radius: 10px; font-size: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08); background: transparent; font-family: 'DM Sans', sans-serif; font-weight: 500; }
        .skill-btn-edit { color: #b4915a; }
        .skill-btn-edit:hover { background: rgba(180,145,90,0.1); border-color: rgba(180,145,90,0.3); }
        .skill-btn-delete { color: #e07070; }
        .skill-btn-delete:hover { background: rgba(224,112,112,0.1); border-color: rgba(224,112,112,0.3); }

        .skill-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); animation: fadeIn 0.3s ease; }
        .skill-modal { background: #111114; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; max-width: 480px; width: 100%; box-shadow: 0 32px 80px rgba(0,0,0,0.6); animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .skill-modal-header { padding: 28px 32px 0; display: flex; justify-content: space-between; align-items: flex-start; }
        .skill-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #f0ebe0; font-weight: 400; }
        .skill-modal-body { padding: 32px; }
        .skill-form-group { margin-bottom: 20px; }
        .skill-label { display: block; font-size: 11px; text-transform: uppercase; color: #555; margin-bottom: 8px; letter-spacing: 0.1em; }
        .skill-input, .skill-textarea { width: 100%; padding: 14px 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #e8e4dc; font-size: 14px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .skill-textarea { min-height: 100px; resize: vertical; }
        .skill-input:focus, .skill-textarea:focus { border-color: #b4915a; background: rgba(180,145,90,0.03); outline: none; }
        .skill-modal-footer { padding: 0 32px 32px; display: flex; justify-content: flex-end; gap: 12px; }
        .skill-btn-cancel { padding: 12px 24px; border-radius: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #888; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .skill-btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: #e8e4dc; }
        .skill-btn-submit { padding: 12px 32px; border-radius: 12px; background: linear-gradient(135deg, #b4915a, #c8a86e); border: none; color: #0c0c0e; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 4px 12px rgba(180,145,90,0.3); transition: all 0.2s; }
        .skill-btn-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(180,145,90,0.4); }
        .skill-btn-submit:active { transform: translateY(0); }
        
        .skill-spinner { width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #b4915a; animation: skillspin 0.8s linear infinite; margin: 40px auto; display: block; }
        @keyframes skillspin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button className="skill-add-btn" onClick={openCreateModal}>
          + New Skill
        </button>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(224,112,112,0.1)', border: '1px solid rgba(224,112,112,0.2)', borderRadius: '8px', color: '#e07070', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div className="skill-spinner" />
      ) : skills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>No skills cataloged</div>
          <p>Add the first specialized skill to enable teacher matching.</p>
        </div>
      ) : (
        <div className="skill-grid">
          {skills.map(skill => (
            <div key={skill._id} className="skill-card">
              <div className="skill-cat">{skill.category || 'General'}</div>
              <h3 className="skill-name">{skill.name}</h3>
              <p className="skill-desc">{skill.description || 'No description provided.'}</p>
              <div className="skill-actions">
                <button className="skill-btn skill-btn-edit" onClick={() => handleEdit(skill)}>Edit</button>
                <button className="skill-btn skill-btn-delete" onClick={() => handleDelete(skill._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="skill-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="skill-modal" onClick={e => e.stopPropagation()}>
            <div className="skill-modal-header">
              <h2 className="skill-modal-title">{editingSkill ? 'Update Skill' : 'Register New Skill'}</h2>
              <button style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '20px' }} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="skill-modal-body">
                <div className="skill-form-group">
                  <label className="skill-label">Skill Name *</label>
                  <input
                    type="text"
                    className="skill-input"
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                    placeholder="e.g. React.js, Project Management..."
                    required
                    autoFocus
                  />
                </div>
                <div className="skill-form-group">
                  <label className="skill-label">Category</label>
                  <input
                    type="text"
                    className="skill-input"
                    value={formData.category}
                    onChange={e => setFormData(d => ({ ...d, category: e.target.value }))}
                    placeholder="e.g. Programming, Soft Skills..."
                  />
                </div>
                <div className="skill-form-group">
                  <label className="skill-label">Description</label>
                  <textarea
                    className="skill-textarea"
                    value={formData.description}
                    onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                    placeholder="What does this skill cover?"
                  />
                </div>
              </div>
              <div className="skill-modal-footer">
                <button type="button" className="skill-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="skill-btn-submit" disabled={submitting || !formData.name.trim()}>
                  {submitting ? 'Processing...' : (editingSkill ? 'Save Changes' : 'Create Skill')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
