import React, { createContext, useCallback, useEffect, useState } from 'react';
import { staffAuthApi } from '../api/staffAuthApi';

export const AdminAuthContext = createContext(null);

// Deliberately separate from AuthContext (customer auth) — different
// storage key, different API base path, different token — so a staff
// session and a customer session can never collide or leak into each other.
export function AdminAuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('phanacea_staff_token');
    if (!token) {
      setLoading(false);
      return;
    }
    staffAuthApi
      .me()
      .then((res) => setStaff(res.data))
      .catch(() => localStorage.removeItem('phanacea_staff_token'))
      .finally(() => setLoading(false));
  }, []);

  // Mirrors AuthContext: staffClient clears the revoked token and fires
  // this event, and RequireAdmin then redirects to /login.
  useEffect(() => {
    const handleExpiry = () => setStaff(null);
    window.addEventListener('phanacea:staff-session-expired', handleExpiry);
    return () => window.removeEventListener('phanacea:staff-session-expired', handleExpiry);
  }, []);

  // Called by the shared /login page with the token + profile the unified
  // login endpoint already returned — mirrors AuthContext.loginWithToken,
  // see there for why neither context calls the login API itself anymore.
  const loginWithToken = useCallback((token, loggedInStaff) => {
    localStorage.setItem('phanacea_staff_token', token);
    setStaff(loggedInStaff);
  }, []);

  const logout = useCallback(async () => {
    try {
      await staffAuthApi.logout();
    } finally {
      localStorage.removeItem('phanacea_staff_token');
      setStaff(null);
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ staff, loading, loginWithToken, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
