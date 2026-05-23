import client from '../../../services/client';

export const paymentService = {
  getCentrePayments: () => client.get('/paiements/centre'),
  confirm:           (id) => client.put(`/paiements/${id}/confirm`),
  cancel:            (id) => client.put(`/paiements/${id}/cancel`),
  uploadProof:       (id, formData) => client.post(`/paiements/${id}/upload-proof`, formData),
};
