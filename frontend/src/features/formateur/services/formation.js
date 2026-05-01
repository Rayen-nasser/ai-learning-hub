import client from '../../../services/client';

export const formationService = {
  getMyAssignments: () => client.get('/formations/my-assignments'),
  getById: (id) => client.get(`/formations/${id}`),
};
