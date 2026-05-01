import client from '../../../services/client';

export const centreService = {
  getAll: () => client.get('/centres'),
  getMyCentres: () => client.get('/centres/my-centres'),
  getMyStats: () => client.get('/centres/my-stats'),
  getById: (id) => client.get(`/centres/${id}`),
  getFormateurCentres: (userId) => client.get(`/centres/formateur/${userId}`),
  create: (data) => client.post('/centres', data),
  update: (id, data) => client.put(`/centres/${id}`, data),
  delete: (id) => client.delete(`/centres/${id}`),
};
