import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../services/admin';
import AdminLayout from '../components/AdminLayout';

const ITEMS_PER_PAGE = 10;

export default function AdminDashboard() {
  const { t } = useTranslation();
  
  const ROLES = {
    apprenant: { label: t('admin.apprenantRole'), color: '#6a9fd8', bg: 'rgba(106,159,216,.15)' },
    formateur: { label: t('admin.formateurRole'), color: '#c8a86e', bg: 'rgba(200,168,110,.15)' },
    responsableCF: { label: t('admin.responsableCFRole'), color: '#7dbf7d', bg: 'rgba(125,191,125,.15)' },
    admin: { label: t('admin.adminRole'), color: '#e07070', bg: 'rgba(224,112,112,.15)' },
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({ total: 0, apprenant: 0, formateur: 0, responsableCF: 0, admin: 0, blocked: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      const data = res.data.data;
      setStats({
        total: data.users?.total || 0,
        apprenant: data.users?.byRole?.apprenant || 0,
        formateur: data.users?.byRole?.formateur || 0,
        responsableCF: data.users?.byRole?.responsableCF || 0,
        admin: data.users?.byRole?.admin || 0,
        blocked: data.users?.blocked || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        limit: ITEMS_PER_PAGE,
      };
      if (filter !== 'all') params.role = filter;
      if (search) params.search = search;

      const res = await adminService.getUsers(params);
      const data = res.data;
      setUsers(data.data || []);
      setPagination({
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.pages || 1,
        total: data.pagination?.total || 0,
      });
    } catch {
      setError(t('admin.failedLoadUsers'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filter, search]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [filter, search]);

  const handleBlock = async (userId) => {
    setActionLoading(userId);
    try {
      await adminService.blockUser(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, block: true } : u));
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.failedBlock'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (userId) => {
    setActionLoading(userId);
    try {
      await adminService.unblockUser(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, block: false } : u));
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.failedUnblock'));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users;

  return (
    <AdminLayout title={`${t('admin.user')} <em>${t('admin.management')}</em>`} subtitle={t('admin.manageUsersDesc')}>
      <style>{`
        .au-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .au-stat { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 12px; padding: 16px 20px; }
        .au-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 400; color: #b4915a; }
        .au-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-top: 4px; }

        .au-filters { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; align-items: center; }
        .au-search { flex: 1; min-width: 200px; padding: 10px 16px; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; }
        .au-search:focus { border-color: #b4915a; }
        .au-search::placeholder { color: #555; }

        .au-tabs { display: flex; gap: 4px; background: var(--bg-card); border-radius: 8px; padding: 4px; }
        .au-tab { padding: 8px 16px; border: none; background: transparent; color: #555; font-size: 13px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .au-tab:hover { color: #888; }
        .au-tab.active { background: rgba(180,145,90,0.15); color: #b4915a; }
        .au-tab-count { margin-left: 6px; opacity: 0.7; }

        .au-table-wrap { overflow-x: auto; }
        .au-table { width: 100%; border-collapse: collapse; }
        .au-table th { text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; border-bottom: 1px solid var(--border-main); }
        .au-table td { padding: 14px 16px; border-bottom: 1px solid var(--bg-card); font-size: 14px; }
        .au-table tr:hover td { background: var(--bg-card); }

        .au-user-cell { display: flex; align-items: center; gap: 12px; }
        .au-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(180,145,90,0.15); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #b4915a; overflow: hidden; }
        .au-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .au-user-name { font-weight: 500; color: var(--text-primary); }
        .au-user-email { font-size: 12px; color: #555; }

        .au-role-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }

        .au-blocked { opacity: 0.5; }
        .au-blocked-label { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: rgba(224,112,112,0.15); color: #e07070; border-radius: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }

        .au-actions { display: flex; gap: 6px; }
        .au-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); background: transparent; font-family: 'DM Sans', sans-serif; }
        .au-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .au-btn-block { color: #c8a86e; }
        .au-btn-block:hover:not(:disabled) { background: rgba(200,168,110,0.15); }
        .au-btn-unblock { color: #4aa87d; }
        .au-btn-unblock:hover:not(:disabled) { background: rgba(74,168,125,0.15); }

        .au-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 8px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .au-empty { text-align: center; padding: 60px 20px; color: #555; font-size: 14px; }
        .au-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border-main); border-top-color: #b4915a; animation: auspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes auspin { to { transform: rotate(360deg); } }

        .au-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-main); flex-wrap: wrap; gap: 12px; }
        .au-pagination-info { font-size: 13px; color: #555; }
        .au-pagination-controls { display: flex; gap: 8px; }
        .au-page-btn { padding: 8px 16px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #888; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .au-page-btn:hover:not(:disabled) { border-color: #b4915a; color: #b4915a; }
        .au-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .au-page-btn.active { background: rgba(180,145,90,0.15); border-color: #b4915a; color: #b4915a; }
      `}</style>

      <div className="au-stats">
        <div className="au-stat"><div className="au-stat-val">{stats.total}</div><div className="au-stat-label">{t('admin.totalUsers')}</div></div>
        <div className="au-stat"><div className="au-stat-val">{stats.apprenant}</div><div className="au-stat-label">{t('admin.apprenants')}</div></div>
        <div className="au-stat"><div className="au-stat-val">{stats.formateur}</div><div className="au-stat-label">{t('admin.formateurs')}</div></div>
        <div className="au-stat"><div className="au-stat-val">{stats.responsableCF}</div><div className="au-stat-label">{t('admin.respCF')}</div></div>
        <div className="au-stat"><div className="au-stat-val">{stats.admin}</div><div className="au-stat-label">{t('admin.admins')}</div></div>
        <div className="au-stat"><div className="au-stat-val" style={{color: '#e07070'}}>{stats.blocked}</div><div className="au-stat-label">{t('admin.blocked')}</div></div>
      </div>

      {error && <div className="au-error">{error}</div>}

      <div className="au-filters">
        <input
          type="text"
          className="au-search"
          placeholder={t('admin.searchUsers')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="au-tabs">
          <button className={`au-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            {t('common.all')} <span className="au-tab-count">{stats.total}</span>
          </button>
          <button className={`au-tab ${filter === 'apprenant' ? 'active' : ''}`} onClick={() => setFilter('apprenant')}>
            {t('admin.apprenants')} <span className="au-tab-count">{stats.apprenant}</span>
          </button>
          <button className={`au-tab ${filter === 'formateur' ? 'active' : ''}`} onClick={() => setFilter('formateur')}>
            {t('admin.formateurs')} <span className="au-tab-count">{stats.formateur}</span>
          </button>
          <button className={`au-tab ${filter === 'responsableCF' ? 'active' : ''}`} onClick={() => setFilter('responsableCF')}>
            {t('admin.respCF')} <span className="au-tab-count">{stats.responsableCF}</span>
          </button>
          <button className={`au-tab ${filter === 'admin' ? 'active' : ''}`} onClick={() => setFilter('admin')}>
            {t('admin.admins')} <span className="au-tab-count">{stats.admin}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="au-spinner" />
      ) : filteredUsers.length === 0 ? (
        <div className="au-empty">{t('admin.noUsersFound')}</div>
      ) : (
        <>
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th>{t('admin.userTh')}</th>
                  <th>{t('admin.roleTh')}</th>
                  <th>{t('admin.statusTh')}</th>
                  <th>{t('admin.actionsTh')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className={user.block ? 'au-blocked' : ''}>
                    <td>
                      <div className="au-user-cell">
                        <div className="au-avatar">
                          {user.user_image ? (
                            <img src={user.user_image.startsWith('http') ? user.user_image : `http://localhost:5000/${user.user_image}`} alt="" />
                          ) : (
                            (user.nom?.[0] || user.prenom?.[0] || user.email?.[0] || '?').toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="au-user-name">{user.nom} {user.prenom}</div>
                          <div className="au-user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="au-role-badge"
                        style={{
                          color: ROLES[user.role]?.color,
                          background: ROLES[user.role]?.bg
                        }}
                      >
                        {ROLES[user.role]?.label || user.role}
                      </span>
                    </td>
                    <td>
                      {user.block ? (
                        <span className="au-blocked-label">{t('admin.blocked')}</span>
                      ) : (
                        <span style={{ color: '#4aa87d', fontSize: 12 }}>{t('admin.active')}</span>
                      )}
                    </td>
                    <td>
                      <div className="au-actions">
                        {user.block ? (
                          <button
                            className="au-btn au-btn-unblock"
                            onClick={() => handleUnblock(user._id)}
                            disabled={actionLoading === user._id}
                          >
                            {t('admin.unblockBtn')}
                          </button>
                        ) : (
                          <button
                            className="au-btn au-btn-block"
                            onClick={() => handleBlock(user._id)}
                            disabled={actionLoading === user._id}
                          >
                            {t('admin.blockBtn')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="au-pagination">
              <div className="au-pagination-info">
                {t('admin.showing')} {(pagination.page - 1) * ITEMS_PER_PAGE + 1} {t('admin.to')} {Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} {t('admin.of')} {pagination.total} {t('admin.users')}
              </div>
              <div className="au-pagination-controls">
                <button 
                  className="au-page-btn" 
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  {t('admin.previous')}
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`au-page-btn ${pagination.page === page ? 'active' : ''}`}
                    onClick={() => setPagination(p => ({ ...p, page }))}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="au-page-btn" 
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
    </AdminLayout>
  );
}
