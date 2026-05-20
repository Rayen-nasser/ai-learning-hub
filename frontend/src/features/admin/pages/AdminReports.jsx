import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import client from '../../../services/client';
import AdminLayout from '../components/AdminLayout';

const STATUS_COLORS = {
  pending: { color: '#c8a86e', bg: 'rgba(200,168,110,.15)' },
  reviewed: { color: '#6a9fd8', bg: 'rgba(106,159,216,.15)' },
  resolved: { color: '#4aa87d', bg: 'rgba(74,168,125,.15)' },
  dismissed: { color: '#888', bg: 'rgba(136,136,136,.15)' },
};

const TYPE_LABELS = {
  user: 'User',
  formation: 'Formation',
  centre: 'Centre',
  formateur: 'Formateur',
};

const getActionOptions = (t) => [
  { value: '', label: t('admin.noAction') },
  { value: 'block', label: t('admin.blockTarget') },
  { value: 'delete', label: t('admin.deleteAction') },
  { value: 'hide', label: t('admin.hideAction') },
  { value: 'suspend', label: t('admin.suspendAction') },
  { value: 'warn', label: t('admin.warnUserAction') },
];

export default function AdminReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState({ status: '', action: '', reviewNote: '' });
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, resolved: 0, dismissed: 0 });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pagination.page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;

      const res = await client.get('/reports', { params });
      setReports(res.data.data || []);
      setPagination({
        page: res.data.pagination?.page || 1,
        totalPages: res.data.pagination?.pages || 1,
        total: res.data.pagination?.total || 0,
      });
    } catch {
      setError(t('admin.failedLoadReports'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, typeFilter]);

  const fetchStats = async () => {
    try {
      const allRes = await client.get('/reports', { params: { status: 'pending', limit: 1 } });
      const reviewedRes = await client.get('/reports', { params: { status: 'reviewed', limit: 1 } });
      const resolvedRes = await client.get('/reports', { params: { status: 'resolved', limit: 1 } });
      const dismissedRes = await client.get('/reports', { params: { status: 'dismissed', limit: 1 } });
      
      setStats({
        pending: allRes.data.pagination?.total || 0,
        reviewed: reviewedRes.data.pagination?.total || 0,
        resolved: resolvedRes.data.pagination?.total || 0,
        dismissed: dismissedRes.data.pagination?.total || 0,
      });
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [statusFilter, typeFilter]);

  const handleViewReport = async (reportId) => {
    try {
      const res = await client.get(`/reports/${reportId}`);
      setSelectedReport(res.data.data);
      setReviewData({ status: 'reviewed', action: '', reviewNote: '' });
    } catch {
      setError(t('admin.failedLoadReportDetails'));
    }
  };

  const handleReview = async () => {
    if (!selectedReport || !reviewData.status) return;
    setReviewLoading(true);
    try {
      await client.put(`/reports/${selectedReport._id}/review`, {
        status: reviewData.status,
        action: reviewData.action,
        reviewNote: reviewData.reviewNote,
      });
      setSelectedReport(null);
      fetchReports();
      fetchStats();
    } catch {
      setError(t('admin.failedReviewReport'));
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <AdminLayout title={`${t('admin.reported')} <em>${t('admin.content')}</em>`} subtitle={t('admin.reviewManageReports')}>
      <style>{`
        .rp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 32px; }
        .rp-stat { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .rp-stat:hover { border-color: rgba(255,255,255,0.15); }
        .rp-stat.active { border-color: #b4915a; }
        .rp-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; color: #b4915a; }
        .rp-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-top: 4px; }

        .rp-filters { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
        .rp-select { padding: 10px 16px; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--text-primary); font-size: 14px; cursor: pointer; }
        .rp-select:focus { border-color: #b4915a; outline: none; }
        .rp-select option, .rp-form-select option { background: #121215; color: var(--text-primary); }

        .rp-table-wrap { overflow-x: auto; }
        .rp-table { width: 100%; border-collapse: collapse; }
        .rp-table th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; border-bottom: 1px solid var(--border-main); }
        .rp-table td { padding: 14px 16px; border-bottom: 1px solid var(--bg-card); font-size: 14px; }
        .rp-table tr:hover td { background: var(--bg-card); cursor: pointer; }

        .rp-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .rp-type-user { background: rgba(106,159,216,.15); color: #6a9fd8; }
        .rp-type-formation { background: rgba(180,145,90,.15); color: #b4915a; }
        .rp-type-centre { background: rgba(125,191,125,.15); color: #7dbf7d; }
        .rp-type-formateur { background: rgba(200,168,110,.15); color: #c8a86e; }

        .rp-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); background: transparent; font-family: 'DM Sans', sans-serif; }
        .rp-btn-primary { background: rgba(180,145,90,0.15); border-color: #b4915a; color: #b4915a; }
        .rp-btn-primary:hover { background: rgba(180,145,90,0.25); }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rp-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-main); }
        .rp-pagination-info { font-size: 13px; color: #555; }
        .rp-pagination-controls { display: flex; gap: 8px; }
        .rp-page-btn { padding: 8px 16px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #888; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .rp-page-btn:hover:not(:disabled) { border-color: #b4915a; color: #b4915a; }
        .rp-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rp-page-btn.active { background: rgba(180,145,90,0.15); border-color: #b4915a; color: #b4915a; }

        .rp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .rp-modal { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .rp-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-main); }
        .rp-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; color: var(--text-primary); }
        .rp-modal-close { background: none; border: none; color: #555; cursor: pointer; font-size: 24px; padding: 4px; }
        .rp-modal-close:hover { color: var(--text-primary); }
        .rp-modal-body { padding: 24px; }
        .rp-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid var(--border-main); }

        .rp-detail-section { margin-bottom: 20px; }
        .rp-detail-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 6px; }
        .rp-detail-value { font-size: 15px; color: var(--text-primary); }
        .rp-detail-value.warning { color: #c8a86e; }

        .rp-reporters { background: var(--bg-card); border-radius: 12px; padding: 16px; margin-top: 16px; }
        .rp-reporter-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--bg-card); }
        .rp-reporter-item:last-child { border-bottom: none; }
        .rp-reporter-name { font-weight: 500; }
        .rp-reporter-meta { font-size: 12px; color: #555; }

        .rp-form-group { margin-bottom: 16px; }
        .rp-form-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin-bottom: 8px; }
        .rp-form-input, .rp-form-textarea, .rp-form-select { width: 100%; padding: 10px 14px; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--text-primary); font-size: 14px; font-family: 'DM Sans', sans-serif; }
        .rp-form-textarea { min-height: 100px; resize: vertical; }
        .rp-form-input:focus, .rp-form-textarea:focus, .rp-form-select:focus { border-color: #b4915a; outline: none; }

        .rp-empty { text-align: center; padding: 60px 20px; color: #555; font-size: 14px; }
        .rp-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .rp-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border-main); border-top-color: #b4915a; animation: rspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes rspin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="rp-root">
        <div className="max-w-7xl mx-auto">
          <div className="rp-header">
            <h1 className="rp-title">{t('admin.reported')} <em>{t('admin.content')}</em></h1>
            <p className="rp-subtitle">{t('admin.reviewManageReports')}</p>
          </div>

          {error && <div className="rp-error">{error}</div>}

          <div className="rp-stats">
            {Object.entries(stats).map(([status, count]) => (
              <div
                key={status}
                className={`rp-stat ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                <div className="rp-stat-val" style={{ color: STATUS_COLORS[status]?.color }}>{count}</div>
                <div className="rp-stat-label">{t(`admin.${status}Status`)}</div>
              </div>
            ))}
          </div>

          <div className="rp-filters">
            <select
              className="rp-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">{t('admin.allStatuses')}</option>
              <option value="pending">{t('admin.pendingStatus')}</option>
              <option value="reviewed">{t('admin.reviewedStatus')}</option>
              <option value="resolved">{t('admin.resolvedStatus')}</option>
              <option value="dismissed">{t('admin.dismissedStatus')}</option>
            </select>
            <select
              className="rp-select"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">{t('admin.allTypes')}</option>
              <option value="user">{t('admin.usersType')}</option>
              <option value="formation">{t('admin.formationsType')}</option>
              <option value="centre">{t('admin.centresType')}</option>
              <option value="formateur">{t('admin.formateursType')}</option>
            </select>
          </div>

          {loading ? (
            <div className="rp-spinner" />
          ) : reports.length === 0 ? (
            <div className="rp-empty">{t('admin.noReportsFound')}</div>
          ) : (
            <>
              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>{t('admin.type')}</th>
                      <th>{t('admin.target')}</th>
                      <th>{t('admin.reason')}</th>
                      <th>{t('admin.reportsCount')}</th>
                      <th>{t('admin.status')}</th>
                      <th>{t('admin.date')}</th>
                      <th>{t('admin.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report._id} onClick={() => handleViewReport(report._id)}>
                        <td>
                          <span className={`rp-badge rp-type-${report.type}`}>
                            {TYPE_LABELS[report.type] || report.type}
                          </span>
                        </td>
                        <td>
                          {report.targetInfo ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                {report.targetInfo.nom ? `${report.targetInfo.prenom} ${report.targetInfo.nom}` : report.targetInfo.titre || report.targetInfo.nom || 'N/A'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#555' }}>
                                {report.targetInfo.email || report.targetInfo.adresse || ''}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#555' }}>{t('admin.unknown')}</span>
                          )}
                        </td>
                        <td style={{ color: '#888' }}>{report.reason}</td>
                        <td>
                          <span className="rp-badge" style={{ background: 'rgba(180,145,90,.15)', color: '#b4915a' }}>
                            {report.reportsCount}
                          </span>
                        </td>
                        <td>
                          <span
                            className="rp-badge"
                            style={{ background: STATUS_COLORS[report.status]?.bg, color: STATUS_COLORS[report.status]?.color }}
                          >
                            {t(`admin.${report.status}Status`)}
                          </span>
                        </td>
                        <td style={{ color: '#555', fontSize: '13px' }}>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          {report.status === 'pending' && (
                            <button
                              className="rp-btn rp-btn-primary"
                              onClick={() => handleViewReport(report._id)}
                            >
                              {t('admin.review')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="rp-pagination">
                  <div className="rp-pagination-info">
                    {t('admin.showing')} {reports.length} {t('admin.of')} {pagination.total} {t('admin.reports')}
                  </div>
                  <div className="rp-pagination-controls">
                    <button
                      className="rp-page-btn"
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      {t('admin.previous')}
                    </button>
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          className={`rp-page-btn ${pagination.page === page ? 'active' : ''}`}
                          onClick={() => setPagination(p => ({ ...p, page }))}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      className="rp-page-btn"
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      {t('admin.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="rp-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="rp-modal" onClick={e => e.stopPropagation()}>
            <div className="rp-modal-header">
              <h2 className="rp-modal-title">{t('admin.reviewReport')}</h2>
              <button className="rp-modal-close" onClick={() => setSelectedReport(null)}>&times;</button>
            </div>
            <div className="rp-modal-body">
              <div className="rp-detail-section">
                <div className="rp-detail-label">{t('admin.type')}</div>
                <div className="rp-detail-value">
                  <span className={`rp-badge rp-type-${selectedReport.type}`}>
                    {TYPE_LABELS[selectedReport.type]}
                  </span>
                </div>
              </div>

              <div className="rp-detail-section">
                <div className="rp-detail-label">{t('admin.reportedTarget')}</div>
                <div className="rp-detail-value">
                  {selectedReport.targetInfo?.nom ? `${selectedReport.targetInfo.prenom} ${selectedReport.targetInfo.nom}` : selectedReport.targetInfo?.titre || 'N/A'}
                </div>
                {selectedReport.targetInfo?.email && (
                  <div style={{ fontSize: '13px', color: '#555' }}>{selectedReport.targetInfo.email}</div>
                )}
              </div>

              <div className="rp-detail-section">
                <div className="rp-detail-label">{t('admin.reason')}</div>
                <div className="rp-detail-value warning">{selectedReport.reason}</div>
                {selectedReport.description && (
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{selectedReport.description}</div>
                )}
              </div>

              <div className="rp-detail-section">
                <div className="rp-detail-label">{t('admin.reporters')} ({selectedReport.reporters?.length || 0})</div>
                <div className="rp-reporters">
                  {selectedReport.reporters?.map((r, i) => (
                    <div key={i} className="rp-reporter-item">
                      <div>
                        <div className="rp-reporter-name">{r.prenom} {r.nom}</div>
                        <div className="rp-reporter-meta">{r.email} &middot; {r.role}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#888' }}>{r.reason}</div>
                        <div style={{ fontSize: '11px', color: '#555' }}>{new Date(r.reportedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.status === 'pending' && (
                <>
                  <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '20px', marginTop: '20px' }}>
                    <div className="rp-form-group">
                      <label className="rp-form-label">{t('admin.action')}</label>
                      <select
                        className="rp-form-select"
                        value={reviewData.status}
                        onChange={e => setReviewData(d => ({ ...d, status: e.target.value }))}
                      >
                        <option value="">{t('admin.selectAction')}</option>
                        <option value="reviewed">{t('admin.markAsReviewed')}</option>
                        <option value="resolved">{t('admin.resolveTakeAction')}</option>
                        <option value="dismissed">{t('admin.dismissReport')}</option>
                      </select>
                    </div>

                    {reviewData.status === 'resolved' && (
                      <div className="rp-form-group">
                        <label className="rp-form-label">{t('admin.actionToTake')}</label>
                        <select
                          className="rp-form-select"
                          value={reviewData.action}
                          onChange={e => setReviewData(d => ({ ...d, action: e.target.value }))}
                        >
                          {getActionOptions(t).map(a => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="rp-form-group">
                      <label className="rp-form-label">{t('admin.reviewNote')}</label>
                      <textarea
                        className="rp-form-textarea"
                        placeholder={t('admin.addReviewNote')}
                        value={reviewData.reviewNote}
                        onChange={e => setReviewData(d => ({ ...d, reviewNote: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedReport.status !== 'pending' && selectedReport.review && (
                <div style={{ borderTop: '1px solid var(--border-main)', paddingTop: '20px', marginTop: '20px' }}>
                  <div className="rp-detail-section">
                    <div className="rp-detail-label">{t('admin.reviewedBy')}</div>
                    <div className="rp-detail-value">
                      {selectedReport.review.reviewedBy?.prenom} {selectedReport.review.reviewedBy?.nom}
                    </div>
                  </div>
                  {selectedReport.review.action && (
                    <div className="rp-detail-section">
                      <div className="rp-detail-label">{t('admin.actionTaken')}</div>
                      <div className="rp-detail-value warning">{selectedReport.review.action}</div>
                    </div>
                  )}
                  {selectedReport.review.reviewNote && (
                    <div className="rp-detail-section">
                      <div className="rp-detail-label">{t('admin.reviewNote')}</div>
                      <div className="rp-detail-value">{selectedReport.review.reviewNote}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedReport.status === 'pending' && (
              <div className="rp-modal-footer">
                <button className="rp-btn" onClick={() => setSelectedReport(null)}>{t('common.cancel')}</button>
                <button
                  className="rp-btn rp-btn-primary"
                  onClick={handleReview}
                  disabled={!reviewData.status || reviewLoading}
                >
                  {reviewLoading ? t('admin.submitting') : t('admin.submitReview')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
