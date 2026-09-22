import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// A dedicated axios instance for the admin panel — attaches the STAFF
// token (never the customer token) so the two identities can never be
// mixed up on shared axios defaults.
const staffClient = axios.create({ baseURL });

staffClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('phanacea_staff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

staffClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    // Same reasoning as the customer client: a revoked staff session (for
    // example after an owner resets this account's password) should send
    // the person back to the login screen rather than leaving a token that
    // fails every request.
    if (status === 401 && localStorage.getItem('phanacea_staff_token')) {
      localStorage.removeItem('phanacea_staff_token');
      window.dispatchEvent(new CustomEvent('phanacea:staff-session-expired'));
    }

    const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่';
    return Promise.reject({ ...error, message, code: error.response?.data?.code, status });
  }
);

export default staffClient;
