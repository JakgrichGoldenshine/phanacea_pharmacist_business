import staffClient from './staffClient';

// Login isn't here: staff now sign in through the same unified endpoint as
// customers (see api/authApi.js + pages/Login.jsx). POST /api/admin/auth/login
// still exists server-side for direct API use, just not called from the UI.
export const staffAuthApi = {
  logout: () => staffClient.post('/admin/auth/logout').then((r) => r.data),
  me: () => staffClient.get('/admin/auth/me').then((r) => r.data),
};
