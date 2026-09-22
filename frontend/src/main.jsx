import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './App.jsx';
import { store } from './redux/store.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import './assets/index.css';

// Both auth providers are mounted here, above the router, rather than one
// inside AdminApp only — the single /login page (frontend/src/pages/Login.jsx)
// needs to reach whichever one the unified login response turns out to be for,
// regardless of which side of the app the visitor started on.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
