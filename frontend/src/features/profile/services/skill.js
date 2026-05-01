import client from '../../../services/client';

const skillService = {
  getAll: () => client.get('/skills'),
  create: (data) => client.post('/skills', data),
  update: (id, data) => client.put(`/skills/${id}`, data),
  delete: (id) => client.delete(`/skills/${id}`),
};

export default skillService;
