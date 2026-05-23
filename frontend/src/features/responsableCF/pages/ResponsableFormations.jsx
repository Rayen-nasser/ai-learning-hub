import { useState, useEffect, useCallback } from 'react';
import { formationService } from '../services/formation';
import { centreService } from '../services/centre';
import categorieService from '../../formations/services/categories';
import skillService from '../../profile/services/skill';
import ResponsableCFLayout from '../components/ResponsableCFLayout';

// ── Toast hook ────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
}

function ToastContainer({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, pointerEvents: 'all',
          background: t.type === 'success' ? '#e8f5e9' : '#fbe9e7',
          border: `1px solid ${t.type === 'success' ? 'rgba(46,125,50,0.3)' : 'rgba(198,40,40,0.3)'}`,
          color: t.type === 'success' ? '#2e7d32' : '#c62828',
          animation: 'toastIn .25s ease',
        }}>
          {t.type === 'success'
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          }
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
function ConfirmModal({ formation, onConfirm, onCancel }) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={{ ...styles.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(224,112,112,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e07070" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Delete formation?</div>
          <div style={{ fontSize: 14, color: '#888', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{formation?.titre}</strong> will be permanently removed. This cannot be undone.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 24px 24px' }}>
          <button style={styles.btnCancel} onClick={onCancel}>Cancel</button>
          <button style={{ ...styles.btnPrimary, background: '#c0392b' }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Formation Card ────────────────────────────────────────────────────────────
function FormationCard({ formation, onEdit, onDelete }) {
  const isFree = formation.prix === 0;
  const formateurs = formation.formateurIds || [];

  return (
    <div style={styles.card}>
      <div style={styles.cardImg}>
        {formation.image
          ? <img src={formation.image} alt={formation.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="1.5" style={{ opacity: 0.25 }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        }
        <div style={{ ...styles.badge, ...(isFree ? styles.badgeFree : styles.badgePaid) }}>
          {isFree ? 'Free' : `${formation.prix} DT`}
        </div>
      </div>

      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{formation.titre}</h3>

        {formation.description && (
          <p style={styles.cardDesc}>{formation.description}</p>
        )}

        <div style={styles.metaRow}>
          <span style={styles.chip}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            {formation.centreId?.nom || '—'}
          </span>
          <span style={styles.chip}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {formation.duree || 0}h
          </span>
          {formation.categorieId?.nom && (
            <span style={styles.chip}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
              {formation.categorieId.nom}
            </span>
          )}
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={styles.formateurLabel}>Formateurs</div>
          {formateurs.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {formateurs.slice(0, 4).map(f => (
                <div key={f._id} title={`${f.prenom} ${f.nom}`} style={styles.avatarSm}>
                  {f.user_image
                    ? <img src={f.user_image.startsWith('http') ? f.user_image : `http://localhost:5000/${f.user_image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : (f.prenom?.[0] || f.nom?.[0] || '?').toUpperCase()
                  }
                </div>
              ))}
              {formateurs.length > 4 && (
                <div style={{ ...styles.avatarSm, background: 'var(--border-main)', color: '#888', fontSize: 10, border: '2px solid rgba(255,255,255,0.1)' }}>
                  +{formateurs.length - 4}
                </div>
              )}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: '#555' }}>None assigned</span>
          )}
        </div>

        <div style={styles.cardActions}>
          <button style={{ ...styles.actionBtn, color: '#c8a86e' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,168,110,0.12)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => onEdit(formation)}>Edit</button>
          <button style={{ ...styles.actionBtn, color: '#e07070' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,112,112,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => onDelete(formation)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Formation Form Modal ──────────────────────────────────────────────────────
function FormationModal({ editing, centres, categories, allSkills, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    titre: editing?.titre || '',
    description: editing?.description || '',
    prix: editing?.prix ?? 0,
    duree: editing?.duree ?? 0,
    centreId: editing?.centreId?._id || (centres.length === 1 ? centres[0]._id : ''),
    categorieId: editing?.categorieId?._id || '',
    requiredSkills: editing?.requiredSkills?.map(s => s._id || s) || [],
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(editing?.image || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => {
    setFormData(d => ({ ...d, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.titre.trim()) e.titre = 'Title is required';
    if (!formData.centreId) e.centreId = 'Centre is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'image' && v) data.append('image', v);
        else if (k === 'requiredSkills') data.append(k, JSON.stringify(v));
        else if (k !== 'image') data.append(k, v);
      });
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{editing ? 'Edit formation' : 'Add formation'}</h2>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div style={styles.modalBody}>
          {/* Title */}
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Title *</label>
            <input
              style={{ ...styles.input, ...(errors.titre ? styles.inputError : {}) }}
              value={formData.titre}
              onChange={e => set('titre', e.target.value)}
              placeholder="e.g. Introduction to React"
              autoFocus
            />
            {errors.titre && <div style={styles.fieldError}>{errors.titre}</div>}
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Description</label>
            <textarea
              style={styles.textarea}
              value={formData.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief description of the course…"
            />
          </div>

          {/* Price + Duration */}
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Price (DT)</label>
              <input type="number" style={styles.input} value={formData.prix} onChange={e => set('prix', Number(e.target.value))} min="0" step="0.01" />
            </div>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Duration (hours)</label>
              <input type="number" style={styles.input} value={formData.duree} onChange={e => set('duree', Number(e.target.value))} min="0" />
            </div>
          </div>

          {/* Centre + Category */}
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Centre *</label>
              <select
                style={{ ...styles.select, ...(errors.centreId ? styles.inputError : {}) }}
                value={formData.centreId}
                onChange={e => set('centreId', e.target.value)}
              >
                <option value="">Select centre…</option>
                {centres.map(c => <option key={c._id} value={c._id}>{c.nom}</option>)}
              </select>
              {errors.centreId && <div style={styles.fieldError}>{errors.centreId}</div>}
            </div>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Category</label>
              <select style={styles.select} value={formData.categorieId} onChange={e => set('categorieId', e.target.value)}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.nom}</option>)}
              </select>
            </div>
          </div>

          {/* Image */}
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Cover image</label>
            <label style={styles.fileDrop}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files[0];
                if (file) { set('image', file); setImagePreview(URL.createObjectURL(file)); }
              }} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              <span style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>Click or drag & drop an image</span>
            </label>
            {imagePreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                <img src={imagePreview} alt="preview" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(224,112,112,0.1)', border: '1px solid rgba(224,112,112,0.2)', color: '#e07070', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => { set('image', null); setImagePreview(''); }}>Remove</button>
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Required Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: '12px' }}>
              {(allSkills || []).map(s => {
                const isSelected = formData.requiredSkills.includes(s._id);
                return (
                  <label key={s._id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    padding: '5px 12px', 
                    background: isSelected ? 'rgba(200,168,110,0.12)' : 'var(--bg-card)', 
                    border: '1px solid',
                    borderColor: isSelected ? '#c8a86e' : 'var(--border-main)', 
                    borderRadius: '16px', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    userSelect: 'none',
                    transform: isSelected ? 'translateY(-1px)' : 'none'
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const next = isSelected 
                          ? formData.requiredSkills.filter(id => id !== s._id)
                          : [...formData.requiredSkills, s._id];
                        setFormData(d => ({ ...d, requiredSkills: next }));
                      }}
                      style={{ display: 'none' }}
                    />
                    <span style={{ 
                      fontSize: '11px', 
                      color: isSelected ? 'var(--text-primary)' : '#555',
                      fontWeight: isSelected ? '500' : '400',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      {s.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.btnPrimary, opacity: submitting ? 0.5 : 1 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create formation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResponsableFormations() {
  const [formations, setFormations] = useState([]);
  const [centres, setCentres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSkills, setAllSkills] = useState([]);

  const [search, setSearch] = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const { toasts, show: toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      formationService.getAll(),
      centreService.getMyCentres(),
      categorieService.getAll(),
      skillService.getAll(),
    ]);

    const [formationsRes, centresRes, categoriesRes, skillsRes] = results.map(r =>
      r.status === 'fulfilled' ? r.value : { data: { data: [] } }
    );

    setFormations(formationsRes.data.data || []);
    setCentres(centresRes.data.data || []);
    setCategories(categoriesRes.data.data || []);
    setAllSkills(skillsRes.data.data || skillsRes.data || []);

    if (results.some(r => r.status === 'rejected')) {
      toast('Some data failed to load', 'error');
    }
    
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    try {
      if (editingFormation) {
        const res = await formationService.update(editingFormation._id, data);
        toast('Formation updated successfully');
        setFormations(prev => prev.map(f =>
          f._id === editingFormation._id ? (res.data.data || res.data) : f
        ));
      } else {
        const res = await formationService.create(data);
        toast('Formation created successfully');
        setFormations(prev => [...prev, res.data.data || res.data]);
      }
      setShowForm(false);
      setEditingFormation(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save formation', 'error');
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await formationService.delete(confirmTarget._id);
      toast('Formation deleted');
      setFormations(prev => prev.filter(f => f._id !== confirmTarget._id));
      setConfirmTarget(null);
    } catch {
      toast('Failed to delete formation', 'error');
    }
  };

  const filtered = formations.filter(f => {
    const q = search.toLowerCase();
    const matchQ = !q || f.titre?.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q);
    const matchC = !filterCentre || f.centreId?._id === filterCentre;
    const matchCat = !filterCat || f.categorieId?._id === filterCat;
    return matchQ && matchC && matchCat;
  });

  const uniqueFormateurs = new Set(formations.flatMap(f => f.formateurIds?.map(fm => fm._id || fm) || []));
  const approvedCentres = centres.filter(c => c.status === 'approved' && c.paiementStatus === 'paid');

  return (
    <ResponsableCFLayout title="My <em>Formations</em>" subtitle="Manage your training courses">
      <style>{`
        @keyframes toastIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .rf-card-desc { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            style={{ ...styles.input, paddingLeft: 36 }}
            placeholder="Search formations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={styles.select} value={filterCentre} onChange={e => setFilterCentre(e.target.value)}>
          <option value="">All centres</option>
          {approvedCentres.map(c => <option key={c._id} value={c._id}>{c.nom}</option>)}
        </select>
        <select style={styles.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.nom}</option>)}
        </select>
        <button style={{ ...styles.btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => { setEditingFormation(null); setShowForm(true); }}
          disabled={approvedCentres.length === 0}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add formation
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { val: formations.length, label: 'Total formations' },
          { val: formations.filter(f => f.prix === 0).length, label: 'Free courses' },
          { val: uniqueFormateurs.size, label: 'Formateurs assigned' },
        ].map(({ val, label }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 26, fontFamily: "'Cormorant Garamond', serif", color: '#c8a86e' }}>{val}</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {approvedCentres.length === 0 && !loading && (
        <div style={styles.alertWarn}>Your centre must be approved by an administrator and the creation fee must be paid before you can add formations.</div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--border-main)', borderTopColor: '#c8a86e', animation: 'toastIn .8s linear infinite', margin: '60px auto' }} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(200,168,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="1.5" style={{ opacity: 0.5 }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#888', marginBottom: 6 }}>
            {search || filterCentre || filterCat ? 'No formations found' : 'No formations yet'}
          </div>
          <p style={{ fontSize: 14, color: '#555' }}>
            {search || filterCentre || filterCat ? 'Try adjusting your search or filters' : 'Create your first training course'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {filtered.map(f => (
            <FormationCard
              key={f._id}
              formation={f}
              onEdit={f => { setEditingFormation(f); setShowForm(true); }}
              onDelete={f => setConfirmTarget(f)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <FormationModal
          editing={editingFormation}
          centres={approvedCentres}
          categories={categories}
          allSkills={allSkills}
          onClose={() => { setShowForm(false); setEditingFormation(null); }}
          onSubmit={handleSubmit}
        />
      )}
      {confirmTarget && (
        <ConfirmModal
          formation={confirmTarget}
          onConfirm={handleDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </ResponsableCFLayout>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
   modal: { background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border-main)', flexShrink: 0 },
  modalTitle: { fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', margin: 0 },
  modalBody: { padding: '20px 22px', overflowY: 'auto', flex: 1 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: '1px solid var(--border-main)', flexShrink: 0 },
  closeBtn: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 22, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, lineHeight: 1 },
  field: { marginBottom: 16 },
  fieldLabel: { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#555', marginBottom: 6 },
  fieldError: { fontSize: 12, color: '#e07070', marginTop: 4 },
   input: { width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none' },
  inputError: { borderColor: '#e07070' },
   textarea: { width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none', minHeight: 90, resize: 'vertical' },
   select: { padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', colorScheme: 'light' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
   fileDrop: { display: 'flex', alignItems: 'center', width: '100%', padding: '14px 16px', background: 'var(--bg-card)', border: '1px dashed var(--border-main)', borderRadius: 8, cursor: 'pointer' },
   btnPrimary: { padding: '9px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #c8a86e, #b4915a)', color: '#ffffff', fontFamily: 'inherit' },
   btnCancel: { padding: '9px 18px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: '1px solid var(--border-main)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'inherit' },
  alertWarn: { padding: '12px 16px', background: 'rgba(224,180,80,0.1)', border: '1px solid rgba(224,180,80,0.3)', borderRadius: 8, color: '#e0b450', fontSize: 14, marginBottom: 20 },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color .2s, transform .2s' },
  cardImg: { width: '100%', height: 140, background: 'linear-gradient(135deg,rgba(200,168,110,0.12),rgba(180,145,90,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  badge: { position: 'absolute', top: 10, right: 10, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  badgeFree: { background: 'rgba(74,168,125,0.18)', color: '#4aa87d', border: '1px solid rgba(74,168,125,0.3)' },
  badgePaid: { background: 'rgba(200,168,110,0.15)', color: '#c8a86e', border: '1px solid rgba(200,168,110,0.25)' },
  cardBody: { padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 },
  cardDesc: { fontSize: 13, color: '#555', lineHeight: 1.5, margin: 0 },
  metaRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  chip: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666' },
  formateurLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.07em', color: '#555', marginBottom: 6 },
   avatarSm: { width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#c8a86e,#b4915a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#ffffff', flexShrink: 0, overflow: 'hidden', border: '2px solid var(--border-main)' },
  cardActions: { display: 'flex', gap: 6, marginTop: 4 },
  actionBtn: { flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: '1px solid var(--border-main)', background: 'transparent', fontFamily: 'inherit', fontWeight: 500, transition: 'background .2s' },
  formateurItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, marginBottom: 7, background: 'var(--bg-card)', border: '1px solid var(--border-main)', cursor: 'pointer', transition: 'all .15s' },
  formateurItemSelected: { background: 'rgba(200,168,110,0.08)', border: '1px solid rgba(200,168,110,0.5)' },
   formateurAvatar: { width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#c8a86e,#b4915a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#ffffff', flexShrink: 0, overflow: 'hidden' },
   checkCircle: { width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11 },
   checkCircleSelected: { background: '#c8a86e', borderColor: '#c8a86e', color: '#ffffff' },
};