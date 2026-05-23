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
  // Creation fee payment
  initiatePayment: (id, methodePaiement) => client.post(`/centres/${id}/pay`, { methodePaiement }),
  uploadProof: (id, formData) => client.post(`/centres/${id}/payment-proof`, formData),
  confirmPayment: (id) => client.patch(`/centres/${id}/confirm-payment`),
  getPaymentInfo: (id) => client.get(`/centres/${id}/payment-info`),
};
