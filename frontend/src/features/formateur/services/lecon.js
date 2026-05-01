import client from '../../../services/client';

export const leconService = {
  getAll: (params = {}) => client.get('/lecons', { params }),
  getById: (id) => client.get(`/lecons/${id}`),
  create: (data) => client.post('/lecons', data),
  update: (id, data) => client.post(`/lecons/${id}`, data),
  delete: (id) => client.delete(`/lecons/${id}`),
};
