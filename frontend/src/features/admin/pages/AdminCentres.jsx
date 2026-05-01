import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import centreService from '../../centres/services/centres';
import AdminLayout from '../components/AdminLayout';

const STATUS_STYLES = {
  approved: { color: '#7dbf7d', bg: 'rgba(125,191,125,0.12)', label: 'Approved' },
  pending:  { color: '#c8a86e', bg: 'rgba(200,168,110,0.12)', label: 'Pending'  },
  rejected: { color: '#e07070', bg: 'rgba(224,112,112,0.12)', label: 'Rejected' },
};

export default function AdminCentres() {
  const navigate = useNavigate();
  const [centres, setCentres]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]           = useState('');
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const fetchCentres = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await centreService.getAdminAll();
      setCentres(res.data.data || []);
    } catch {
      setError('Failed to load centres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCentres(); }, [fetchCentres]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await centreService.delete(deleteId);
      setCentres(p => p.filter(c => c._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete centre.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = centres.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.nom?.toLowerCase().includes(q) || c.adresse?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all:      centres.length,
    approved: centres.filter(c => c.status === 'approved').length,
    pending:  centres.filter(c => c.status === 'pending').length,
    rejected: centres.filter(c => c.status === 'rejected').length,
  };

  return (
    <AdminLayout title="Centre <em>Management</em>" subtitle="View, filter and manage all training centres">
      <style>{`
        .acm-bar { display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; margin-bottom:28px; }
        .acm-search { flex:1; min-width:200px; position:relative; }
        .acm-search input { width:100%; padding:10px 16px 10px 40px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:10px; color:#e8e4dc; font-size:14px; font-family:'DM Sans',sans-serif; }
        .acm-search input:focus { border-color:#b4915a; outline:none; }
        .acm-search input::placeholder { color:#555; }
        .acm-search svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); opacity:.4; pointer-events:none; }
        .acm-filters { display:flex; gap:8px; flex-wrap:wrap; }
        .acm-chip { padding:7px 16px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid transparent; transition:all .2s; background:rgba(255,255,255,.03); color:#555; }
        .acm-chip:hover { color:#888; border-color:rgba(255,255,255,.1); }
        .acm-chip.active-all      { background:rgba(180,145,90,.12); color:#b4915a; border-color:rgba(180,145,90,.3); }
        .acm-chip.active-approved { background:rgba(125,191,125,.12); color:#7dbf7d; border-color:rgba(125,191,125,.3); }
        .acm-chip.active-pending  { background:rgba(200,168,110,.12); color:#c8a86e; border-color:rgba(200,168,110,.3); }
        .acm-chip.active-rejected { background:rgba(224,112,112,.12); color:#e07070; border-color:rgba(224,112,112,.3); }
        .acm-chip-badge { margin-left:6px; padding:1px 6px; border-radius:10px; background:rgba(255,255,255,.06); font-size:11px; }

        .acm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:20px; }

        .acm-card { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; transition:all .2s; display:flex; flex-direction:column; }
        .acm-card:hover { border-color:rgba(255,255,255,.14); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,.3); }

        .acm-card-top { position:relative; height:120px; background:linear-gradient(135deg,rgba(180,145,90,.15),rgba(12,12,14,1)); display:flex; align-items:center; justify-content:center; }
        .acm-logo { width:72px; height:72px; border-radius:14px; object-fit:cover; border:2px solid rgba(255,255,255,.1); }
        .acm-logo-placeholder { width:72px; height:72px; border-radius:14px; background:rgba(255,255,255,.06); border:2px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; font-size:28px; }
        .acm-status-pill { position:absolute; top:12px; right:12px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:.04em; }

        .acm-card-body { padding:18px; flex:1; display:flex; flex-direction:column; gap:6px; }
        .acm-card-name { font-size:17px; font-weight:500; color:#f0ebe0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .acm-card-meta { font-size:12px; color:#555; display:flex; flex-direction:column; gap:3px; }
        .acm-card-meta span { display:flex; align-items:center; gap:6px; }

        .acm-card-footer { padding:14px 18px; border-top:1px solid rgba(255,255,255,.05); display:flex; gap:8px; }
        .acm-btn { flex:1; padding:8px; border-radius:8px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid transparent; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .acm-btn-view   { background:rgba(180,145,90,.08); color:#b4915a; border-color:rgba(180,145,90,.2); }
        .acm-btn-view:hover { background:#b4915a; color:#0c0c0e; }
        .acm-btn-verify { background:rgba(125,191,125,.08); color:#7dbf7d; border-color:rgba(125,191,125,.2); }
        .acm-btn-verify:hover { background:#7dbf7d; color:#0c0c0e; }
        .acm-btn-del    { background:rgba(224,112,112,.08); color:#e07070; border-color:rgba(224,112,112,.2); }
        .acm-btn-del:hover { background:#e07070; color:#0c0c0e; }

        .acm-empty { text-align:center; padding:80px 40px; background:rgba(255,255,255,.01); border:1px dashed rgba(255,255,255,.06); border-radius:20px; }
        .acm-empty h3 { font-family:'Cormorant Garamond',serif; font-size:26px; color:#888; margin-bottom:10px; }
        .acm-empty p  { color:#555; }

        .acm-error { padding:14px 18px; background:rgba(224,112,112,.08); border:1px solid rgba(224,112,112,.25); border-radius:10px; color:#e07070; font-size:14px; margin-bottom:20px; }
        .acm-spinner { width:36px; height:36px; border:2px solid rgba(255,255,255,.05); border-top-color:#b4915a; border-radius:50%; animation:acm-spin .8s linear infinite; margin:60px auto; }
        @keyframes acm-spin { to { transform:rotate(360deg); } }

        /* Delete confirm modal */
        .acm-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(6px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
        .acm-confirm { background:#1a1a1e; border:1px solid rgba(255,255,255,.1); border-radius:16px; max-width:420px; width:100%; padding:32px; text-align:center; }
        .acm-confirm-icon { width:56px; height:56px; border-radius:50%; background:rgba(224,112,112,.1); color:#e07070; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:26px; border:1px solid rgba(224,112,112,.2); }
        .acm-confirm h3 { font-family:'Cormorant Garamond',serif; font-size:24px; color:#e8e4dc; margin-bottom:10px; }
        .acm-confirm p  { color:#666; font-size:14px; margin-bottom:28px; }
        .acm-confirm-btns { display:flex; gap:12px; }
        .acm-confirm-btns button { flex:1; padding:12px; border-radius:10px; font-weight:600; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .acm-btn-cancel-conf { background:none; border:1px solid rgba(255,255,255,.12); color:#888; }
        .acm-btn-cancel-conf:hover { color:#e8e4dc; }
        .acm-btn-del-conf { background:#e07070; border:none; color:#0c0c0e; }
        .acm-btn-del-conf:hover { opacity:.9; }
        .acm-btn-del-conf:disabled { opacity:.5; cursor:not-allowed; }

        @media(max-width:640px) {
          .acm-grid { grid-template-columns:1fr; }
          .acm-bar { flex-direction:column; align-items:stretch; }
        }
      `}</style>

      <div className="acm-bar">
        <div className="acm-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="Search by name or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="acm-filters">
          {[
            { key: '',         label: 'All',      cls: 'all'      },
            { key: 'approved', label: 'Approved', cls: 'approved' },
            { key: 'pending',  label: 'Pending',  cls: 'pending'  },
            { key: 'rejected', label: 'Rejected', cls: 'rejected' },
          ].map(f => (
            <button
              key={f.key}
              className={`acm-chip ${statusFilter === f.key ? `active-${f.cls}` : ''}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
              <span className="acm-chip-badge">{f.key === '' ? counts.all : counts[f.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <div className="acm-error">{error}</div>}

      {loading ? (
        <div className="acm-spinner" />
      ) : filtered.length === 0 ? (
        <div className="acm-empty">
          <h3>No centres found</h3>
          <p>{search || statusFilter ? 'Try adjusting your filters.' : 'No training centres have been submitted yet.'}</p>
        </div>
      ) : (
        <div className="acm-grid">
          {filtered.map(centre => {
            const st = STATUS_STYLES[centre.status] || STATUS_STYLES.pending;
            return (
              <div key={centre._id} className="acm-card">
                <div className="acm-card-top">
                  {centre.logo
                    ? <img src={centre.logo.startsWith('http') ? centre.logo : `http://localhost:5000/${centre.logo}`} alt="" className="acm-logo" />
                    : <div className="acm-logo-placeholder">🏛️</div>
                  }
                  <span className="acm-status-pill" style={{ color: st.color, background: st.bg }}>
                    {st.label}
                  </span>
                </div>

                <div className="acm-card-body">
                  <div className="acm-card-name" title={centre.nom}>{centre.nom}</div>
                  <div className="acm-card-meta">
                    {centre.adresse && (
                      <span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {centre.adresse}
                      </span>
                    )}
                    {centre.telephone && (
                      <span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.18 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {centre.telephone}
                      </span>
                    )}
                    {centre.id_responsable && (
                      <span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {centre.id_responsable.prenom} {centre.id_responsable.nom}
                      </span>
                    )}
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {new Date(centre.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="acm-card-footer">
                  <button 
                    className={`acm-btn ${centre.status === 'pending' ? 'acm-btn-verify' : 'acm-btn-view'}`} 
                    onClick={() => navigate(`/admin/centres/verify/${centre._id}`)}
                  >
                    {centre.status === 'pending' ? 'Review' : 'View'}
                  </button>
                  <button 
                    className="acm-btn acm-btn-del" 
                    onClick={() => setDeleteId(centre._id)}
                    disabled={centre.status !== 'rejected'}
                    title={centre.status !== 'rejected' ? 'Only rejected centres can be deleted' : ''}
                    style={centre.status !== 'rejected' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="acm-overlay" onClick={() => setDeleteId(null)}>
          <div className="acm-confirm" onClick={e => e.stopPropagation()}>
            <div className="acm-confirm-icon">⚠</div>
            <h3>Delete Centre?</h3>
            <p>This action is permanent and cannot be undone. The centre's data, documents and formations will be removed.</p>
            <div className="acm-confirm-btns">
              <button className="acm-btn-cancel-conf" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="acm-btn-del-conf" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
