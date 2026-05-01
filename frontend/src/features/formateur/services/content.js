import client from '../../../services/client';

export const contentService = {
  getByLesson: (leconId) => client.get(`/contents/lesson/${leconId}`),
  getById: (id) => client.get(`/contents/${id}`),
  create: (data) => client.post('/contents', data),
  update: (id, data) => client.post(`/contents/${id}`, data),
  delete: (id) => client.delete(`/contents/${id}`),
};
