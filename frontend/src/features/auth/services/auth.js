import client from '../../../services/client';

const authService = {
  register:       (data) => client.post('/users/register-with-image', data),
  login:          (data) => client.post('/users/login', data),
  logout:         ()     => client.post('/users/logout'),
  forgotPassword: (data) => client.post('/users/forgot-password', data),
  resetPassword:  (data) => client.post('/users/reset-password', data),
};

export default authService;