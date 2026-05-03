import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../services/admin';
import AdminLayout from '../components/AdminLayout';

export default function AdminStatistics() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [formationStats, setFormationStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [blockHistory, setBlockHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, formationRes, paymentRes, blockRes] = await Promise.all([
        adminService.getStats(),
        adminService.getFormationStats(),
        adminService.getPaiementStats(),
        adminService.getBlockHistory(),
      ]);
      setStats(statsRes.data.data);
      setFormationStats(formationRes.data.data);
      setPaymentStats(paymentRes.data.data);
      setBlockHistory(blockRes.data);
    } catch {
      setError(t('admin.failedLoadStatistics'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={`${t('admin.platform')} <em>${t('admin.statistics')}</em>`} subtitle={t('admin.platformPerformanceDesc')}>
      <style>{`
        .st-section { margin-bottom: 40px; }
        .st-section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; color: #f0ebe0; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }

        .st-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .st-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }
        .st-card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 8px; }
        .st-card-value { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; color: #b4915a; }
        .st-card-sub { font-size: 12px; color: #555; margin-top: 4px; }

        .st-table-wrap { overflow-x: auto; }
        .st-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .st-table th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .st-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }

        .st-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .st-badge-success { background: rgba(74,168,125,0.15); color: #4aa87d; }
        .st-badge-warning { background: rgba(200,168,110,0.15); color: #c8a86e; }
        .st-badge-info { background: rgba(106,159,216,0.15); color: #6a9fd8; }
        .st-badge-danger { background: rgba(224,112,112,0.15); color: #e07070; }

        .st-empty { text-align: center; padding: 40px; color: #555; }
        .st-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; margin-bottom: 20px; }
        .st-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #b4915a; animation: stspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes stspin { to { transform: rotate(360deg); } }
      `}</style>

      {error && <div className="st-error">{error}</div>}

          {loading ? (
            <div className="st-spinner" />
          ) : (
            <>
              <div className="st-section">
                <h2 className="st-section-title">{t('admin.overview')}</h2>
                <div className="st-grid">
                  <div className="st-card">
                    <div className="st-card-label">{t('admin.totalUsers')}</div>
                    <div className="st-card-value">{stats?.users?.total || 0}</div>
                    <div className="st-card-sub">{stats?.users?.active || 0} {t('admin.active')} · {stats?.users?.blocked || 0} {t('admin.blocked')}</div>
                  </div>
                  <div className="st-card">
                    <div className="st-card-label">{t('admin.totalFormations')}</div>
                    <div className="st-card-value">{stats?.formations?.total || 0}</div>
                    <div className="st-card-sub">{t('admin.availableCourses')}</div>
                  </div>
                  <div className="st-card">
                    <div className="st-card-label">{t('admin.totalEnrollments')}</div>
                    <div className="st-card-value">{stats?.enrollments?.total || 0}</div>
                    <div className="st-card-sub">{t('admin.courseEnrollments')}</div>
                  </div>
                  <div className="st-card">
                    <div className="st-card-label">{t('admin.totalRevenue')}</div>
                    <div className="st-card-value">{stats?.revenue?.total?.toLocaleString() || 0} DT</div>
                    <div className="st-card-sub">{t('admin.confirmedPayments')}</div>
                  </div>
                </div>
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.usersByRole')}</h2>
                <div className="st-grid">
                  {Object.entries(stats?.users?.byRole || {}).map(([role, count]) => (
                    <div key={role} className="st-card">
                      <div className="st-card-label">{role}</div>
                      <div className="st-card-value">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.blockHistory')}</h2>
                <div className="st-grid" style={{ marginBottom: '16px' }}>
                  <div className="st-card">
                    <div className="st-card-label">{t('admin.totalBlocks')}</div>
                    <div className="st-card-value" style={{ color: '#e07070' }}>{blockHistory?.stats?.blocked || 0}</div>
                  </div>
                  <div className="st-card">
                    <div className="st-card-label">{t('admin.totalUnblocks')}</div>
                    <div className="st-card-value">{blockHistory?.stats?.unblocked || 0}</div>
                  </div>
                </div>
                {blockHistory?.data?.length > 0 && (
                  <div className="st-table-wrap">
                    <table className="st-table">
                      <thead>
                        <tr>
                          <th>{t('admin.user')}</th>
                          <th>{t('admin.action')}</th>
                          <th>{t('admin.reason')}</th>
                          <th>{t('admin.byAdmin')}</th>
                          <th>{t('admin.date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blockHistory.data.slice(0, 5).map((h) => (
                          <tr key={h._id}>
                            <td>{h.user ? `${h.user.prenom} ${h.user.nom}` : t('admin.unknown')}</td>
                            <td>
                              <span className={`st-badge ${h.action === 'blocked' ? 'st-badge-danger' : 'st-badge-success'}`}>
                                {h.action}
                              </span>
                            </td>
                            <td style={{ color: '#888', fontSize: '13px' }}>{h.reason || '-'}</td>
                            <td>{h.admin ? `${h.admin.prenom} ${h.admin.nom}` : t('admin.unknown')}</td>
                            <td style={{ color: '#555', fontSize: '13px' }}>{new Date(h.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.topEarningFormations')}</h2>
                {formationStats?.topEarningFormations?.length > 0 ? (
                  <div className="st-table-wrap">
                    <table className="st-table">
                      <thead>
                        <tr>
                          <th>{t('admin.formation')}</th>
                          <th>{t('admin.price')}</th>
                          <th>{t('admin.revenue')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formationStats.topEarningFormations.map((f, i) => (
                          <tr key={i}>
                            <td>{f.titre}</td>
                            <td>{f.prix} DT</td>
                            <td><span className="st-badge st-badge-success">{f.revenue?.toLocaleString() || 0} DT</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="st-empty">{t('admin.noDataAvailable')}</div>
                )}
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.formationsByCentre')}</h2>
                {formationStats?.formationsPerCentre?.length > 0 ? (
                  <div className="st-table-wrap">
                    <table className="st-table">
                      <thead>
                        <tr>
                          <th>{t('admin.centre')}</th>
                          <th>{t('admin.formationsCount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formationStats.formationsPerCentre.map((c, i) => (
                          <tr key={i}>
                            <td>{c.centreNom || t('admin.unknown')}</td>
                            <td><span className="st-badge st-badge-info">{c.count}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="st-empty">{t('admin.noDataAvailable')}</div>
                )}
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.formationsByCategory')}</h2>
                {formationStats?.categoriesDistribution?.length > 0 ? (
                  <div className="st-table-wrap">
                    <table className="st-table">
                      <thead>
                        <tr>
                          <th>{t('admin.category')}</th>
                          <th>{t('admin.formationsCount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formationStats.categoriesDistribution.map((c, i) => (
                          <tr key={i}>
                            <td>{c.categorieNom || t('admin.unknown')}</td>
                            <td><span className="st-badge st-badge-info">{c.count}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="st-empty">{t('admin.noDataAvailable')}</div>
                )}
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.topEnrolledFormations')}</h2>
                {formationStats?.enrollmentsPerFormation?.length > 0 ? (
                  <div className="st-table-wrap">
                    <table className="st-table">
                      <thead>
                        <tr>
                          <th>{t('admin.formation')}</th>
                          <th>{t('admin.enrollments')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formationStats.enrollmentsPerFormation.map((f, i) => (
                          <tr key={i}>
                            <td>{f.formationTitre || t('admin.unknown')}</td>
                            <td><span className="st-badge st-badge-warning">{f.count}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="st-empty">{t('admin.noDataAvailable')}</div>
                )}
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.paymentStatistics')}</h2>
                <div className="st-grid">
                  <div className="st-card">
                    <div className="st-card-label">{t('admin.totalRevenue')}</div>
                    <div className="st-card-value">{paymentStats?.totalRevenue?.total?.toLocaleString() || 0} DT</div>
                    <div className="st-card-sub">{paymentStats?.totalRevenue?.count || 0} {t('admin.confirmedPaymentsLC')}</div>
                  </div>
                  <div className="st-card">
                    <div className="st-card-label">{t('admin.pendingPayments')}</div>
                    <div className="st-card-value" style={{color: '#c8a86e'}}>{paymentStats?.pendingPayments?.total?.toLocaleString() || 0} DT</div>
                    <div className="st-card-sub">{paymentStats?.pendingPayments?.count || 0} {t('admin.pendingPaymentsLC')}</div>
                  </div>
                </div>
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.revenueByCentre')}</h2>
                {paymentStats?.revenueByCentre?.length > 0 ? (
                  <div className="st-table-wrap">
                    <table className="st-table">
                      <thead>
                        <tr>
                          <th>{t('admin.centre')}</th>
                          <th>{t('admin.revenue')}</th>
                          <th>{t('admin.transactions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentStats.revenueByCentre.map((c, i) => (
                          <tr key={i}>
                            <td>{c.centreNom || t('admin.unknown')}</td>
                            <td><span className="st-badge st-badge-success">{c.total?.toLocaleString() || 0} DT</span></td>
                            <td>{c.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="st-empty">{t('admin.noDataAvailable')}</div>
                )}
              </div>

              <div className="st-section">
                <h2 className="st-section-title">{t('admin.recentPayments')}</h2>
                {paymentStats?.recentPayments?.length > 0 ? (
                  <div className="st-table-wrap">
                    <table className="st-table">
                      <thead>
                        <tr>
                          <th>{t('admin.apprenant')}</th>
                          <th>{t('admin.amount')}</th>
                          <th>{t('admin.status')}</th>
                          <th>{t('admin.date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentStats.recentPayments.map((p) => (
                          <tr key={p._id}>
                            <td>{p.apprenantNom} {p.apprenantPrenom}</td>
                            <td>{p.montant} DT</td>
                            <td>
                              <span className={`st-badge ${p.statut === 'confirmé' ? 'st-badge-success' : 'st-badge-warning'}`}>
                                {p.statut === 'confirmé' ? t('admin.confirmedStatus') : t('admin.pendingStatus')}
                              </span>
                            </td>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="st-empty">{t('admin.noRecentPayments')}</div>
                )}
              </div>
            </>
          )}
    </AdminLayout>
  );
}
