import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const client = axios.create({ baseURL });

// Attach the JWT (if any) to every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('phanacea_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages so components can just read `err.message`.
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // An expired or revoked session must not leave a dead token in storage:
    // the customer would keep seeing "session expired" on every action with
    // no way out except clearing site data. The interceptor cannot call
    // React hooks, so it announces the event and AuthContext performs the
    // actual sign-out.
    if (status === 401 && localStorage.getItem('phanacea_token')) {
      localStorage.removeItem('phanacea_token');
      window.dispatchEvent(new CustomEvent('phanacea:session-expired'));
    }

    const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่';
    return Promise.reject({ ...error, message, code, status });
  }
);

export default client;
