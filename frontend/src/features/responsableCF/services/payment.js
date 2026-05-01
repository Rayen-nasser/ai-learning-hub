import client from '../../../services/client';

export const paymentService = {
  getAll: () => client.get('/paiements'),
  getMyPayments: () => client.get('/paiements/me'),
  getCentrePayments: () => client.get('/paiements/centre'),
  getById: (id) => client.get(`/paiements/${id}`),
  create: (data) => client.post('/paiements', data),
  confirm: (id) => client.put(`/paiements/${id}/confirm`),
  cancel: (id) => client.put(`/paiements/${id}/cancel`),
  delete: (id) => client.delete(`/paiements/${id}`),
};
