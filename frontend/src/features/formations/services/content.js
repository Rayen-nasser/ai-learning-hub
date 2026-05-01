import client from '../../../services/client';

export const avisService = {
  getAll:         ()         => client.get('/avis'),
  getMyReviews:   ()         => client.get('/avis/me'),
  getByFormation: (id)       => client.get(`/avis/formation/${id}`),
  getById:        (id)       => client.get(`/avis/${id}`),
  create:         (data)     => client.post('/avis', data),
  update:         (id, data) => client.put(`/avis/${id}`, data),
  delete:         (id)       => client.delete(`/avis/${id}`),
};

export const leconService = {
  getAll:        (params) => client.get('/lecons', { params }),
  getById:       (id)     => client.get(`/lecons/${id}`),
  getByFormation:(id)     => client.get('/lecons', { params: { formationId: id } }),
  create:        (data)   => client.post('/lecons', data),
  update:        (id, data) => client.put(`/lecons/${id}`, data),
  delete:        (id)     => client.delete(`/lecons/${id}`),
};

export const contentService = {
  getByLesson: (id)       => client.get(`/contents/lesson/${id}`),
  getById:     (id)       => client.get(`/contents/${id}`),
  create:      (data)     => client.post('/contents', data),
  update:      (id, data) => client.put(`/contents/${id}`, data),
  delete:      (id)       => client.delete(`/contents/${id}`),
  submitTest:  (id, data) => client.post(`/contents/${id}/submit`, data),
};
