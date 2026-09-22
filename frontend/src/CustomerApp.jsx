import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AmbientBackground from './components/layout/AmbientBackground';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import RequireCustomer from './components/RequireCustomer';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Account from './pages/Account';
import Support from './pages/Support';
import Chat from './pages/Chat';
import SupportDetail from './pages/SupportDetail';
import NotFound from './pages/NotFound';

// The customer-facing storefront shell — header/footer/background chrome
// plus every public + customer-authenticated page. Kept separate from
// AdminApp so the two experiences never share layout or route state.
export default function CustomerApp() {
  return (
    <div className="flex min-h-screen flex-col">
      <AmbientBackground />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          {/* Checkout POSTs to an authenticated endpoint, so the guard
              belongs here: without it a signed-out visitor could fill in
              the whole payment form and only fail at the last step. */}
          <Route
            path="/checkout"
            element={
              <RequireCustomer>
                <Checkout />
              </RequireCustomer>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/orders"
            element={
              <RequireCustomer>
                <Orders />
              </RequireCustomer>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireCustomer>
                <OrderDetail />
              </RequireCustomer>
            }
          />
          <Route
            path="/account"
            element={
              <RequireCustomer>
                <Account />
              </RequireCustomer>
            }
          />
          <Route
            path="/chat"
            element={
              <RequireCustomer>
                <Chat />
              </RequireCustomer>
            }
          />
          <Route
            path="/support"
            element={
              <RequireCustomer>
                <Support />
              </RequireCustomer>
            }
          />
          <Route
            path="/support/:id"
            element={
              <RequireCustomer>
                <SupportDetail />
              </RequireCustomer>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
