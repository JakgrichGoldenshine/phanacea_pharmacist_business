import client from './client';

export const orderApi = {
  list: () => client.get('/orders').then((r) => r.data),
  getById: (id) => client.get(`/orders/${id}`).then((r) => r.data),
};
