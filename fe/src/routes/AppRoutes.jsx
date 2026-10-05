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
import CategoryManager from '../pages/Admin/CategoryManager';
import ReviewManager from '../pages/Admin/ReviewManager';
import InventoryManager from '../pages/Admin/InventoryManager';
import CouponManager from '../pages/Admin/CouponManager';
import CMSManager from '../pages/Admin/CMSManager';
import SettingsManager from '../pages/Admin/SettingsManager';
import CMSPage from '../pages/CMSPage';
import OrderConfirmed from '../pages/OrderConfirmed/OrderConfirmed';
import NotFound from '../pages/NotFound/NotFound';
import LearnUseMemoHook from '../pages/Practice/LearnUseMemo'
import AIAssistantPage from '../pages/AIAssistant/AIAssistantPage';
import ProtectedRoute from './ProtectedRoute';
import { ForgotPassword, ResetPassword, VerifyEmail } from '../pages/Auth/AuthActions';
import KnowledgeBaseTab from '../pages/Admin/KnowledgeBaseTab';
import AIAnalyticsTab from '../pages/Admin/AIAnalyticsTab';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Front Shop Layout routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="pages/:slug" element={<CMSPage />} />
        <Route path="cart" element={<Cart />} />
        <Route path="order-confirmed" element={<OrderConfirmed />} />
        {/* Fallback routing */}
        <Route path="profile" element={<Navigate to="/account" replace />} />
      </Route>

      {/* Account & Admin Layout routes */}
      <Route path="/account" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute roles={['admin', 'superadmin']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminConsole />} />
        <Route path="orders" element={<AdminConsole />} />
        <Route path="customers" element={<AdminConsole />} />
        <Route path="analytics" element={<AdminConsole />} />
        <Route path="settings" element={<SettingsManager />} />
        <Route path="products" element={<AdminConsole />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="reviews" element={<ReviewManager />} />
        <Route path="inventory" element={<InventoryManager />} />
        <Route path="coupons" element={<CouponManager />} />
        <Route path="cms" element={<CMSManager />} />
        <Route path="knowledge-base" element={<KnowledgeBaseTab />} />
        <Route path="ai-analytics" element={<AIAnalyticsTab />} />
      </Route>

      {/* Standalone pages (without main navigation header/footer) */}
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/login" element={<Auth />} />
      <Route path="/admin/login" element={<Auth adminMode />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/practice" element={<LearnUseMemoHook />} />

      <Route path="/register" element={<Auth defaultView="register" />} />

      {/* 404 handler */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
