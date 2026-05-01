import client from '../../../services/client';

const centreService = {
  getAll: () => client.get('/centres'),
  getById: (id) => client.get(`/centres/${id}`),
  create: (data) => client.post('/centres', data),
  update: (id, data) => client.put(`/centres/${id}`, data),
  delete: (id) => client.delete(`/centres/${id}`),
  
  // Verification System Endpoints
  getRequirements: () => client.get('/centres/requirements'),
  getMyCentres: () => client.get('/centres/my-centres'),
  updateDocuments: (id, data) => client.patch(`/centres/${id}/documents`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Admin Endpoints
  getAdminAll: () => client.get('/centres/admin/all'),
  getPending: (statuses) => client.get(`/centres/admin/pending${statuses ? `?status=${statuses}` : ''}`),
  approve: (id) => client.patch(`/centres/admin/approve/${id}`),
  reject: (id, adminMessage) => client.patch(`/centres/admin/reject/${id}`, { adminMessage }),
  updateDocumentStatus: (id, docId, status) => client.patch(`/centres/admin/${id}/document-status`, { docId, status }),
  
  // Private Document View
  getDocumentUrl: (id, docId) => `${client.defaults.baseURL}/centres/${id}/documents/${docId}`,
};

export default centreService;