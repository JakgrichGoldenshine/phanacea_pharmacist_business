import client from './client';

export const authApi = {
  register: (payload) => client.post('/auth/register', payload).then((r) => r.data),
  login: (payload) => client.post('/auth/login', payload).then((r) => r.data),
  // 404s unless the backend has DEMO_LOGIN_ENABLED=true — see pages/Login.jsx.
  demoLogin: (payload) => client.post('/auth/demo-login', payload).then((r) => r.data),
  logout: () => client.post('/auth/logout').then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
};
