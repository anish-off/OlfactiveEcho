import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Products from './pages/Products';
import Shop from './pages/Shop';
import ProductsAll from './pages/ProductsAll';
import Product from './pages/Product';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart'; // New Import
import Checkout from './pages/Checkout'; // New Import
import Community from './pages/Community'; // New Import
import Dashboard from './pages/Dashboard'; // New Import
import ForgotPassword from './pages/ForgotPassword'; // New Import
import ResetPassword from './pages/ResetPassword'; // New Import
import NewPost from './pages/NewPost'; // New Import
import PostDetail from './pages/PostDetail'; // New Import
import Profile from './pages/Profile'; // Already used, but for clarity
import SampleCheckout from './pages/SampleCheckout'; // New Import
import Samples from './pages/Samples'; // New Import
import AboutUsPage from './pages/AboutUsPage'; // Added missing import
import AccountSettings from './pages/AccountSettings'; // Added missing import
import WishlistPage from './pages/WishlistPage'; // Added missing import
import PerfumeFinder from './pages/PerfumeFinder';
import Orders from './pages/Orders';
import OrderConfirmation from './components/order/OrderConfirmation';
import ScentMatcher from './pages/ScentMatcher';

import LayoutWithSidebar from './components/layout/LayoutWithSidebar';
import NavbarWrapper from './components/NavbarWrapper';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import UserOnlyRoute from './components/UserOnlyRoute';

// Import Advanced Offer Components
import AdvancedOffersBanner from './components/discount/AdvancedOffersBanner';
import OfferNotificationPanel from './components/discount/OfferNotificationPanel';

const AppContent = () => {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();
  
  return (
    <>
      <ScrollToTop />
      <NavbarWrapper />
      
      {/* Advanced Offers Banner - Show on main pages only */}
      {location.pathname === '/' && <AdvancedOffersBanner isCompact={true} showAll={false} />}
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isLoggedIn ? (user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/" />) : <Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={isLoggedIn ? (user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/" />) : <Register />} />
        <Route path="/" element={<UserOnlyRoute><Home /></UserOnlyRoute>} />
        <Route path="/products" element={<UserOnlyRoute><Products /></UserOnlyRoute>} />
        <Route path="/product/:id" element={<UserOnlyRoute><Product /></UserOnlyRoute>} />
        <Route path="/forgot-password" element={isLoggedIn ? <Navigate to="/" /> : <ForgotPassword />} />
        <Route path="/reset-password/:token" element={isLoggedIn ? <Navigate to="/" /> : <ResetPassword />} /> 
        <Route path="/samples" element={<UserOnlyRoute><Samples /></UserOnlyRoute>} /> 
        <Route path="/shop" element={<UserOnlyRoute><Shop /></UserOnlyRoute>} />
        <Route path="/about" element={<UserOnlyRoute><AboutUsPage /></UserOnlyRoute>} /> 
        <Route path="/collections" element={<UserOnlyRoute><ProductsAll /></UserOnlyRoute>} /> 
        <Route path="/chatbot" element={<UserOnlyRoute><PerfumeFinder /></UserOnlyRoute>} /> 
        <Route path="/scent-matcher" element={<UserOnlyRoute><ScentMatcher /></UserOnlyRoute>} /> 

        {/* Protected routes wrapped with ProtectedRoute and LayoutWithSidebar */}
        <Route element={<ProtectedRoute><LayoutWithSidebar /></ProtectedRoute>}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} /> 
          <Route path="/wishlist" element={<WishlistPage />} /> 
          <Route path="/cart" element={<Cart />} />
          <Route path="/settings" element={<AccountSettings />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/new-post" element={<NewPost />} />
          <Route path="/post-detail/:id" element={<PostDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/sample-checkout" element={<SampleCheckout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Route>

        {/* Admin routes - protected with AdminRoute */}
        <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Floating Offer Notification Panel - Show on all user pages */}
      {isLoggedIn && user?.role !== 'admin' && <OfferNotificationPanel />}
    </>
  );
};

export default AppContent;