import { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext.jsx';

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
