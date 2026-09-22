import client from './client';

export const supportApi = {
  list: () => client.get('/support').then((r) => r.data),
  getById: (id) => client.get(`/support/${id}`).then((r) => r.data),
  create: (payload) => client.post('/support', payload).then((r) => r.data),
  addMessage: (id, message) => client.post(`/support/${id}/messages`, { message }).then((r) => r.data),
};
