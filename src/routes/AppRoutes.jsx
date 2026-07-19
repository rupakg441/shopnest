import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import Home from '../pages/Home/Home';
import Products from '../pages/Products/Products';
import ProductDetails from '../pages/ProductDetails/ProductDetails';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Checkout/Checkout';
import Auth from '../pages/Auth/Auth';
import Dashboard from '../pages/Account/Dashboard';
import AdminConsole from '../pages/Admin/AdminConsole';
import OrderConfirmed from '../pages/OrderConfirmed/OrderConfirmed';
import NotFound from '../pages/NotFound/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Front Shop Layout routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="order-confirmed" element={<OrderConfirmed />} />
        {/* Fallback routing */}
        <Route path="profile" element={<Navigate to="/account" replace />} />
      </Route>

      {/* Account & Admin Layout routes */}
      <Route path="/account" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminConsole />} />
      </Route>

      {/* Standalone pages (without main navigation header/footer) */}
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth defaultView="register" />} />

      {/* 404 handler */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
