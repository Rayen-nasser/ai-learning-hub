import client from '../../../services/client';

export const inscriptionService = {
  getAll:            ()         => client.get('/inscriptions'),
  getMyInscriptions: ()         => client.get('/inscriptions/me'),
  getById:           (id)       => client.get(`/inscriptions/${id}`),
  create:            (data)     => client.post('/inscriptions', data),
  cancel:            (id)       => client.put(`/inscriptions/cancel/${id}`),
};

export const paiementService = {
  getAll:         ()         => client.get('/paiements'),
  getMyPaiements: ()         => client.get('/paiements/me'),
  getById:        (id)       => client.get(`/paiements/${id}`),
  create:         (data)     => client.post('/paiements', data),
  confirm:        (id)       => client.put(`/paiements/${id}/confirm`),
  cancel:         (id)       => client.put(`/paiements/${id}/cancel`),
  uploadProof:    (id, formData) => client.post(`/paiements/${id}/upload-proof`, formData),
};

export const favoriService = {
  getAll:        ()         => client.get('/favoris'),
  getMyFavoris:  ()         => client.get('/favoris/me'),
  getByApprenant:(id)       => client.get(`/favoris/apprenant/${id}`),
  add:           (data)     => client.post('/favoris', data),
  remove:        (id)       => client.delete(`/favoris/${id}`),
};
