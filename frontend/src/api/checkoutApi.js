import client from './client';

export const checkoutApi = {
  // Payment options come from the database (payment_methods), never from a
  // hardcoded list in the UI — ids must match what the server will accept.
  methods: () => client.get('/payment-methods').then((r) => r.data),
  submit: (payload) => client.post('/checkout', payload).then((r) => r.data),
};
