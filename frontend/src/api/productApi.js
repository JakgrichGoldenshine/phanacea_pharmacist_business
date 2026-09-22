import client from './client';

export const productApi = {
  list: (params) => client.get('/products', { params }).then((r) => r.data),
  getById: (id) => client.get(`/products/${id}`).then((r) => r.data),
  categories: () => client.get('/products/categories').then((r) => r.data),
  priceCheck: (items) => client.post('/products/price-check', { items }).then((r) => r.data),
};
