import React from 'react';
import { Routes, Route } from 'react-router-dom';

import CustomerApp from './CustomerApp';
import AdminApp from './AdminApp';

// Top-level switch between the two completely separate experiences:
// the public storefront (customer auth, cart, checkout) and the
// back-office console (staff auth, product/stock/order management).
export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<CustomerApp />} />
    </Routes>
  );
}
