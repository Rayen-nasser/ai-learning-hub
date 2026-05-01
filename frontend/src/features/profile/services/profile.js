import client from '../../../services/client';

const profileService = {
  changePassword: (data) => client.post('/users/change-password', data),
  getProfile:     ()     => client.get('/users/me'),
  updateProfile:  (id, data) => client.put(`/users/${id}`, data),
  deleteAccount:  (id)   => client.delete(`/users/${id}`),
};

export default profileService;