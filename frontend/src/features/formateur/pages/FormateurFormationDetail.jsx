import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formationService } from '../services/formation';
import { leconService } from '../services/lecon';
import FormateurLayout from '../components/FormateurLayout';

export default function FormateurFormationDetail() {
  const { id } = useParams();
  const [formation, setFormation] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({ titre: '', description: '', ordre: 0 });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const formationRes = await formationService.getById(id);
      setFormation(formationRes.data.data);
      
      try {
        const lessonsRes = await leconService.getAll({ formationId: id });
        setLessons(lessonsRes.data.data || []);
      } catch (lessonErr) {
        if (lessonErr.response?.status === 404) {
          setLessons([]);
        } else {
          throw lessonErr;
        }
      }
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titre.trim()) return;

    setSaving(true);
    try {
      if (editingLesson) {
        await leconService.update(editingLesson._id, { ...formData, formationId: id });
      } else {
        await leconService.create({ ...formData, formationId: id });
      }
      setShowModal(false);
      setEditingLesson(null);
      setFormData({ titre: '', description: '', ordre: 0 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await leconService.delete(confirmDelete._id);
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const openCreate = () => {
    setEditingLesson(null);
    setFormData({ titre: '', description: '', ordre: lessons.length + 1 });
    setShowModal(true);
  };

  const openEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({ titre: lesson.titre, description: lesson.description || '', ordre: lesson.ordre || 0 });
    setShowModal(true);
  };

  if (loading) {
    return (
      <FormateurLayout title="Loading...">
        <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>Loading...</div>
      </FormateurLayout>
    );
  }

  if (!formation) {
    return (
      <FormateurLayout title="Formation not found">
        <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>
          <p>This formation doesn't exist or you don't have access.</p>
          <Link to="/formateur/formations" style={{ color: '#c8a86e' }}>Back to formations</Link>
        </div>
      </FormateurLayout>
    );
  }

  return (
    <FormateurLayout 
      title={formation.titre} 
      subtitle={`${formation.centreId?.nom || ''} &middot; ${formation.duree || 0}h`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Link to="/formateur/formations" style={{ color: '#888', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to formations
        </Link>
        <button onClick={openCreate} style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #c8a86e, #b4915a)',
          color: '#0c0c0e',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          + Add Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ marginBottom: 16 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>No lessons yet</div>
          <div style={{ fontSize: 14, color: '#555' }}>Create your first lesson to start building content</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lessons.map((lesson, index) => (
            <div key={lesson._id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,168,110,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(200,168,110,0.1)', color: '#c8a86e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                {lesson.ordre || index + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/formateur/formations/${id}/lessons/${lesson._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#f0ebe0', marginBottom: 4 }}>{lesson.titre}</div>
                </Link>
                {lesson.description && (
                  <div style={{ fontSize: 13, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lesson.description}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(lesson)} style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: '#888',
                  fontSize: 13,
                  cursor: 'pointer',
                }}>
                  Edit
                </button>
                <button onClick={() => setConfirmDelete(lesson)} style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(224,112,112,0.3)',
                  borderRadius: 6,
                  color: '#e07070',
                  fontSize: 13,
                  cursor: 'pointer',
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#f0ebe0', fontWeight: 400 }}>
                {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 24, cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 8 }}>Title *</label>
                  <input type="text" value={formData.titre} onChange={e => setFormData(d => ({ ...d, titre: e.target.value }))} required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e4dc', fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 8 }}>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e4dc', fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #c8a86e, #b4915a)', color: '#0c0c0e', fontFamily: "'DM Sans', sans-serif", opacity: saving ? 0.5 : 1 }}>
                  {saving ? 'Saving...' : (editingLesson ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, maxWidth: 400, width: '100%', padding: 24, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(224,112,112,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e07070" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#f0ebe0', fontWeight: 500 }}>Delete Lesson?</h3>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: 14 }}>Are you sure you want to delete "{confirmDelete.titre}"? This will also delete all content in this lesson.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#e07070', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </FormateurLayout>
  );
}
