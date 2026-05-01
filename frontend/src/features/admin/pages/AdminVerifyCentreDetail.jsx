import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import centreService from '../../centres/services/centres';
import client from '../../../services/client';
import AdminLayout from '../components/AdminLayout';

export default function AdminVerifyCentreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [centre, setCentre]                   = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [reviewLoading, setReviewLoading]     = useState({});
  const [finalActionLoading, setFinalActionLoading] = useState(false);
  const [adminMessage, setAdminMessage]       = useState('');
  const [showRejectBox, setShowRejectBox]     = useState(false);
  const [actionError, setActionError]         = useState('');

  // Fetch from admin/pending list to get full document data
  const fetchCentre = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await centreService.getPending();
      const list = res.data.data || [];
      const found = list.find(c => c._id === id);
      if (found) {
        setCentre(found);
      } else {
        // Centre is no longer pending — fall back to public endpoint for display
        const res2 = await centreService.getById(id);
        setCentre(res2.data.data);
      }
    } catch (err) {
      setError('Failed to load centre details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCentre(); }, [id]);

  const handleDocumentStatus = async (docId, status) => {
    setReviewLoading(prev => ({ ...prev, [docId]: status }));
    try {
      await centreService.updateDocumentStatus(id, docId, status);
      setCentre(prev => ({
        ...prev,
        documents: prev.documents.map(d => d._id === docId ? { ...d, status } : d),
      }));
    } catch {
      setActionError('Failed to update document status.');
    } finally {
      setReviewLoading(prev => { const n = { ...prev }; delete n[docId]; return n; });
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Approve this centre? The applicant will be promoted to ResponsableCF.')) return;
    setFinalActionLoading(true);
    setActionError('');
    try {
      await centreService.approve(id);
      navigate('/admin/centres/verify');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve.');
      setFinalActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!adminMessage.trim()) { setActionError('Please write a reason for rejection.'); return; }
    setFinalActionLoading(true);
    setActionError('');
    try {
      await centreService.reject(id, adminMessage);
      navigate('/admin/centres/verify');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject.');
      setFinalActionLoading(false);
    }
  };

  const handleViewDoc = async (docId) => {
    try {
      const res = await client.get(`/centres/${id}/documents/${docId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' }));
      window.open(url, '_blank');
    } catch {
      alert('Could not load document. It may have been deleted or moved.');
    }
  };

  const DOC_LABELS = {
    registration:  'Trade Register (Registre de Commerce)',
    tax_id:        'Tax ID Card (Matricule Fiscal)',
    identity:      'Manager ID (CIN / Passport)',
    authorization: 'Ministry Authorization',
    lease:         'Lease Agreement / Ownership',
  };

  const STATUS_CONFIG = {
    valid:   { color: '#7dbf7d', bg: 'rgba(125,191,125,0.12)', label: 'Valid'    },
    invalid: { color: '#e07070', bg: 'rgba(224,112,112,0.12)', label: 'Invalid'  },
    pending: { color: '#c8a86e', bg: 'rgba(200,168,110,0.12)', label: 'Pending'  },
  };

  if (loading) return (
    <AdminLayout>
      <div className="av-spinner" style={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,.05)', borderTopColor: '#b4915a', borderRadius: '50%', animation: 'av-spin .8s linear infinite', margin: '80px auto' }} />
      <style>{`@keyframes av-spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );

  if (error || !centre) return (
    <AdminLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#e07070' }}>{error || 'Centre not found.'}</div>
    </AdminLayout>
  );

  const allDocsPending = centre.documents?.every(d => d.status === 'pending');
  const hasInvalid     = centre.documents?.some(d => d.status === 'invalid');
  const allValid       = centre.documents?.length > 0 && centre.documents?.every(d => d.status === 'valid');

  return (
    <AdminLayout title="Application <em>Review</em>" subtitle={`Reviewing: ${centre.nom}`}>
      <style>{`
        .av-back { display:inline-flex; align-items:center; gap:8px; color:#555; font-size:13px; cursor:pointer; background:none; border:none; margin-bottom:24px; transition:color .2s; }
        .av-back:hover { color:#b4915a; }

        .av-grid { display:grid; grid-template-columns:1fr 340px; gap:28px; align-items:start; }
        @media(max-width:900px) { .av-grid { grid-template-columns:1fr; } }

        /* ── sections ── */
        .av-section { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:24px; margin-bottom:20px; }
        .av-section-title { font-family:'Cormorant Garamond',serif; font-size:20px; color:#b4915a; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; gap:10px; }

        /* ── info rows ── */
        .av-row { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.03); font-size:14px; }
        .av-row:last-child { border-bottom:none; }
        .av-row-label { color:#555; flex-shrink:0; }
        .av-row-value { color:#e8e4dc; font-weight:500; text-align:right; word-break:break-word; }

        /* ── doc cards ── */
        .av-docs { display:flex; flex-direction:column; gap:12px; }
        .av-doc-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:16px; transition:border-color .2s; }
        .av-doc-card.doc-valid   { border-color:rgba(125,191,125,.25); background:rgba(125,191,125,.03); }
        .av-doc-card.doc-invalid { border-color:rgba(224,112,112,.25); background:rgba(224,112,112,.03); }
        .av-doc-header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .av-doc-left { display:flex; align-items:center; gap:12px; }
        .av-doc-icon { width:38px; height:38px; border-radius:9px; background:rgba(180,145,90,.1); display:flex; align-items:center; justify-content:center; color:#b4915a; flex-shrink:0; }
        .av-doc-label { font-size:14px; color:#e8e4dc; font-weight:500; }
        .av-doc-type  { font-size:11px; color:#555; margin-top:2px; text-transform:uppercase; letter-spacing:.05em; }
        .av-doc-status-pill { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; }
        .av-doc-actions { display:flex; gap:8px; margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,.05); }
        .av-doc-btn { padding:6px 14px; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; border:1px solid transparent; font-family:'DM Sans',sans-serif; }
        .av-doc-btn-view    { background:rgba(180,145,90,.08); color:#b4915a; border-color:rgba(180,145,90,.2); }
        .av-doc-btn-view:hover { background:#b4915a; color:#0c0c0e; }
        .av-doc-btn-valid   { background:rgba(125,191,125,.08); color:#7dbf7d; border-color:rgba(125,191,125,.2); }
        .av-doc-btn-valid.is-active, .av-doc-btn-valid:hover { background:#7dbf7d; color:#0c0c0e; }
        .av-doc-btn-invalid { background:rgba(224,112,112,.08); color:#e07070; border-color:rgba(224,112,112,.2); }
        .av-doc-btn-invalid.is-active, .av-doc-btn-invalid:hover { background:#e07070; color:#0c0c0e; }
        .av-doc-btn:disabled { opacity:.5; cursor:not-allowed; }

        /* ── sidebar decision ── */
        .av-sidebar { position:sticky; top:100px; }
        .av-decision { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:24px; }
        .av-decision-title { font-family:'Cormorant Garamond',serif; font-size:22px; color:#e8e4dc; margin-bottom:8px; }
        .av-decision-hint  { font-size:13px; color:#555; margin-bottom:20px; line-height:1.5; }

        .av-summary { background:rgba(0,0,0,.2); border-radius:10px; padding:14px; margin-bottom:20px; display:flex; flex-direction:column; gap:8px; }
        .av-summary-row { display:flex; justify-content:space-between; font-size:13px; color:#888; }
        .av-summary-val { font-weight:600; }

        .av-btn-final { width:100%; padding:13px; border-radius:11px; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; border:none; font-family:'DM Sans',sans-serif; margin-bottom:10px; display:flex; align-items:center; justify-content:center; gap:8px; }
        .av-btn-approve { background:linear-gradient(135deg,#7dbf7d,#5ea35e); color:#0c0c0e; }
        .av-btn-approve:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 20px rgba(125,191,125,.25); }
        .av-btn-reject-init { background:rgba(224,112,112,.08); border:1px solid rgba(224,112,112,.2); color:#e07070; }
        .av-btn-reject-init:hover { background:rgba(224,112,112,.15); }
        .av-btn-final:disabled { opacity:.5; cursor:not-allowed; transform:none !important; }

        .av-reject-box { margin-top:4px; animation:slideDown .25s ease; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .av-textarea { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(224,112,112,.3); border-radius:10px; padding:12px; color:#e8e4dc; font-size:13px; font-family:'DM Sans',sans-serif; margin-bottom:10px; resize:vertical; min-height:90px; box-sizing:border-box; }
        .av-textarea:focus { outline:none; border-color:#e07070; }
        .av-btn-reject-confirm { background:#e07070; color:#0c0c0e; }
        .av-btn-reject-confirm:hover:not(:disabled) { background:#d05a5a; }

        .av-action-error { font-size:12px; color:#e07070; margin-top:10px; padding:10px 12px; background:rgba(224,112,112,.08); border-radius:8px; border:1px solid rgba(224,112,112,.2); }
        .av-action-ok { font-size:12px; color:#7dbf7d; margin-top:10px; padding:10px 12px; background:rgba(125,191,125,.08); border-radius:8px; }

        .av-warn { padding:12px 16px; background:rgba(200,168,110,.08); border:1px solid rgba(200,168,110,.2); border-radius:10px; color:#c8a86e; font-size:13px; margin-bottom:16px; }

        @keyframes av-spin { to { transform:rotate(360deg); } }
        .av-mini-spin { width:14px; height:14px; border:2px solid rgba(0,0,0,.15); border-top-color:currentColor; border-radius:50%; animation:av-spin .6s linear infinite; display:inline-block; }
      `}</style>

      <button className="av-back" onClick={() => navigate('/admin/centres/verify')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Pending List
      </button>

      <div className="av-grid">
        {/* ── Left: Centre Info + Documents ── */}
        <div>
          {/* Centre Info */}
          <div className="av-section">
            <h2 className="av-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 3v18M16 3v18M2 9h20M2 15h20"/></svg>
              Centre Information
            </h2>
            <div className="av-row"><span className="av-row-label">Name</span><span className="av-row-value">{centre.nom}</span></div>
            <div className="av-row"><span className="av-row-label">Address</span><span className="av-row-value">{centre.adresse || '—'}</span></div>
            <div className="av-row"><span className="av-row-label">Phone</span><span className="av-row-value">{centre.telephone || '—'}</span></div>
            <div className="av-row"><span className="av-row-label">Description</span><span className="av-row-value" style={{ maxWidth: 300 }}>{centre.description || '—'}</span></div>
            <div className="av-row"><span className="av-row-label">Submitted</span><span className="av-row-value">{new Date(centre.createdAt).toLocaleDateString()}</span></div>
          </div>

          {/* Applicant Info */}
          <div className="av-section">
            <h2 className="av-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Applicant
            </h2>
            <div className="av-row"><span className="av-row-label">Name</span><span className="av-row-value">{centre.responsableId?.prenom} {centre.responsableId?.nom}</span></div>
            <div className="av-row"><span className="av-row-label">Email</span><span className="av-row-value">{centre.responsableId?.email}</span></div>
            <div className="av-row"><span className="av-row-label">Current Role</span><span className="av-row-value">{centre.responsableId?.role || '—'}</span></div>
          </div>

          {/* Documents */}
          <div className="av-section">
            <h2 className="av-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Verification Documents
              <span style={{ fontSize: 13, color: '#555', fontFamily: 'DM Sans', marginLeft: 'auto' }}>
                {centre.documents?.length || 0} files
              </span>
            </h2>

            {(!centre.documents || centre.documents.length === 0) ? (
              <div style={{ color: '#555', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
                No documents were uploaded with this application.
              </div>
            ) : (
              <div className="av-docs">
                {centre.documents.map(doc => {
                  const st = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
                  const isLoading = !!reviewLoading[doc._id];
                  return (
                    <div key={doc._id} className={`av-doc-card doc-${doc.status}`}>
                      <div className="av-doc-header">
                        <div className="av-doc-left">
                          <div className="av-doc-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                          </div>
                          <div>
                            <div className="av-doc-label">{DOC_LABELS[doc.type] || doc.type}</div>
                            <div className="av-doc-type">{doc.type}</div>
                          </div>
                        </div>
                        <span className="av-doc-status-pill" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                      </div>
                      <div className="av-doc-actions">
                        <button className="av-doc-btn av-doc-btn-view" onClick={() => handleViewDoc(doc._id)}>
                          👁 View File
                        </button>
                        <button
                          className={`av-doc-btn av-doc-btn-valid ${doc.status === 'valid' ? 'is-active' : ''}`}
                          onClick={() => handleDocumentStatus(doc._id, 'valid')}
                          disabled={isLoading}
                        >
                          {isLoading && reviewLoading[doc._id] === 'valid' ? <span className="av-mini-spin" /> : '✓'} Valid
                        </button>
                        <button
                          className={`av-doc-btn av-doc-btn-invalid ${doc.status === 'invalid' ? 'is-active' : ''}`}
                          onClick={() => handleDocumentStatus(doc._id, 'invalid')}
                          disabled={isLoading}
                        >
                          {isLoading && reviewLoading[doc._id] === 'invalid' ? <span className="av-mini-spin" /> : '✕'} Invalid
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar: Decision ── */}
        <div className="av-sidebar">
          <div className="av-decision">
            <h3 className="av-decision-title">Final Decision</h3>
            <p className="av-decision-hint">Review all documents carefully before making a decision.</p>

            {/* Summary */}
            <div className="av-summary">
              <div className="av-summary-row">
                <span>Total Documents</span>
                <span className="av-summary-val">{centre.documents?.length || 0}</span>
              </div>
              <div className="av-summary-row">
                <span style={{ color: '#7dbf7d' }}>✓ Valid</span>
                <span className="av-summary-val" style={{ color: '#7dbf7d' }}>{centre.documents?.filter(d => d.status === 'valid').length || 0}</span>
              </div>
              <div className="av-summary-row">
                <span style={{ color: '#e07070' }}>✕ Invalid</span>
                <span className="av-summary-val" style={{ color: '#e07070' }}>{centre.documents?.filter(d => d.status === 'invalid').length || 0}</span>
              </div>
              <div className="av-summary-row">
                <span style={{ color: '#c8a86e' }}>⏳ Pending</span>
                <span className="av-summary-val" style={{ color: '#c8a86e' }}>{centre.documents?.filter(d => d.status === 'pending').length || 0}</span>
              </div>
            </div>

            {allDocsPending && (
              <div className="av-warn">⚠ No documents have been reviewed yet. Please mark each document as Valid or Invalid before deciding.</div>
            )}
            {hasInvalid && !allDocsPending && (
              <div className="av-warn">⚠ Some documents are marked Invalid. Approving will still promote the user.</div>
            )}

            {/* Centre is approved — show status only */}
            {centre.status === 'approved' ? (
              <div className="av-action-ok">
                This application has already been <strong>approved</strong>.
              </div>
            ) : (
              <>
                {centre.status === 'rejected' && (
                  <div className="av-action-error" style={{ marginBottom: 16 }}>
                    This application was <strong>rejected</strong>. You can reconsider and approve it below.
                  </div>
                )}
                
                <button
                  className="av-btn-final av-btn-approve"
                  onClick={handleApprove}
                  disabled={finalActionLoading}
                >
                  {finalActionLoading && !showRejectBox
                    ? <><span className="av-mini-spin" /> Processing...</>
                    : '✓ Approve & Promote User'}
                </button>

                {centre.status === 'pending' && (
                  <button
                    className="av-btn-final av-btn-reject-init"
                    onClick={() => { setShowRejectBox(b => !b); setActionError(''); }}
                    disabled={finalActionLoading}
                  >
                    {showRejectBox ? '✕ Cancel Rejection' : '✕ Reject Application'}
                  </button>
                )}

                {showRejectBox && centre.status === 'pending' && (
                  <div className="av-reject-box">
                    <textarea
                      className="av-textarea"
                      placeholder="Explain why the application was rejected. The applicant will see this message and can fix their documents..."
                      value={adminMessage}
                      onChange={e => setAdminMessage(e.target.value)}
                    />
                    <button
                      className="av-btn-final av-btn-reject-confirm"
                      onClick={handleReject}
                      disabled={finalActionLoading}
                    >
                      {finalActionLoading
                        ? <><span className="av-mini-spin" /> Processing...</>
                        : 'Confirm Rejection'}
                    </button>
                  </div>
                )}
              </>
            )}

            {actionError && <div className="av-action-error">{actionError}</div>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
