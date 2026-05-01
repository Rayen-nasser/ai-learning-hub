import client from '../../../services/client';

const adminService = {
  getStats: () => client.get('/admin/stats'),
  getFormationStats: () => client.get('/admin/formations/stats'),
  getPaiementStats: () => client.get('/admin/paiements/stats'),
  getUsers: (params = {}) => client.get('/admin/users', { params }),
  getUserById: (id) => client.get(`/admin/users/${id}`),
  blockUser: (id, data = {}) => client.put(`/admin/users/${id}/block`, data),
  unblockUser: (id) => client.put(`/admin/users/${id}/unblock`),
  getBlockHistory: (params = {}) => client.get('/admin/block-history', { params }),
  getReportUsers: (days = 7) => client.get('/admin/reports/users', { params: { days } }),
  getReportEnrollments: (days = 7) => client.get('/admin/reports/enrollments', { params: { days } }),
  getReportRevenue: (days = 30) => client.get('/admin/reports/revenue', { params: { days } }),
};

export default adminService;
