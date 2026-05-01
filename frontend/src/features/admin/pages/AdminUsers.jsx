import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/admin';
import AdminLayout from '../components/AdminLayout';

const ROLES = {
  apprenant: { label: 'Apprenant', color: '#6a9fd8', bg: 'rgba(106,159,216,.15)' },
  formateur: { label: 'Formateur', color: '#c8a86e', bg: 'rgba(200,168,110,.15)' },
  responsableCF: { label: 'Responsable CF', color: '#7dbf7d', bg: 'rgba(125,191,125,.15)' },
  admin: { label: 'Admin', color: '#e07070', bg: 'rgba(224,112,112,.15)' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getUsers(params);
      const data = res.data;
      setUsers(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlockToggle = async (userId, currentBlocked) => {
    setActionLoading(userId);
    try {
      if (currentBlocked) {
        await adminService.unblockUser(userId);
      } else {
        await adminService.blockUser(userId);
      }
      fetchUsers();
    } catch {
      setError(`Failed to ${currentBlocked ? 'unblock' : 'block'} user`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout title="User <em>Management</em>" subtitle="Manage platform users">
      <style>{`
        .au-controls { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
        .au-search { flex: 1; min-width: 200px; }
        .au-search input { width: 100%; padding: 10px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #e8e4dc; font-size: 14px; font-family: 'DM Sans', sans-serif; }
        .au-search input:focus { border-color: #b4915a; outline: none; }
        .au-search input::placeholder { color: #555; }
        
        .au-select { padding: 10px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #e8e4dc; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .au-select:focus { border-color: #b4915a; outline: none; }
        
        .au-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        
        .au-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px; transition: all 0.2s; }
        .au-card:hover { border-color: rgba(255,255,255,0.1); }
        .au-card.blocked { opacity: 0.6; border-color: rgba(224,112,112,0.2); }
        
        .au-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .au-avatar { width: 48px; height: 48px; border-radius: 50%; background: rgba(180,145,90,0.15); display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #b4915a; overflow: hidden; }
        .au-avatar img { width: 100%; height: 100%; object-fit: cover; }
        
        .au-card-info { flex: 1; min-width: 0; }
        .au-card-name { font-weight: 500; font-size: 15px; color: #f0ebe0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .au-card-email { font-size: 12px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .au-card-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .au-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        
        .au-card-meta { font-size: 12px; color: #555; margin-bottom: 14px; }
        
        .au-card-actions { display: flex; gap: 8px; }
        .au-btn { flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); background: transparent; font-family: 'DM Sans', sans-serif; }
        .au-btn-block { color: #e07070; border-color: rgba(224,112,112,0.3); }
        .au-btn-block:hover { background: rgba(224,112,112,0.1); }
        .au-btn-unblock { color: #7dbf7d; border-color: rgba(125,191,125,0.3); }
        .au-btn-unblock:hover { background: rgba(125,191,125,0.1); }
        .au-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .au-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .au-pagination-info { font-size: 13px; color: #555; }
        .au-pagination-controls { display: flex; gap: 8px; }
        .au-page-btn { padding: 8px 16px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #888; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .au-page-btn:hover:not(:disabled) { border-color: #b4915a; color: #b4915a; }
        .au-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .au-page-btn.active { background: rgba(180,145,90,0.15); border-color: #b4915a; color: #b4915a; }
        
        .au-empty { text-align: center; padding: 60px 20px; color: #555; }
        .au-error { padding: 12px 16px; background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.3); border-radius: 10px; color: #e07070; font-size: 14px; margin-bottom: 20px; }
        .au-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.06); border-top-color: #b4915a; animation: aspin 0.8s linear infinite; margin: 60px auto; display: block; }
        @keyframes aspin { to { transform: rotate(360deg); } }
        
        @media (max-width: 640px) {
          .au-grid { grid-template-columns: 1fr; }
          .au-controls { flex-direction: column; }
          .au-search { min-width: 100%; }
        }
      `}</style>

      <div className="au-controls">
        <div className="au-search">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="au-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="apprenant">Apprenant</option>
          <option value="formateur">Formateur</option>
          <option value="responsableCF">Responsable CF</option>
          <option value="admin">Admin</option>
        </select>
        <select className="au-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {error && <div className="au-error">{error}</div>}

      {loading ? (
        <div className="au-spinner" />
      ) : users.length === 0 ? (
        <div className="au-empty">No users found</div>
      ) : (
        <>
          <div className="au-grid">
            {users.map(user => (
              <div key={user._id} className={`au-card ${user.block ? 'blocked' : ''}`}>
                <div className="au-card-header">
                  <div className="au-avatar">
                    {user.image ? <img src={user.image} alt="" /> : `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`}
                  </div>
                  <div className="au-card-info">
                    <div className="au-card-name">{user.prenom} {user.nom}</div>
                    <div className="au-card-email">{user.email}</div>
                  </div>
                </div>
                <div className="au-card-badges">
                  <span className="au-badge" style={ROLES[user.role] || ROLES.apprenant}>
                    {ROLES[user.role]?.label || user.role}
                  </span>
                  {user.block && <span className="au-badge" style={{ background: 'rgba(224,112,112,.15)', color: '#e07070' }}>Blocked</span>}
                  {user.statut === 'en_attente' && <span className="au-badge" style={{ background: 'rgba(200,168,110,.15)', color: '#c8a86e' }}>Pending</span>}
                </div>
                <div className="au-card-meta">
                  {user.telephone && <span>{user.telephone}</span>}
                  {user.dateCreation && <span> &middot; Joined {new Date(user.dateCreation).toLocaleDateString()}</span>}
                </div>
                <div className="au-card-actions">
                  {user.block ? (
                    <button
                      className="au-btn au-btn-unblock"
                      onClick={() => handleBlockToggle(user._id, true)}
                      disabled={actionLoading === user._id}
                    >
                      {actionLoading === user._id ? 'Unblocking...' : 'Unblock'}
                    </button>
                  ) : (
                    <button
                      className="au-btn au-btn-block"
                      onClick={() => handleBlockToggle(user._id, false)}
                      disabled={actionLoading === user._id || user.role === 'admin'}
                    >
                      {actionLoading === user._id ? 'Blocking...' : 'Block'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="au-pagination">
              <div className="au-pagination-info">
                Showing {users.length} of {total} users
              </div>
              <div className="au-pagination-controls">
                <button
                  className="au-page-btn"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      className={`au-page-btn ${page === pg ? 'active' : ''}`}
                      onClick={() => setPage(pg)}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  className="au-page-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
