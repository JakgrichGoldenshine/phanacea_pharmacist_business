import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Spinner from '../ui/Spinner';

// Blocks access to any /admin/* page until a valid staff session exists,
// and optionally to specific roles — mirrors the requireRole() gate
// enforced server-side, so a 'staff' account can never even land on a
// page whose API calls would just come back 403.
export default function RequireAdmin({ children, roles }) {
  const { staff, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <Spinner label="กำลังตรวจสอบสิทธิ์..." />;
  if (!staff) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(staff.role)) return <Navigate to="/admin" replace />;
  return children;
}
