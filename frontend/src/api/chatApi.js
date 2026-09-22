import client from './client';

export const chatApi = {
  // `after` is the id of the newest message already on screen; the server
  // then returns only what is new, which keeps polling cheap.
  get: (after) => client.get('/support/chat', { params: after ? { after } : {} }).then((r) => r.data),
  send: (message) => client.post('/support/chat/messages', { message }).then((r) => r.data),
};
