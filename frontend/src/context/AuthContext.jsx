import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { authApi } from '../api/authApi';
import { setOwner } from '../redux/cartSlice';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('phanacea_token');
    if (!token) {
      dispatch(setOwner(null)); // no session — guest basket
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data);
        dispatch(setOwner(res.data.id)); // restore this account's own basket
      })
      .catch(() => {
        localStorage.removeItem('phanacea_token');
        dispatch(setOwner(null));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The axios interceptor clears the dead token and announces this event;
  // here is where the React side of the session is torn down so the UI
  // immediately reflects being signed out.
  useEffect(() => {
    const handleExpiry = () => {
      setUser(null);
      dispatch(setOwner(null));
    };
    window.addEventListener('phanacea:session-expired', handleExpiry);
    return () => window.removeEventListener('phanacea:session-expired', handleExpiry);
  }, [dispatch]);

  // Called by the shared /login page once it already has a token + profile
  // back from the unified login endpoint (see pages/Login.jsx) — this
  // context doesn't call the API itself, since that one endpoint also
  // covers staff accounts and only the caller knows which one came back.
  const loginWithToken = useCallback(
    (token, loggedInUser) => {
      localStorage.setItem('phanacea_token', token);
      setUser(loggedInUser);
      // Switch to this account's own basket — a different (or brand-new)
      // account always starts from empty, never the previous session's cart.
      dispatch(setOwner(loggedInUser.id));
    },
    [dispatch]
  );

  const register = useCallback(async (payload) => authApi.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('phanacea_token');
      setUser(null);
      dispatch(setOwner(null)); // back to the guest basket
    }
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
