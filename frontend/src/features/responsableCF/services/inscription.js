import client from '../../../services/client';

export const inscriptionService = {
  getAll:            ()         => client.get('/inscriptions'),
  getMyInscriptions: ()         => client.get('/inscriptions/me'),
  getCentreInscriptions: ()     => client.get('/inscriptions/centre'),
  getById:           (id)       => client.get(`/inscriptions/${id}`),
  create:            (data)     => client.post('/inscriptions', data),
  cancel:            (id)       => client.put(`/inscriptions/cancel/${id}`),
  reject:            (id)       => client.put(`/inscriptions/reject/${id}`),
  reactivate:        (id)       => client.put(`/inscriptions/reactivate/${id}`),
};

export const paiementService = {
  getAll:         ()         => client.get('/paiements'),
  getMyPaiements: ()         => client.get('/paiements/my-paiements'),
  getById:        (id)       => client.get(`/paiements/${id}`),
  confirm:        (id)       => client.post(`/paiements/confirm/${id}`),
  cancel:         (id)       => client.put(`/paiements/cancel/${id}`),
};
