import client from '../../../services/client';

export const formateurPaymentService = {
  // Formateurs
  getFormateurs: () => client.get('/formateur-paiements/formateurs'),
  // Contracts
  getContrats: () => client.get('/formateur-paiements/contrats'),
  createContrat: (data) => client.post('/formateur-paiements/contrats', data),
  updateContrat: (id, data) => client.put(`/formateur-paiements/contrats/${id}`, data),
  deleteContrat: (id) => client.delete(`/formateur-paiements/contrats/${id}`),
  confirmContrat: (id) => client.put(`/formateur-paiements/contrats/${id}/confirm`),
  assignFormation: (id, formationId) => client.post(`/formateur-paiements/contrats/${id}/assign-formation`, { formationId }),
  getFormations: () => client.get('/formateur-paiements/formations'),

  // Payments
  getPayments: (params) => client.get('/formateur-paiements/payments', { params }),
  createPayment: (data) => client.post('/formateur-paiements/payments', data),
  payPayment: (id, data) => client.put(`/formateur-paiements/payments/${id}/pay`, data),
};
