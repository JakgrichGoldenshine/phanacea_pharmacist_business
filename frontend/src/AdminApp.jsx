import React from 'react';
import { Routes, Route } from 'react-router-dom';

import RequireAdmin from './components/admin/RequireAdmin';
import AdminLayout from './components/admin/AdminLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminStock from './pages/admin/AdminStock';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminPos from './pages/admin/AdminPos';
import AdminShipments from './pages/admin/AdminShipments';
import AdminSupport from './pages/admin/AdminSupport';
import AdminChat from './pages/admin/AdminChat';
import AdminStaff from './pages/admin/AdminStaff';
import AdminAccount from './pages/admin/AdminAccount';
import AdminSupportDetail from './pages/admin/AdminSupportDetail';

// The back-office console — entirely separate identity (AdminAuthContext,
// provided above the router in main.jsx so the shared /login page can also
// reach it), entirely separate shell (AdminLayout, no storefront Header/Footer).
//
// This component is mounted at <Route path="/admin/*"> in App.jsx, so every
// path below is RELATIVE to "/admin" (React Router's nested-splat-route
// convention) — the index route resolves to "/admin" itself, and so on.
// Signing in happens at the top-level /login (see CustomerApp); every route
// here is wrapped in RequireAdmin, which sends signed-out visitors there.
export default function AdminApp() {
  return (
    <Routes>
      <Route
        index
        element={
          <RequireAdmin>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </RequireAdmin>
        }
      />
        <Route
          path="products"
          element={
            <RequireAdmin roles={['owner', 'pharmacist', 'assistant']}>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="products/new"
          element={
            <RequireAdmin roles={['owner', 'pharmacist', 'assistant']}>
              <AdminLayout>
                <AdminProductForm />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="products/:id"
          element={
            <RequireAdmin roles={['owner', 'pharmacist', 'assistant']}>
              <AdminLayout>
                <AdminProductForm />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="stock"
          element={
            <RequireAdmin roles={['owner', 'pharmacist', 'assistant']}>
              <AdminLayout>
                <AdminStock />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="orders"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminOrderDetail />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="pos"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminPos />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="shipments"
          element={
            <RequireAdmin roles={['owner', 'pharmacist', 'assistant']}>
              <AdminLayout>
                <AdminShipments />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        {/* Live chat is front-desk work, so every signed-in role can
            answer it (the API applies the same rule). */}
        <Route
          path="chat"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminChat />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        {/* Managing other people's access is owner-only. */}
        <Route
          path="staff"
          element={
            <RequireAdmin roles={['owner']}>
              <AdminLayout>
                <AdminStaff />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="account"
          element={
            <RequireAdmin>
              <AdminLayout>
                <AdminAccount />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="support"
          element={
            <RequireAdmin roles={['owner', 'pharmacist', 'assistant']}>
              <AdminLayout>
                <AdminSupport />
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="support/:id"
          element={
            <RequireAdmin roles={['owner', 'pharmacist', 'assistant']}>
              <AdminLayout>
                <AdminSupportDetail />
              </AdminLayout>
            </RequireAdmin>
          }
        />
    </Routes>
  );
}
