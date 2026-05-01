import client from '../../../services/client';

export const notificationService = {
  getAll: (params) => client.get('/notifications', { params }),
  
  getUnreadCount: () => client.get('/notifications/unread-count'),
  
  markAsRead: (id) => client.put(`/notifications/read/${id}`),
  
  markAllAsRead: () => client.put('/notifications/read-all'),
  
  delete: (id) => client.delete(`/notifications/delete/${id}`),
  
  deleteAll: () => client.delete('/notifications/delete-all'),
};
