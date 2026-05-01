import client from '../../../services/client';

const formationService = {
  getAll:        (params) => client.get('/formations', { params }),
  getById:      (id)     => client.get(`/formations/${id}`),
  getByCentre:  (id)     => client.get('/formations', { params: { centreId: id } }),
  getByCategorie: (id)    => client.get('/formations', { params: { categorieId: id } }),
  create:        (data)    => client.post('/formations', data),
  update:        (id, data) => client.put(`/formations/${id}`, data),
  delete:        (id)     => client.delete(`/formations/${id}`),
};

export default formationService;