import client from '../../../services/client';

const userService = {
  getAll: () => client.get('/users'),
  getById: (id) => client.get(`/users/${id}`),
  update: (id, userData) => client.put(`/users/${id}`, userData),
  delete: (id) => client.delete(`/users/${id}`),
  block: (id) => client.put(`/users/${id}/block`),
  unblock: (id) => client.put(`/users/${id}/unblock`),
  changeRole: (id, role) => client.put(`/users/${id}/role`, { role }),
};

export default userService;
