import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductsAll from './pages/ProductsAll';
import Product from './pages/Product';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart'; // New Import
import Checkout from './pages/Checkout'; // New Import
import Community from './pages/Community'; // New Import
import Dashboard from './pages/Dashboard'; // New Import
import ForgotPassword from './pages/ForgotPassword'; // New Import
import NewPost from './pages/NewPost'; // New Import
import PostDetail from './pages/PostDetail'; // New Import
import Profile from './pages/Profile'; // Already used, but for clarity
import SampleCheckout from './pages/SampleCheckout'; // New Import
import Samples from './pages/Samples'; // New Import
import Shop from './pages/Shop'; // New Import
import AboutUsPage from './pages/AboutUsPage'; // Added missing import
import AccountSettings from './pages/AccountSettings'; // Added missing import
import WishlistPage from './pages/WishlistPage'; // Added missing import
import ProductDetail from './pages/ProductDetail'; // Added missing import
import PerfumeFinder from './pages/PerfumeFinder';

import LayoutWithSidebar from './components/layout/LayoutWithSidebar';
import NavbarWrapper from './components/NavbarWrapper';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent = () => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <NavbarWrapper />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/all" element={<ProductsAll />} />
        <Route path="/product/:id" element={<Product />} />
  <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Public Forgot Password */}
  <Route path="/samples" element={<Samples />} /> {/* Public Samples page */}
  <Route path="/shop" element={<Shop />} /> {/* Public Shop page */}
  <Route path="/about" element={<AboutUsPage />} /> {/* Added missing About route */}
  <Route path="/collections" element={<Shop />} /> {/* Added Collections route - using Shop page for now */}
  <Route path="/chatbot" element={<PerfumeFinder />} /> {/* Chatbot public route */}

        {/* Protected routes wrapped with ProtectedRoute and LayoutWithSidebar */}
        <Route element={<ProtectedRoute><LayoutWithSidebar /></ProtectedRoute>}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<div>Orders Page</div>} /> {/* Placeholder */}
          <Route path="/wishlist" element={<WishlistPage />} /> {/* Fixed to use WishlistPage component */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/settings" element={<AccountSettings />} /> {/* Fixed to use AccountSettings page */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/new-post" element={<NewPost />} />
          <Route path="/post-detail/:id" element={<PostDetail />} /> {/* Assuming dynamic ID */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/sample-checkout" element={<SampleCheckout />} />
          <Route path="/product-detail/:id" element={<ProductDetail />} /> {/* Added ProductDetail route */}
        </Route>

        {/* Catch-all for unmatched routes - redirects to home if not logged in, or profile if logged in */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default AppContent;