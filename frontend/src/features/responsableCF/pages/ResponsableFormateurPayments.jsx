import { useState, useEffect } from 'react';
import ResponsableCFLayout from '../components/ResponsableCFLayout';
import { formateurPaymentService } from '../services/formateurPayment';
import { formationService } from '../services/formation';
import { contentService } from '../services/lecon';

const BASE = import.meta.env.VITE_API_URL || '';

const MODE_LABELS = {
  par_lecon: 'Per Lesson',
  montant_fixe: 'Fixed Amount',
};

const STATUT_STYLES = {
  en_attente: { color: '#c8a86e', bg: 'rgba(200,168,110,0.12)', label: 'Pending' },
  paye: { color: '#4aa87d', bg: 'rgba(74,168,125,0.12)', label: 'Paid' },
  refuse: { color: '#e07070', bg: 'rgba(224,112,112,0.12)', label: 'Refused' },
};

export default function ResponsableFormateurPayments() {
  const [contrats, setContrats] = useState([]);
  const [payments, setPayments] = useState([]);
  const [myFormations, setMyFormations] = useState([]);
  const [matchingFormateurs, setMatchingFormateurs] = useState([]);
  const [profileFormateur, setProfileFormateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contrats');
  const [showModal, setShowModal] = useState(false);
  const [editingContrat, setEditingContrat] = useState(null);
  const [formData, setFormData] = useState({ formateurId: '', centreId: '', mode: 'par_lecon', montantFixe: '', prixParLecon: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignContrat, setAssignContrat] = useState(null);
  const [formations, setFormations] = useState([]);
  const [selectedFormations, setSelectedFormations] = useState([]);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [previewPayment, setPreviewPayment] = useState(null);
  const [previewContents, setPreviewContents] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contratsRes, paymentsRes] = await Promise.all([
        formateurPaymentService.getContrats(),
        formateurPaymentService.getPayments(),
      ]);
      setContrats(contratsRes.data.data || []);
      setPayments(paymentsRes.data.data || []);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = async () => {
    setEditingContrat(null);
    setFormData({ formationId: '', formateurId: '', centreId: '', mode: 'par_lecon', montantFixe: '', prixParLecon: '' });
    setMatchingFormateurs([]);
    try {
      const fRes = await formateurPaymentService.getFormations();
      setMyFormations(fRes.data.data || []);
    } catch { /* ignore */ }
    setShowModal(true);
  };

  const handleFormationChange = async (formationId) => {
    const formation = myFormations.find(f => f._id === formationId);
    setFormData(d => ({
      ...d,
      formationId,
      centreId: formation?.centreId?._id || formation?.centreId || '',
      formateurId: '',
    }));
    if (!formationId) {
      setMatchingFormateurs([]);
      return;
    }
    try {
      const res = await formationService.getAvailableFormateurs(formationId);
      setMatchingFormateurs(res.data.data || []);
    } catch {
      setMatchingFormateurs([]);
    }
  };

  const openEditModal = (contrat) => {
    setEditingContrat(contrat);
    setFormData({
      formateurId: contrat.formateurId?._id || contrat.formateurId,
      centreId: contrat.centreId?._id || contrat.centreId,
      mode: contrat.mode,
      montantFixe: contrat.montantFixe || '',
      prixParLecon: contrat.prixParLecon || '',
    });
    setShowModal(true);
  };

  const handleSubmitContrat = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = {
        formateurId: formData.formateurId,
        centreId: formData.centreId,
        mode: formData.mode,
        montantFixe: formData.mode === 'montant_fixe' ? Number(formData.montantFixe) : 0,
        prixParLecon: formData.mode === 'par_lecon' ? Number(formData.prixParLecon) : 0,
      };

      if (editingContrat) {
        await formateurPaymentService.updateContrat(editingContrat._id, data);
      } else {
        await formateurPaymentService.createContrat(data);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contract');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContrat = async (id) => {
    if (!window.confirm('Delete this contract?')) return;
    try {
      await formateurPaymentService.deleteContrat(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handlePayNow = async (payment) => {
    setPaySubmitting(true);
    try {
      await formateurPaymentService.payPayment(payment._id, { methodePaiement: 'virement' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleCreateFixedPayment = async (contrat) => {
    const montant = prompt(`Enter amount for fixed payment (${contrat.montantFixe} DT recommended):`, contrat.montantFixe);
    if (!montant) return;
    try {
      await formateurPaymentService.createPayment({ contratId: contrat._id, montant: Number(montant) });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment');
    }
  };

  const openAssignModal = async (contrat) => {
    setAssignContrat(contrat);
    setSelectedFormations([]);
    try {
      const fRes = await formateurPaymentService.getFormations();
      const allFormations = fRes.data.data || [];
      const cId = String(contrat.centreId?._id || contrat.centreId);
      const formateurId = String(contrat.formateurId?._id || contrat.formateurId);
      const filtered = allFormations.filter(f => String(f.centreId?._id || f.centreId) === cId);
      const assignedIds = new Set();
      filtered.forEach(f => {
        const isAssigned = (f.formateurIds || []).some(id => String(id._id || id) === formateurId);
        if (isAssigned) assignedIds.add(f._id);
      });
      setFormations(filtered.map(f => ({ ...f, _alreadyAssigned: assignedIds.has(f._id) })));
      setShowAssignModal(true);
    } catch {
      setError('Failed to load formations');
    }
  };

  const handleAssignFormations = async () => {
    if (!assignContrat || selectedFormations.length === 0) return;
    setAssignSubmitting(true);
    const errors = [];
    for (const fId of selectedFormations) {
      try {
        await formateurPaymentService.assignFormation(assignContrat._id, fId);
      } catch (e) {
        errors.push(e.response?.data?.message || 'Failed');
      }
    }
    if (errors.length > 0) setError(errors.join('; '));
    setShowAssignModal(false);
    setAssignContrat(null);
    fetchData();
    setAssignSubmitting(false);
  };

  const handlePreview = async (payment) => {
    if (!payment.leconId) return;
    setPreviewPayment(payment);
    setPreviewLoading(true);
    try {
      const contentsRes = await contentService.getByLesson(typeof payment.leconId === 'string' ? payment.leconId : payment.leconId._id);
      setPreviewContents(contentsRes.data.data || []);
    } catch {
      setError('Failed to load lesson content');
    } finally {
      setPreviewLoading(false);
    }
  };

  const pendingPayments = payments.filter(p => p.statut === 'en_attente');
  const totalUnpaid = pendingPayments.reduce((s, p) => s + p.montant, 0);

  return (
    <ResponsableCFLayout title="Formateur <em>Payments</em>" subtitle="Manage contracts and pay formateurs">
      <style>{`
        .fp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .fp-stat-card { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; padding: 20px; }
        .fp-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #b4915a; }
        .fp-stat-lbl { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
        .fp-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border-main); margin-bottom: 24px; }
        .fp-tab { padding: 12px 20px; font-size: 13px; color: #555; background: none; border: none; cursor: pointer; position: relative; font-family: 'DM Sans', sans-serif; }
        .fp-tab.active { color: var(--text-primary); }
        .fp-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #b4915a; }
        .fp-tab-count { background: var(--border-main); color: #666; padding: 2px 7px; border-radius: 10px; font-size: 11px; margin-left: 6px; }
        .fp-tab.active .fp-tab-count { background: rgba(180,145,90,0.15); color: #b4915a; }
        .fp-add-btn { padding: 10px 20px; background: linear-gradient(135deg, #b4915a, #c8a86e); border: none; border-radius: 8px; color: #0c0c0e; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 20px; }
        .fp-add-btn:hover { opacity: 0.9; }
        .fp-card { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .fp-card-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .fp-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(180,145,90,0.15); display: flex; align-items: center; justify-content: center; color: #b4915a; font-weight: 600; font-size: 16px; flex-shrink: 0; }
        .fp-card-info { flex: 1; min-width: 0; }
        .fp-card-name { font-size: 14px; font-weight: 500; color: var(--text-primary); }
        .fp-card-sub { font-size: 12px; color: #555; margin-top: 2px; }
        .fp-card-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .fp-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .fp-amount { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #b4915a; white-space: nowrap; }
        .fp-btn { padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; border: 1px solid var(--border-main); background: transparent; color: var(--text-secondary); font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .fp-btn:hover { border-color: #b4915a; color: #b4915a; }
        .fp-btn-pay { background: linear-gradient(135deg, #b4915a, #c8a86e); color: #0c0c0e; border: none; }
        .fp-btn-pay:hover { opacity: 0.9; }
        .fp-btn-danger { color: #e07070; }
        .fp-btn-danger:hover { border-color: #e07070; color: #e07070; }
        .fp-empty { text-align: center; padding: 40px; color: #555; font-size: 14px; }
        .fp-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .fp-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border-main); border-top-color: #b4915a; animation: fp-spin 0.8s linear infinite; margin: 40px auto; }
        @keyframes fp-spin { to { transform: rotate(360deg); } }

        .fp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .fp-modal { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 16px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .fp-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-main); }
        .fp-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: var(--text-primary); }
        .fp-modal-close { background: none; border: none; color: #555; cursor: pointer; font-size: 24px; }
        .fp-modal-body { padding: 24px; }
        .fp-form-group { margin-bottom: 16px; }
        .fp-form-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin-bottom: 8px; }
        .fp-form-select, .fp-form-input { width: 100%; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 8px; color: var(--text-primary); font-size: 14px; font-family: 'DM Sans', sans-serif; }
        .fp-form-select:focus, .fp-form-input:focus { border-color: #b4915a; outline: none; }
        .fp-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid var(--border-main); }
        .fp-btn-cancel { padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; border: 1px solid var(--border-main); background: transparent; color: #888; font-family: 'DM Sans', sans-serif; }
        .fp-btn-cancel:hover { border-color: #b4915a; color: var(--text-primary); }
        .fp-btn-submit { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: linear-gradient(135deg, #b4915a, #c8a86e); color: #0c0c0e; font-family: 'DM Sans', sans-serif; }
        .fp-btn-submit:hover { opacity: 0.9; }
        .fp-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .fp-assign-list { max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
        .fp-assign-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-main); cursor: pointer; transition: border-color .2s, background .2s; }
        .fp-assign-item:hover { border-color: #b4915a; background: rgba(180,145,90,0.05); }
        .fp-assign-item.selected { border-color: #b4915a; background: rgba(180,145,90,0.08); }
        .fp-assign-item.assigned { border-color: var(--border-main); background: transparent; }
        .fp-assign-checkbox { width: 18px; height: 18px; border-radius: 4px; border: 2px solid var(--border-main); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
        .fp-assign-item.selected .fp-assign-checkbox { background: #b4915a; border-color: #b4915a; }
        .fp-assign-checkbox svg { display: none; }
        .fp-assign-item.selected .fp-assign-checkbox svg { display: block; }
        .fp-assign-title { font-size: 14px; color: var(--text-primary); }
        .fp-formateur-list { display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; }
        .fp-formateur-placeholder { padding: 16px; text-align: center; color: #555; font-size: 13px; border: 1px dashed var(--border-main); border-radius: 8px; }
        .fp-formateur-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border-main); cursor: pointer; transition: all .15s; }
        .fp-formateur-item:hover { border-color: #b4915a; background: rgba(180,145,90,0.05); }
        .fp-formateur-item.selected { border-color: #b4915a; background: rgba(180,145,90,0.08); }
        .fp-formateur-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#c8a86e,#b4915a); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #fff; flex-shrink: 0; overflow: hidden; }
        .fp-formateur-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .fp-formateur-info { flex: 1; min-width: 0; }
        .fp-formateur-name { font-size: 14px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
        .fp-formateur-match { font-size: 10px; background: rgba(74,168,125,0.12); color: #4aa87d; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
        .fp-formateur-email { font-size: 11px; color: #555; margin-top: 1px; }
        .fp-formateur-skills { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
        .fp-formateur-skill { font-size: 10px; background: rgba(200,168,110,0.1); color: #b4915a; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
        .fp-formateur-profile-btn { padding: 5px 12px; border-radius: 6px; font-size: 11px; cursor: pointer; border: 1px solid var(--border-main); background: transparent; color: #555; font-family: 'DM Sans', sans-serif; transition: all .2s; flex-shrink: 0; }
        .fp-formateur-profile-btn:hover { border-color: #b4915a; color: #b4915a; }

        .fp-profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg,#c8a86e,#b4915a); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 600; color: #fff; margin: 0 auto 16px; overflow: hidden; }
        .fp-profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .fp-profile-name { text-align: center; font-size: 20px; font-weight: 500; color: var(--text-primary); font-family: 'Cormorant Garamond', serif; }
        .fp-profile-email { text-align: center; font-size: 13px; color: #555; margin-top: 4px; }
        .fp-profile-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #555; margin: 20px 0 10px; }
        .fp-profile-skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .fp-profile-skill { padding: 5px 12px; border-radius: 16px; font-size: 12px; background: rgba(200,168,110,0.1); color: #b4915a; border: 1px solid rgba(200,168,110,0.2); }
      `}</style>

      {/* Stats */}
      <div className="fp-stats">
        <div className="fp-stat-card">
          <div className="fp-stat-val">{contrats.length}</div>
          <div className="fp-stat-lbl">Active Contracts</div>
        </div>
        <div className="fp-stat-card">
          <div className="fp-stat-val">{pendingPayments.length}</div>
          <div className="fp-stat-lbl">Pending Payments</div>
        </div>
        <div className="fp-stat-card">
          <div className="fp-stat-val">{totalUnpaid} DT</div>
          <div className="fp-stat-lbl">Total Unpaid</div>
        </div>
        <div className="fp-stat-card">
          <div className="fp-stat-val">{payments.filter(p => p.statut === 'paye').length}</div>
          <div className="fp-stat-lbl">Paid</div>
        </div>
      </div>

      {error && <div className="fp-error">{error}</div>}

      {/* Tabs */}
      <div className="fp-tabs">
        <button className={`fp-tab ${activeTab === 'contrats' ? 'active' : ''}`} onClick={() => setActiveTab('contrats')}>
          Contracts <span className="fp-tab-count">{contrats.length}</span>
        </button>
        <button className={`fp-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
          Payments <span className="fp-tab-count">{payments.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="fp-spinner" />
      ) : activeTab === 'contrats' ? (
        <>
          <button className="fp-add-btn" onClick={openCreateModal}>+ New Contract</button>
          {contrats.length === 0 ? (
            <div className="fp-empty">No contracts yet. Create one to start paying formateurs.</div>
          ) : contrats.map(c => (
            <div key={c._id} className="fp-card">
              <div className="fp-card-left">
                <div className="fp-avatar">{((c.formateurId?.prenom?.[0] || '') + (c.formateurId?.nom?.[0] || '')).toUpperCase() || '?'}</div>
                <div className="fp-card-info">
                  <div className="fp-card-name">{c.formateurId?.prenom} {c.formateurId?.nom}</div>
                  <div className="fp-card-sub">{MODE_LABELS[c.mode]} · {c.centreId?.nom}</div>
                </div>
              </div>
              <div className="fp-card-right">
                <span className="fp-badge" style={{
                  background: c.statut === 'actif' ? 'rgba(74,168,125,0.12)' : c.statut === 'en_attente' ? 'rgba(200,168,110,0.12)' : 'rgba(200,168,110,0.12)',
                  color: c.statut === 'actif' ? '#4aa87d' : c.statut === 'en_attente' ? '#c8a86e' : '#c8a86e',
                }}>
                  {c.statut === 'actif' ? 'Active' : c.statut === 'en_attente' ? 'Pending' : 'Terminated'}
                </span>
                <span className="fp-amount">{c.mode === 'par_lecon' ? `${c.prixParLecon} DT/lesson` : `${c.montantFixe} DT/mo`}</span>
                {c.statut === 'actif' && <button className="fp-btn" onClick={() => openAssignModal(c)}>Assign Course</button>}
                {c.mode === 'montant_fixe' && <button className="fp-btn fp-btn-pay" onClick={() => handleCreateFixedPayment(c)}>+ Pay</button>}
                <button className="fp-btn" onClick={() => openEditModal(c)}>Edit</button>
                <button className="fp-btn fp-btn-danger" onClick={() => handleDeleteContrat(c._id)}>Delete</button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {payments.length === 0 ? (
            <div className="fp-empty">No payments recorded yet.</div>
          ) : payments.map(p => {
            const st = STATUT_STYLES[p.statut] || STATUT_STYLES.en_attente;
            return (
              <div key={p._id} className="fp-card">
                <div className="fp-card-left">
                  <div className="fp-avatar">{((p.formateurId?.prenom?.[0] || '') + (p.formateurId?.nom?.[0] || '')).toUpperCase() || '?'}</div>
                  <div className="fp-card-info">
                    <div className="fp-card-name">{p.formateurId?.prenom} {p.formateurId?.nom}</div>
                    <div className="fp-card-sub">
                      {p.leconTitre}{p.formationTitre ? ` — ${p.formationTitre}` : ''} · {p.mode === 'par_lecon' ? 'Per Lesson' : 'Fixed'}
                    </div>
                  </div>
                </div>
                <div className="fp-card-right">
                  <span className="fp-badge" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                  <span className="fp-amount">{p.montant} DT</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{new Date(p.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short' })}</span>
                  {p.statut === 'en_attente' && (
                    <>
                      <button className="fp-btn" onClick={() => handlePreview(p)} style={{ color: '#888' }}>
                        Preview
                      </button>
                      <button className="fp-btn fp-btn-pay" onClick={() => handlePayNow(p)} disabled={paySubmitting}>
                        {paySubmitting ? '...' : 'Pay Now'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Contract Modal */}
      {showModal && (
        <div className="fp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <div className="fp-modal-header">
              <h2 className="fp-modal-title">{editingContrat ? 'Edit Contract' : 'New Contract'}</h2>
              <button className="fp-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitContrat}>
              <div className="fp-modal-body">
                <div className="fp-form-group">
                  <label className="fp-form-label">Course</label>
                  <select className="fp-form-select" value={formData.formationId} onChange={e => handleFormationChange(e.target.value)} required>
                    <option value="">Select course...</option>
                    {myFormations.map(f => (
                      <option key={f._id} value={f._id}>{f.titre}</option>
                    ))}
                  </select>
                </div>
                <div className="fp-form-group">
                  <label className="fp-form-label">Formateur (skill matched)</label>
                  <div className="fp-formateur-list">
                    {!formData.formationId ? (
                      <div className="fp-formateur-placeholder">Select a course first</div>
                    ) : matchingFormateurs.length === 0 ? (
                      <div className="fp-formateur-placeholder">No formateurs with matching skills for this course</div>
                    ) : matchingFormateurs.map(f => {
                      const sel = formData.formateurId === f._id;
                      return (
                        <div key={f._id} className={`fp-formateur-item${sel ? ' selected' : ''}`} onClick={() => setFormData(d => ({ ...d, formateurId: f._id }))}>
                          <div className="fp-formateur-avatar">
                            {f.user_image
                              ? <img src={f.user_image.startsWith('http') ? f.user_image : `http://localhost:5000/${f.user_image}`} alt="" />
                              : (f.prenom?.[0] || f.nom?.[0] || '?').toUpperCase()
                            }
                          </div>
                          <div className="fp-formateur-info">
                            <div className="fp-formateur-name">
                              {f.prenom} {f.nom}
                              {f.matchCount > 0 && <span className="fp-formateur-match">{f.matchCount} match</span>}
                            </div>
                            <div className="fp-formateur-email">{f.email}</div>
                            {f.matchedSkills?.length > 0 && (
                              <div className="fp-formateur-skills">
                                {f.matchedSkills.map((sk, i) => (
                                  <span key={i} className="fp-formateur-skill">{sk}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button type="button" className="fp-formateur-profile-btn" onClick={e => { e.stopPropagation(); setProfileFormateur(f); }}>
                            Profile
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="fp-form-group">
                  <label className="fp-form-label">Centre</label>
                  <input className="fp-form-input" value={myFormations.find(f => f._id === formData.formationId)?.centreId?.nom || ''} disabled />
                </div>
                <input type="hidden" name="centreId" value={formData.centreId} />
                <div className="fp-form-group">
                  <label className="fp-form-label">Payment Mode</label>
                  <select className="fp-form-select" value={formData.mode} onChange={e => setFormData(d => ({ ...d, mode: e.target.value }))}>
                    <option value="par_lecon">Per Lesson</option>
                    <option value="montant_fixe">Fixed Amount</option>
                  </select>
                </div>
                {formData.mode === 'par_lecon' && (
                  <div className="fp-form-group">
                    <label className="fp-form-label">Price Per Lesson (DT)</label>
                    <input type="number" className="fp-form-input" value={formData.prixParLecon} onChange={e => setFormData(d => ({ ...d, prixParLecon: e.target.value }))} placeholder="e.g. 50" min="1" required />
                  </div>
                )}
                {formData.mode === 'montant_fixe' && (
                  <div className="fp-form-group">
                    <label className="fp-form-label">Fixed Amount (DT/month)</label>
                    <input type="number" className="fp-form-input" value={formData.montantFixe} onChange={e => setFormData(d => ({ ...d, montantFixe: e.target.value }))} placeholder="e.g. 500" min="1" required />
                  </div>
                )}
              </div>
              <div className="fp-modal-footer">
                <button type="button" className="fp-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="fp-btn-submit" disabled={submitting}>{submitting ? 'Saving...' : editingContrat ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileFormateur && (
        <div className="fp-modal-overlay" onClick={() => setProfileFormateur(null)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="fp-modal-header">
              <h2 className="fp-modal-title">Formateur Profile</h2>
              <button className="fp-modal-close" onClick={() => setProfileFormateur(null)}>&times;</button>
            </div>
            <div className="fp-modal-body" style={{ textAlign: 'center' }}>
              <div className="fp-profile-avatar">
                {profileFormateur.user_image
                  ? <img src={profileFormateur.user_image.startsWith('http') ? profileFormateur.user_image : `http://localhost:5000/${profileFormateur.user_image}`} alt="" />
                  : (profileFormateur.prenom?.[0] || profileFormateur.nom?.[0] || '?').toUpperCase()
                }
              </div>
              <div className="fp-profile-name">{profileFormateur.prenom} {profileFormateur.nom}</div>
              <div className="fp-profile-email">{profileFormateur.email}</div>
              {profileFormateur.specialite && (
                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{profileFormateur.specialite}</div>
              )}
              {profileFormateur.skills?.length > 0 && (
                <>
                  <div className="fp-profile-label">Skills</div>
                  <div className="fp-profile-skills" style={{ justifyContent: 'center' }}>
                    {profileFormateur.skills.map(s => (
                      <span key={s._id} className="fp-profile-skill">{s.name}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Formation Modal */}
      {showAssignModal && (
        <div className="fp-modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="fp-modal" onClick={e => e.stopPropagation()}>
            <div className="fp-modal-header">
              <h2 className="fp-modal-title">Assign to Course</h2>
              <button className="fp-modal-close" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <div className="fp-modal-body">
              {assignContrat && (
                <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
                  Assign <strong>{assignContrat.formateurId?.prenom} {assignContrat.formateurId?.nom}</strong> to courses
                  {assignContrat.centreId?.nom && <span> · Centre: <strong>{assignContrat.centreId.nom}</strong></span>}
                </p>
              )}
              <div className="fp-assign-list">
                {formations.length === 0 && <div className="fp-empty">No courses available for this centre.</div>}
                {formations.map(f => {
                  const isAssigned = f._alreadyAssigned;
                  const isSelected = selectedFormations.includes(f._id);
                  return (
                    <div
                      key={f._id}
                      className={`fp-assign-item ${isAssigned ? 'assigned' : isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isAssigned) return;
                        setSelectedFormations(prev =>
                          prev.includes(f._id) ? prev.filter(id => id !== f._id) : [...prev, f._id]
                        );
                      }}
                      style={isAssigned ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <div className="fp-assign-checkbox" style={isAssigned ? { background: '#888', borderColor: '#888' } : {}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span className="fp-assign-title">{f.titre}</span>
                      {isAssigned && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#888' }}>Already assigned</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="fp-modal-footer">
              <button type="button" className="fp-btn-cancel" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button
                type="button"
                className="fp-btn-submit"
                disabled={assignSubmitting || selectedFormations.length === 0}
                onClick={handleAssignFormations}
              >
                {assignSubmitting ? 'Assigning...' : `Assign (${selectedFormations.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewPayment && (
        <div className="fp-modal-overlay" onClick={() => { setPreviewPayment(null); setPreviewContents([]); }}>
          <div className="fp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="fp-modal-header">
              <h2 className="fp-modal-title">
                {previewPayment.leconTitre || 'Lesson Preview'}
                <span style={{ fontSize: 12, fontWeight: 400, color: '#888', marginLeft: 8 }}>
                  {previewPayment.formationTitre ? `— ${previewPayment.formationTitre}` : ''}
                </span>
              </h2>
              <button className="fp-modal-close" onClick={() => { setPreviewPayment(null); setPreviewContents([]); }}>&times;</button>
            </div>
            <div className="fp-modal-body" style={{ maxHeight: '70vh', overflow: 'auto', padding: 24 }}>
              {previewLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading content...</div>
              ) : previewContents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <div>No content added yet for this lesson.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {previewContents.map(c => (
                    <div key={c._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <path d={c.type === 'video' ? 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z' : c.type === 'image' ? 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' : c.type === 'file' ? 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' : c.type === 'test' ? 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' : 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'} />
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{c.title}</span>
                        <span style={{ fontSize: 11, padding: '2px 6px', background: 'rgba(200,168,110,0.1)', borderRadius: 4, color: '#c8a86e', textTransform: 'capitalize' }}>{c.type}</span>
                      </div>
                      {c.description && <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>{c.description}</p>}
                      {c.type === 'video' && c.url && (
                        <video src={getFullUrl(c.url)} controls style={{ width: '100%', maxHeight: 300, borderRadius: 8 }} />
                      )}
                      {c.type === 'image' && c.url && (
                        <img src={getFullUrl(c.url)} alt={c.title} style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
                      )}
                      {c.type === 'file' && c.url && (
                        <a href={getFullUrl(c.url)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(200,168,110,0.1)', border: '1px solid rgba(200,168,110,0.3)', borderRadius: 8, color: '#c8a86e', textDecoration: 'none', fontSize: 13 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Download {c.fileName || 'File'}
                        </a>
                      )}
                      {c.type === 'link' && c.url && (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(200,168,110,0.1)', border: '1px solid rgba(200,168,110,0.3)', borderRadius: 8, color: '#c8a86e', textDecoration: 'none', fontSize: 13 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          Open Link
                        </a>
                      )}
                      {c.type === 'test' && c.questions && (
                        <div style={{ fontSize: 13, color: '#888' }}>
                          {Array.isArray(c.questions) ? c.questions.length : 0} question(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="fp-modal-footer">
              <button type="button" className="fp-btn-cancel" onClick={() => { setPreviewPayment(null); setPreviewContents([]); }}>Close</button>
              {previewPayment.statut === 'en_attente' && (
                <button type="button" className="fp-btn-submit" onClick={() => { setPreviewPayment(null); setPreviewContents([]); handlePayNow(previewPayment); }}>
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ResponsableCFLayout>
  );
}
